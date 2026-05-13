import { db } from "@/db";
import { and, eq } from "drizzle-orm";

import { themes } from "@/db/schema";
import { apiResponse } from "@/server/utils/apiResponse";
import { requiredUser } from "@/server/auth/requiredUser";
import { UnauthorizedError } from "@/server/errors/unauthorized";

import {
  createThemeSchema,
  updateThemeSchema,
} from "@/server/validators/themes";

type Params = Promise<{ id: string }>;

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    await requiredUser();

    const { id } = await params;

    const theme = await db.query.themes.findFirst({
      where: eq(themes.id, id),
      with: {
        creator: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!theme) {
      return apiResponse(404, {
        success: false,
        message: "Theme not found",
      });
    }

    return apiResponse(200, {
      success: true,
      message: "Theme fetched successfully",
      data: theme,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof UnauthorizedError) {
      return apiResponse(401, {
        success: false,
        message: error?.message || "Unauthorized",
        error,
      });
    }
    return apiResponse(500, {
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
}

export async function PATCH(req: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requiredUser();
    if (currentUser instanceof Response) {
      return currentUser;
    }
    const { id } = await params;
    const body = await req.json();
    console.log("body:", body);
    const result = updateThemeSchema.safeParse(body);
    console.log("result:", result);

    if (!result.success) {
      return apiResponse(400, {
        success: false,
        message: "Invalid Input",
        error: result.error.flatten(),
      });
    }

    const [updatedTheme] = await db
      .update(themes)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(and(eq(themes.id, id), eq(themes.createdBy, currentUser.user.id)))
      .returning();

    if (!updatedTheme) {
      return apiResponse(404, { success: false, message: "Theme not found" });
    }

    return apiResponse(200, {
      success: true,
      message: "Theme updated successfully",
      data: updatedTheme,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof UnauthorizedError) {
      return apiResponse(401, {
        success: false,
        message: error?.message || "Unauthorized",
        error,
      });
    }
    return apiResponse(500, {
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    const currentUser = await requiredUser();
    const { id } = await params;
    const [deletedTheme] = await db
      .delete(themes)
      .where(and(eq(themes.id, id), eq(themes.createdBy, currentUser.user.id)))
      .returning();

    if (!deletedTheme) {
      return apiResponse(404, { success: false, message: "Theme not found" });
    }

    return apiResponse(200, {
      success: true,
      message: "Theme deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return apiResponse(500, {
      success: false,
      message: "Failed to delete theme",
    });
  }
}
