import { getCurrentUser } from "@/server/auth/getUser";
import { UnauthorizedError } from "@/server/errors/unauthorized";

export async function requiredUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new UnauthorizedError();
  }

  return currentUser;
}
