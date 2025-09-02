ALTER TABLE "room_players" ADD COLUMN "is_ready" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "room_players" ADD COLUMN "last_seen_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "host_id" integer;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;