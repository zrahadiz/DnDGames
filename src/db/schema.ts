import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  theme: varchar("theme", { length: 50 }).notNull(),
  password: varchar("password", { length: 50 }).default("").notNull(),
  max_players: integer("max_players").notNull().default(5),
  status: varchar("status", { length: 20 }).notNull().default("waiting"), // waiting, in-game
  created_at: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  room_id: integer("room_id").references(() => rooms.id),
  character_name: varchar("character_name", { length: 50 }).notNull(),
  character_class: varchar("character_class", { length: 50 }).notNull(),
  level: integer("level").default(1),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  room_id: integer("room_id").references(() => rooms.id),
  sender: varchar("sender", { length: 50 }).notNull(), // "ai" or username
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});
