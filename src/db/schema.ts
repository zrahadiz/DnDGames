// src/db/schema.ts

import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";

/* =========================================================
   ENUMS
========================================================= */

export const userTypeEnum = pgEnum("user_type", ["guest", "registered"]);

export const roomStatusEnum = pgEnum("room_status", [
  "waiting",
  "playing",
  "finished",
]);

export const roomVisibilityEnum = pgEnum("room_visibility", [
  "public",
  "private",
]);

export const roomPlayerRoleEnum = pgEnum("room_player_role", [
  "host",
  "player",
  "spectator",
]);

export const messageSenderTypeEnum = pgEnum("message_sender_type", [
  "user",
  "ai",
  "system",
]);

/* =========================================================
   USERS
========================================================= */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  type: userTypeEnum("type").notNull().default("guest"),

  username: varchar("username", {
    length: 50,
  }).unique(),

  email: varchar("email", {
    length: 255,
  }).unique(),

  image: text("image"),

  lastSeenAt: timestamp("last_seen_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================================================
   CAMPAIGNS
   Persistent story/world
========================================================= */

export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: varchar("title", {
    length: 100,
  }).notNull(),

  description: text("description"),

  theme: varchar("theme", {
    length: 50,
  }).notNull(),

  backgroundLore: text("background_lore"),

  startingObjective: text("starting_objective"),

  worldSetup: jsonb("world_setup"),

  createdBy: uuid("created_by").references(() => users.id),

  isOfficial: boolean("is_official").default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================================================
   ROOMS
   Multiplayer realtime session
========================================================= */

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),

  campaignId: uuid("campaign_id")
    .references(() => campaigns.id, {
      onDelete: "cascade",
    })
    .notNull(),

  name: varchar("name", {
    length: 100,
  }).notNull(),

  roomCode: varchar("room_code", {
    length: 10,
  })
    .notNull()
    .unique(),

  visibility: roomVisibilityEnum("visibility").notNull().default("public"),

  password: varchar("password", {
    length: 255,
  }),

  storySummary: text("story_summary"),

  currentProgression: text("current_progression"),

  worldState: jsonb("world_state"),

  maxPlayers: integer("max_players").notNull().default(4),

  status: roomStatusEnum("status").notNull().default("waiting"),

  aiModel: varchar("ai_model", {
    length: 100,
  }).default("gpt-4.1"),

  hostId: uuid("host_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================================================
   ROOM PLAYERS
   Current realtime participation
========================================================= */

export const roomPlayers = pgTable(
  "room_players",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, {
        onDelete: "cascade",
      }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    role: roomPlayerRoleEnum("role").notNull().default("player"),

    isReady: boolean("is_ready").notNull().default(false),

    isConnected: boolean("is_connected").notNull().default(true),

    joinedAt: timestamp("joined_at").defaultNow().notNull(),

    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserRoom: unique().on(table.userId, table.roomId),
  }),
);

/* =========================================================
   CHARACTERS
   Persistent RPG character
========================================================= */

export const characters = pgTable("characters", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, {
      onDelete: "cascade",
    }),

  name: varchar("name", {
    length: 50,
  }).notNull(),

  race: varchar("race", {
    length: 50,
  }),

  characterClass: varchar("character_class", {
    length: 50,
  }),

  level: integer("level").notNull().default(1),

  hp: integer("hp").notNull().default(100),

  mana: integer("mana").notNull().default(100),

  backstory: text("backstory"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =========================================================
   GAME EVENTS
   Structured gameplay events
========================================================= */

export const gameEvents = pgTable("game_events", {
  id: uuid("id").defaultRandom().primaryKey(),

  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, {
      onDelete: "cascade",
    }),

  eventType: varchar("event_type", {
    length: 50,
  }).notNull(),

  /*
      Examples:
      {
        "dice": "d20",
        "result": 18
      }

      {
        "attacker": "Kael",
        "target": "Goblin",
        "damage": 12
      }
    */
  payload: jsonb("payload").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =========================================================
   MESSAGES
   Chat / AI narration / system messages
========================================================= */

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  roomId: uuid("room_id")
    .notNull()
    .references(() => rooms.id, {
      onDelete: "cascade",
    }),

  senderId: uuid("sender_id").references(() => users.id, {
    onDelete: "set null",
  }),

  senderType: messageSenderTypeEnum("sender_type").notNull(),

  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
