import { RoomContext } from "@/types/rooms";

export async function roomContext(roomDetail: RoomContext) {
  const gameContext = {
    room: {
      id: roomDetail.id,
      name: roomDetail.name,
    },

    campaign: {
      title: roomDetail.campaign.title,
      description: roomDetail.campaign.description,
      backgroundLore: roomDetail.campaign.backgroundLore,
      startingLocation: roomDetail.campaign.startingLocation,
      startingObjective: roomDetail.campaign.startingObjective,
      worldSetup: roomDetail.campaign.worldSetup,
    },

    players: roomDetail.players.map((player) => ({
      userId: player.userId,

      character: {
        name: player.character?.name,
        race: player.character?.race,
        class: player.character?.characterClass,
        level: player.character?.level,
        hp: player.character?.hp,
        mana: player.character?.mana,
        backstory: player.character?.backstory,
      },
    })),
  };
  return gameContext;
}
