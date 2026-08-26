import type { InferSelectModel } from "drizzle-orm";
import type { user } from "@/db/schema";

export type Users = InferSelectModel<typeof user>;
