import { db } from "@/db";
import { themes } from "@/db/schema";
import { apiResponse } from "@/server/utils/apiResponse";
import { requiredUser } from "@/server/auth/requiredUser";
import { createThemeSchema } from "@/server/validators/themes";

export async function GET() {
  try {
    const data = await db.query.themes.findMany({
      with: {
        creator: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },

      orderBy: (themes, { asc }) => [asc(themes.name)],
    });

    return apiResponse(200, {
      success: true,
      message: "Themes fetched successfully",
      data,
    });
  } catch (error) {
    console.error(error);

    return apiResponse(500, {
      success: false,
      message: "Failed to fetch themes",
      error,
    });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await requiredUser();
    const body = await req.json();
    const result = createThemeSchema.safeParse(body);

    if (!result.success) {
      return apiResponse(400, {
        success: false,
        message: "Invalid Input",
        error: result.error.flatten(),
      });
    }

    const [newTheme] = await db
      .insert(themes)
      .values({
        ...result.data,
        createdBy: currentUser.user.id,
      })
      .returning();

    return apiResponse(201, {
      success: true,
      message: "Theme creaeted successfully",
      data: newTheme,
    });
  } catch (error) {
    console.error(error);

    return apiResponse(500, {
      success: false,
      message: "Failed to create theme",
      error,
    });
  }
}
