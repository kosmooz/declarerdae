import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BlogArticleStatus } from "@prisma/client";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { ListArticlesQueryDto } from "./dto/list-articles-query.dto";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function computeReadingTime(content: any[]): number {
  let wordCount = 0;
  for (const block of content) {
    if (!block || !block.data) continue;
    switch (block.type) {
      case "paragraph":
        wordCount += stripHtml(block.data.html || "").split(/\s+/).length;
        break;
      case "heading":
        wordCount += (block.data.text || "").split(/\s+/).length;
        break;
      case "quote":
        wordCount += stripHtml(block.data.text || "").split(/\s+/).length;
        break;
      case "list":
        for (const item of block.data.items || []) {
          wordCount += stripHtml(item).split(/\s+/).length;
        }
        break;
      case "alert":
        wordCount += stripHtml(block.data.text || "").split(/\s+/).length;
        if (block.data.title)
          wordCount += block.data.title.split(/\s+/).length;
        break;
      case "table":
        for (const row of block.data.rows || []) {
          for (const cell of row) {
            wordCount += (cell || "").split(/\s+/).length;
          }
        }
        break;
      case "cta":
        wordCount += stripHtml(block.data.text || "").split(/\s+/).length;
        wordCount += (block.data.title || "").split(/\s+/).length;
        break;
    }
  }
  return Math.max(1, Math.ceil(wordCount / 200));
}

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  // ─── Categories ─────────────────────────────────────────────────────

  async listCategories() {
    return this.prisma.blogCategory.findMany({
      orderBy: { position: "asc" },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.blogCategory.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException("Ce slug est déjà utilisé");
    }
    return this.prisma.blogCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.blogCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException("Catégorie introuvable");
    }
    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.prisma.blogCategory.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException("Ce slug est déjà utilisé");
      }
    }
    return this.prisma.blogCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.blogCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException("Catégorie introuvable");
    }
    await this.prisma.blogArticleCategory.deleteMany({
      where: { categoryId: id },
    });
    return this.prisma.blogCategory.delete({ where: { id } });
  }

  // ─── Articles (Admin) ──────────────────────────────────────────────

  async listArticles(query: ListArticlesQueryDto) {
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "20", 10);
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const where: any = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { excerpt: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.status) {
      where.status = query.status as BlogArticleStatus;
    }

    if (query.categoryId) {
      where.categories = {
        some: { categoryId: query.categoryId },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.blogArticle.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          status: true,
          readingTime: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          categories: {
            select: {
              category: {
                select: { id: true, name: true, slug: true, color: true },
              },
            },
          },
        },
      }),
      this.prisma.blogArticle.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        categories: item.categories.map((c) => c.category),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getArticle(id: string) {
    const article = await this.prisma.blogArticle.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        categories: {
          select: {
            category: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
      },
    });
    if (!article) {
      throw new NotFoundException("Article introuvable");
    }
    return {
      ...article,
      categories: article.categories.map((c) => c.category),
    };
  }

  async createArticle(authorId: string, dto: CreateArticleDto) {
    const existing = await this.prisma.blogArticle.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException("Ce slug est déjà utilisé");
    }

    const readingTime = computeReadingTime(dto.content || []);
    const publishedAt =
      dto.status === "PUBLISHED" ? new Date() : undefined;

    const article = await this.prisma.blogArticle.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        featuredImage: dto.featuredImage,
        content: dto.content,
        status: (dto.status as BlogArticleStatus) || "DRAFT",
        authorId,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        readingTime,
        publishedAt,
        categories: dto.categoryIds?.length
          ? {
              createMany: {
                data: dto.categoryIds.map((categoryId) => ({ categoryId })),
              },
            }
          : undefined,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        categories: {
          select: {
            category: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
      },
    });

    return {
      ...article,
      categories: article.categories.map((c) => c.category),
    };
  }

  async updateArticle(id: string, dto: UpdateArticleDto) {
    const article = await this.prisma.blogArticle.findUnique({
      where: { id },
    });
    if (!article) {
      throw new NotFoundException("Article introuvable");
    }

    if (dto.slug && dto.slug !== article.slug) {
      const existing = await this.prisma.blogArticle.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException("Ce slug est déjà utilisé");
      }
    }

    const content = dto.content ?? (article.content as any[]);
    const readingTime = computeReadingTime(content);

    let publishedAt = article.publishedAt;
    if (dto.status === "PUBLISHED" && !article.publishedAt) {
      publishedAt = new Date();
    }

    // Update categories if provided
    if (dto.categoryIds !== undefined) {
      await this.prisma.blogArticleCategory.deleteMany({
        where: { articleId: id },
      });
      if (dto.categoryIds.length > 0) {
        await this.prisma.blogArticleCategory.createMany({
          data: dto.categoryIds.map((categoryId) => ({
            articleId: id,
            categoryId,
          })),
        });
      }
    }

    const updated = await this.prisma.blogArticle.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.featuredImage !== undefined && {
          featuredImage: dto.featuredImage,
        }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.status !== undefined && {
          status: dto.status as BlogArticleStatus,
        }),
        ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
        ...(dto.metaDescription !== undefined && {
          metaDescription: dto.metaDescription,
        }),
        readingTime,
        publishedAt,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        categories: {
          select: {
            category: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
      },
    });

    return {
      ...updated,
      categories: updated.categories.map((c) => c.category),
    };
  }

  async deleteArticle(id: string) {
    const article = await this.prisma.blogArticle.findUnique({
      where: { id },
    });
    if (!article) {
      throw new NotFoundException("Article introuvable");
    }
    return this.prisma.blogArticle.delete({ where: { id } });
  }

  async getArticleBySlug(slug: string) {
    const article = await this.prisma.blogArticle.findFirst({
      where: { slug },
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
        categories: {
          select: {
            category: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
      },
    });
    if (!article) {
      throw new NotFoundException("Article introuvable");
    }
    return {
      ...article,
      categories: article.categories.map((c) => c.category),
    };
  }

  // ─── Public ─────────────────────────────────────────────────────────

  async getPublishedArticles(
    page = 1,
    limit = 12,
    categorySlug?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { status: "PUBLISHED" };
    if (categorySlug) {
      where.categories = {
        some: { category: { slug: categorySlug } },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.blogArticle.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          readingTime: true,
          publishedAt: true,
          author: {
            select: { firstName: true, lastName: true },
          },
          categories: {
            select: {
              category: {
                select: { id: true, name: true, slug: true, color: true },
              },
            },
          },
        },
      }),
      this.prisma.blogArticle.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        categories: item.categories.map((c) => c.category),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPublishedArticleBySlug(slug: string) {
    const article = await this.prisma.blogArticle.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        author: {
          select: { firstName: true, lastName: true },
        },
        categories: {
          select: {
            category: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
      },
    });
    if (!article) {
      throw new NotFoundException("Article introuvable");
    }
    return {
      ...article,
      categories: article.categories.map((c) => c.category),
    };
  }

  async getPublicCategories() {
    return this.prisma.blogCategory.findMany({
      where: {
        articles: { some: { article: { status: "PUBLISHED" } } },
      },
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        _count: { select: { articles: true } },
      },
    });
  }
}
