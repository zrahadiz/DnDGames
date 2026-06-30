import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PageBg from "@/components/layout/pageBackground";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PageBg />
      <Header />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
