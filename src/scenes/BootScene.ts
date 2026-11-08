import Phaser from "phaser";
import { MonsterSystem } from "../systems/MonsterSystem";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.image("player", "assets/player.svg");
    this.load.image("biome-forest", "assets/biomes/forest.svg");
    this.load.image("biome-cave", "assets/biomes/cave.svg");
    this.load.image("biome-ruins", "assets/biomes/ruins.svg");
    this.load.image("biome-highlands", "assets/biomes/highlands.svg");

    MonsterSystem.getAllMonsters()
      .filter(monster => monster.image)
      .forEach(monster => {
        this.load.image(`monster-${monster.id}`, monster.image);
      });
  }

  create() {
    this.scene.start("WorldScene");
  }
}