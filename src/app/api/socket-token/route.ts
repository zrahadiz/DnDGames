import { createSocketToken } from "@/lib/socket-auth";
import { apiResponse } from "@/types/apiResponse";
import { requiredUser } from "@/server/auth/requiredUser";
import { UnauthorizedError } from "@/server/errors/unauthorized";
import { rateLimits } from "@/lib/rate-limit";

export async function GET() {
  try {
    const currentUser = await requiredUser();

    const { success } = await rateLimits.socketToken.limit(currentUser.user.id);

    if (!success) {
      return apiResponse(429, {
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    const token = await createSocketToken(
      currentUser.user.id,
      currentUser.type,
    );

    return apiResponse(200, {
      success: true,
      message: "Socket token generated successfully",
      data: {
        token,
      },
    });
  } catch (error) {
    console.error("Failed to generate socket token:", error);
    if (error instanceof UnauthorizedError) {
      return apiResponse(401, {
        success: false,
        message: error?.message || "Unauthorized",
        error,
      });
    }

    return apiResponse(500, {
      success: false,
      message: "Failed to generate socket token",
      error,
    });
  }
}
