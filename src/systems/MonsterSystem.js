import monsters from "../data/monsters.json";
import { SaveSystem } from "./SaveSystem";
export class MonsterSystem {
    static getUncapturedMonsterForBiome(biome) {
        const captured = SaveSystem.getCapturedMonsters();
        const available = monsters.filter(monster => monster.biome === biome &&
            !captured.includes(monster.id));
        if (available.length === 0) {
            return null;
        }
        const index = Math.floor(Math.random() *
            available.length);
        return available[index];
    }
    static getRandomMonster() {
        const list = monsters;
        const index = Math.floor(Math.random() * list.length);
        return list[index];
    }
    static getMonsterForBiome(biome) {
        const biomeMonsters = monsters.filter(monster => monster.biome === biome);
        const index = Math.floor(Math.random() *
            biomeMonsters.length);
        return biomeMonsters[index];
    }
    static getMonsterById(id) {
        return monsters.find(monster => monster.id === id);
    }
    static getAllMonsters() {
        return monsters;
    }
}
