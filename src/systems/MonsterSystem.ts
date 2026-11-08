import monsters from "../data/monsters.json";
import { Monster } from "../types/Monster";
import { SaveSystem } from "./SaveSystem";

export class MonsterSystem {
    static getUncapturedMonsterForBiome(
        biome: string): Monster | null {
            const captured =SaveSystem.getCapturedMonsters();
            const available =
    (monsters as Monster[]).filter(
      monster =>
        monster.biome === biome &&
        !captured.includes(
          monster.id
        )
    );

  if (
    available.length === 0
  ) {
    return null;
  }

  const index = Math.floor(
    Math.random() *
    available.length
  );

  return available[index];
}

  static getRandomMonster(): Monster {

    const list =
      monsters as Monster[];

    const index = Math.floor(
      Math.random() * list.length
    );

    return list[index];
  }

  static getMonsterForBiome(
    biome: string
  ): Monster {

    const biomeMonsters =
      (monsters as Monster[]).filter(
        monster =>
          monster.biome === biome
      );

    const index = Math.floor(
      Math.random() *
      biomeMonsters.length
    );

    return biomeMonsters[index];
  }

  static getMonsterById(
    id: number
  ): Monster | undefined {

    return (
      monsters as Monster[]
    ).find(
      monster =>
        monster.id === id
    );
  }

  static getAllMonsters(): Monster[] {

    return monsters as Monster[];
  }
}