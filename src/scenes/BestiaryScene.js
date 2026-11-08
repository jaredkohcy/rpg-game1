import Phaser from "phaser";
import { MonsterSystem } from "../systems/MonsterSystem";
import { SaveSystem } from "../systems/SaveSystem";
export class BestiaryScene extends Phaser.Scene {
    constructor() {
        super("BestiaryScene");
        this.scrollY = 0;
        this.returnX = 2500;
        this.returnY = 2500;
    }
    create(data) {
        this.returnX = data?.playerX ?? this.returnX;
        this.returnY = data?.playerY ?? this.returnY;
        this.cameras.main.setBackgroundColor("#222222");
        //
        // Scrollable content container
        //
        this.contentContainer =
            this.add.container(0, 0);
        //
        // Header (fixed)
        //
        this.add.text(20, 20, "BESTIARY", {
            fontSize: "32px",
            color: "#ffffff"
        });
        const monsters = MonsterSystem.getAllMonsters();
        const capturedCount = SaveSystem.getCapturedMonsters()
            .length;
        this.add.text(320, 20, `${capturedCount}/${monsters.length} Captured`, {
            fontSize: "24px",
            color: "#ffff66"
        });
        this.add.text(20, 55, "ESC = Return    R = Reset Save    Mouse Wheel = Scroll", {
            fontSize: "18px",
            color: "#aaaaaa"
        });
        //
        // Bestiary Content
        //
        let y = 110;
        y = this.renderBiomeSection("FOREST", "forest", y);
        y = this.renderBiomeSection("CAVE", "cave", y);
        y = this.renderBiomeSection("RUINS", "ruins", y);
        y = this.renderBiomeSection("HIGHLANDS", "highlands", y);
        //
        // ESC = Return
        //
        this.input.keyboard?.once("keydown-ESC", () => {
            this.scene.start("WorldScene", {
                playerX: this.returnX,
                playerY: this.returnY
            });
        });
        //
        // R = Reset Save
        //
        this.input.keyboard?.once("keydown-R", () => {
            SaveSystem.reset();
            this.scene.restart();
        });
        //
        // Mouse Wheel Scroll
        //
        this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
            this.scrollY -= deltaY * 0.5;
            const contentHeight = y + 100;
            const visibleHeight = this.cameras.main.height;
            const minScroll = Math.min(0, visibleHeight -
                contentHeight);
            this.scrollY =
                Phaser.Math.Clamp(this.scrollY, minScroll, 0);
            this.contentContainer.y =
                this.scrollY;
        });
    }
    renderBiomeSection(biomeName, biomeId, startY) {
        const monsters = MonsterSystem
            .getAllMonsters()
            .filter(m => m.biome === biomeId);
        const capturedInBiome = monsters.filter(m => SaveSystem.hasCapturedMonster(m.id)).length;
        this.contentContainer.add(this.add.text(20, startY, `${biomeName} (${capturedInBiome}/${monsters.length})`, {
            fontSize: "24px",
            color: "#66ccff"
        }));
        let y = startY + 40;
        monsters.forEach((monster) => {
            const seen = SaveSystem.hasSeenMonster(monster.id);
            const captured = SaveSystem.hasCapturedMonster(monster.id);
            let text = "";
            if (!seen) {
                text =
                    `${monster.id}. ??????`;
            }
            else if (captured) {
                text =
                    `${monster.id}. ${monster.name} ✅`;
            }
            else {
                text =
                    `${monster.id}. ${monster.name} 👁`;
            }
            this.contentContainer.add(this.add.text(40, y, text, {
                fontSize: "20px",
                color: "#ffffff"
            }));
            y += 32;
        });
        return y + 24;
    }
}
