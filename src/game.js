import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { WorldScene } from "./scenes/WorldScene";
import { BattleScene } from "./scenes/BattleScene";
import { BestiaryScene } from "./scenes/BestiaryScene";
import { HealthStationScene } from "./scenes/HealthStationScene";
export const gameConfig = {
    type: Phaser.AUTO,
    parent: "app",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1600,
        height: 900
    },
    dom: {
        createContainer: true
    },
    physics: {
        default: "arcade"
    },
    scene: [
        BootScene,
        WorldScene,
        BattleScene,
        BestiaryScene,
        HealthStationScene
    ]
};
