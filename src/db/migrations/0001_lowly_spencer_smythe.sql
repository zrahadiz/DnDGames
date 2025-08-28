ALTER TABLE "rooms_players" RENAME TO "room_players";--> statement-breakpoint
ALTER TABLE "room_players" DROP CONSTRAINT "rooms_players_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "room_players" DROP CONSTRAINT "rooms_players_room_id_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "room_players" ADD CONSTRAINT "room_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_players" ADD CONSTRAINT "room_players_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;