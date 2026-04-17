import Header from "@/components/declarerdae/Header";
import Footer from "@/components/declarerdae/Footer";
import DashboardShell from "./DashboardShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <DashboardShell>{children}</DashboardShell>
      </main>
      <Footer />
    </div>
  );
}
