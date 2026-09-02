import { redirect } from "next/navigation";
import PageBg from "@/components/layout/pageBackground";
import { getCurrentUser } from "@/server/auth/getCurrentUser";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?reason=unauthorized");
  }

  return (
    <div>
      <PageBg />
      <main>{children}</main>
    </div>
  );
}
