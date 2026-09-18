import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { apiResponse } from "@/types/apiResponse";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return apiResponse(401, {
      success: false,
      message: "Unauthorized",
    });
  }

  return apiResponse(200, {
    success: true,
    data: {
      user: currentUser.user,
      type: currentUser.type,
    },
  });
}
