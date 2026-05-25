// src/db/schema.ts
import { relations } from "drizzle-orm";
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
  index,
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
export type RoomStatus = (typeof roomStatusEnum.enumValues)[number];

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
   USER 
========================================================= */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  type: userTypeEnum("type").notNull().default("registered"),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const guestSessions = pgTable("guest_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  guestSessions: many(guestSessions),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const guestSessionsRelations = relations(guestSessions, ({ one }) => ({
  user: one(user, {
    fields: [guestSessions.userId],
    references: [user.id],
  }),
}));

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

  image: text("image"),

  themeId: uuid("theme_id")
    .references(() => themes.id)
    .notNull(),

  backgroundLore: text("background_lore"),

  startingLocation: text("starting_location"),

  startingObjective: text("starting_objective"),

  worldSetup: jsonb("world_setup").notNull(),

  createdBy: text("created_by").references(() => user.id),

  isOfficial: boolean("is_official").default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const themes = pgTable("themes", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull().unique(),

  icon: text("icon"),

  isOfficial: boolean("is_official").default(false),

  createdBy: text("created_by").references(() => user.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const campaignRelations = relations(campaigns, ({ one }) => ({
  creator: one(user, {
    fields: [campaigns.createdBy],
    references: [user.id],
  }),
  theme: one(themes, {
    fields: [campaigns.themeId],
    references: [themes.id],
  }),
}));

export const themeRelations = relations(themes, ({ one, many }) => ({
  creator: one(user, {
    fields: [themes.createdBy],
    references: [user.id],
  }),

  campaigns: many(campaigns),
}));

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

  storySummary: text("story_summary"),

  currentProgression: text("current_progression"),

  worldState: jsonb("world_state"),

  maxPlayers: integer("max_players").notNull().default(4),

  status: roomStatusEnum("status").notNull().default("waiting"),

  aiModel: varchar("ai_model", {
    length: 100,
  }).default("gpt-4.1"),

  hostId: text("host_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roomRelations = relations(rooms, ({ one }) => ({
  host: one(user, {
    fields: [rooms.hostId],
    references: [user.id],
  }),
  campaign: one(campaigns, {
    fields: [rooms.campaignId],
    references: [campaigns.id],
  }),
}));

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

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
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

  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
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

  senderId: text("sender_id").references(() => user.id, {
    onDelete: "set null",
  }),

  senderType: messageSenderTypeEnum("sender_type").notNull(),

  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
