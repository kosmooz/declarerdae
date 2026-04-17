import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BlogService } from "./blog.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { ListArticlesQueryDto } from "./dto/list-articles-query.dto";

@Controller("blog")
export class BlogController {
  constructor(private blogService: BlogService) {}

  // ─── Public ─────────────────────────────────────────────────────────

  @Get("public/articles")
  getPublishedArticles(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("category") category?: string,
  ) {
    return this.blogService.getPublishedArticles(
      parseInt(page || "1", 10),
      parseInt(limit || "12", 10),
      category,
    );
  }

  @Get("public/articles/:slug")
  getPublishedArticle(@Param("slug") slug: string) {
    return this.blogService.getPublishedArticleBySlug(slug);
  }

  @Get("public/categories")
  getPublicCategories() {
    return this.blogService.getPublicCategories();
  }

  // ─── Admin: Categories ──────────────────────────────────────────────

  @Get("admin/categories")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  listCategories() {
    return this.blogService.listCategories();
  }

  @Post("admin/categories")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.blogService.createCategory(dto);
  }

  @Patch("admin/categories/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateCategory(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.blogService.updateCategory(id, dto);
  }

  @Delete("admin/categories/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteCategory(@Param("id") id: string) {
    return this.blogService.deleteCategory(id);
  }

  // ─── Admin: Articles ────────────────────────────────────────────────

  @Get("admin/articles")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  listArticles(@Query() query: ListArticlesQueryDto) {
    return this.blogService.listArticles(query);
  }

  @Get("admin/articles/preview/:slug")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  previewArticle(@Param("slug") slug: string) {
    return this.blogService.getArticleBySlug(slug);
  }

  @Get("admin/articles/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getArticle(@Param("id") id: string) {
    return this.blogService.getArticle(id);
  }

  @Post("admin/articles")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createArticle(@Req() req: any, @Body() dto: CreateArticleDto) {
    return this.blogService.createArticle(req.user.id, dto);
  }

  @Patch("admin/articles/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateArticle(@Param("id") id: string, @Body() dto: UpdateArticleDto) {
    return this.blogService.updateArticle(id, dto);
  }

  @Delete("admin/articles/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteArticle(@Param("id") id: string) {
    return this.blogService.deleteArticle(id);
  }
}
