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
      mainObjective: roomDetail.campaign.mainObjective,
      worldSetup: roomDetail.campaign.worldSetup,
    },

    players: roomDetail.players.map((player) => ({
      userId: player.userId,

      character: {
        name: player.character?.name,
        race: player.character?.race,
        class: player.character?.characterClass,
        level: player.character?.level,
        xp: player.character?.xp,
        hp: player.character?.hp,
        maxHp: player.character?.maxHp,
        mana: player.character?.mana,
        maxMana: player.character?.maxMana,
      },
    })),
  };
  return gameContext;
}
