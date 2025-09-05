// src/db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// ----------------- Users -----------------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(), // consider unique if needed
  created_at: timestamp("created_at").defaultNow(),
});

// ----------------- Rooms -----------------
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  theme: varchar("theme", { length: 50 }).notNull(),
  password: varchar("password", { length: 255 }).default("").notNull(),
  max_players: integer("max_players").notNull().default(5),
  status: varchar("status", { length: 20 }).notNull().default("waiting"),
  host_id: integer("host_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  firstMessage: text().default(""),
});

// ----------------- Rooms Players -----------------
export const room_players = pgTable("room_players", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // FK to users
  room_id: integer("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }), // FK to rooms
  character_name: varchar("character_name", { length: 50 }).notNull(),
  character_class: varchar("character_class", { length: 50 }).notNull(),
  level: integer("level").default(1),
  is_ready: boolean("is_ready").notNull().default(false),
  last_seen_at: timestamp("last_seen_at").defaultNow().notNull(),
});

// Optional: prevent same user joining same room twice
// You can enforce it in your application logic or add a DB unique constraint if supported.

// ----------------- Messages -----------------
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  room_id: integer("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }), // FK to rooms
  sender: varchar("sender", { length: 50 }).notNull(), // username or "ai"
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});
