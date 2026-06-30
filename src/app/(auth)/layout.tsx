import { redirect } from "next/navigation";
import PageBg from "@/components/layout/pageBackground";
import { getCurrentUser } from "@/server/auth/getCurrentUser";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/landing?reason=already-authenticated");
  }

  return (
    <div>
      <PageBg />

      <main>{children}</main>
    </div>
  );
}
