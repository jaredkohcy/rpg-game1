import Phaser from "phaser";

import { MonsterSystem } from "../systems/MonsterSystem";
import { SaveSystem } from "../systems/SaveSystem";

interface HealthStation {
  id: string;
  x: number;
  y: number;
  sprite: Phaser.GameObjects.Arc;
}

const HEALTH_STATIONS = [
  {
    id: "forest-1",
    x: 800,
    y: 800
  },
  {
    id: "forest-2",
    x: 1800,
    y: 1200
  },
  {
    id: "cave-1",
    x: 3200,
    y: 1000
  },
  {
    id: "cave-2",
    x: 4200,
    y: 1800
  },
  {
    id: "ruins-1",
    x: 1200,
    y: 3300
  },
  {
    id: "ruins-2",
    x: 1800,
    y: 4300
  },
  {
    id: "highlands-1",
    x: 3600,
    y: 3400
  },
  {
    id: "highlands-2",
    x: 4300,
    y: 4200
  }
];

export class WorldScene extends Phaser.Scene {

  player!: Phaser.Physics.Arcade.Sprite;

  cursors!:
    Phaser.Types.Input.Keyboard.CursorKeys;

  private bestiaryKey!:
    Phaser.Input.Keyboard.Key;

  private healthStations:
    HealthStation[] = [];

  debugText!:
    Phaser.GameObjects.Text;

  biomeText!:
    Phaser.GameObjects.Text;

  hpText!:
    Phaser.GameObjects.Text;

  constructor() {
    super("WorldScene");
  }

  private getCurrentBiome(): string {

    const x = this.player.x;
    const y = this.player.y;

    if (
      x < 2500 &&
      y < 2500
    ) {
      return "forest";
    }

    if (
      x >= 2500 &&
      y < 2500
    ) {
      return "cave";
    }

    if (
      x < 2500 &&
      y >= 2500
    ) {
      return "ruins";
    }

    return "highlands";
  }

  create(data?: {
    playerX?: number;
    playerY?: number;
  }) {

    this.healthStations = [];

    const WORLD_WIDTH = 5000;
    const WORLD_HEIGHT = 5000;

    //
    // Keys
    //
    this.bestiaryKey =
      this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.TAB
      );

    //
    // World Bounds
    //
    this.physics.world.setBounds(
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT
    );

    //
    // World Graphics
    //
    const graphics =
      this.add.graphics();

    // Forest
    graphics.fillStyle(
      0x3a7a3a
    );

    graphics.fillRect(
      0,
      0,
      2500,
      2500
    );

    // Cave
    graphics.fillStyle(
      0x555555
    );

    graphics.fillRect(
      2500,
      0,
      2500,
      2500
    );

    // Ruins
    graphics.fillStyle(
      0x8b6f47
    );

    graphics.fillRect(
      0,
      2500,
      2500,
      2500
    );

    // Highlands
    graphics.fillStyle(
      0x6c8a5e
    );

    graphics.fillRect(
      2500,
      2500,
      2500,
      2500
    );

    this.add.tileSprite(0, 0, 2500, 2500, "biome-forest")
      .setOrigin(0);
    this.add.tileSprite(2500, 0, 2500, 2500, "biome-cave")
      .setOrigin(0);
    this.add.tileSprite(0, 2500, 2500, 2500, "biome-ruins")
      .setOrigin(0);
    this.add.tileSprite(2500, 2500, 2500, 2500, "biome-highlands")
      .setOrigin(0);

    const overlay = this.add.graphics();

    //
    // Region Dividers
    //
    overlay.lineStyle(
      6,
      0xffffff,
      0.7
    );

    overlay.moveTo(
      2500,
      0
    );

    overlay.lineTo(
      2500,
      5000
    );

    overlay.moveTo(
      0,
      2500
    );

    overlay.lineTo(
      5000,
      2500
    );

    overlay.strokePath();

    //
    // Grid
    //
    overlay.lineStyle(
      1,
      0x10201a,
      0.28
    );

    for (
      let x = 0;
      x <= WORLD_WIDTH;
      x += 64
    ) {
      overlay.moveTo(x, 0);
      overlay.lineTo(
        x,
        WORLD_HEIGHT
      );
    }

    for (
      let y = 0;
      y <= WORLD_HEIGHT;
      y += 64
    ) {
      overlay.moveTo(0, y);
      overlay.lineTo(
        WORLD_WIDTH,
        y
      );
    }

    overlay.strokePath();

    //
    // Region Labels
    //
    this.add.text(
      1000,
      1200,
      "FOREST",
      {
        fontSize: "48px",
        color: "#ffffff"
      }
    );

    this.add.text(
      3400,
      1200,
      "CAVE",
      {
        fontSize: "48px",
        color: "#ffffff"
      }
    );

    this.add.text(
      1000,
      3700,
      "RUINS",
      {
        fontSize: "48px",
        color: "#ffffff"
      }
    );

    this.add.text(
      3100,
      3700,
      "HIGHLANDS",
      {
        fontSize: "48px",
        color: "#ffffff"
      }
    );

    //
    // Health Stations
    //
    HEALTH_STATIONS.forEach(
      station => {

        if (
          SaveSystem.isHealthStationUsed(
            station.id
          )
        ) {
          return;
        }

        const sprite =
          this.add.circle(
            station.x,
            station.y,
            25,
            0x00ffff,
            0.9
          );

        sprite.setStrokeStyle(
          3,
          0xffffff
        );

        this.healthStations.push({
          id: station.id,
          x: station.x,
          y: station.y,
          sprite
        });
      }
    );

    //
    // Player
    //
    const startX =
      data?.playerX ?? 2500;

    const startY =
      data?.playerY ?? 2500;

    this.player =
      this.physics.add.sprite(
        startX,
        startY,
        "player"
      );

    this.player.setCollideWorldBounds(
      true
    );

    //
    // Camera
    //
    this.cameras.main.startFollow(
      this.player
    );

    this.cameras.main.setBounds(
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT
    );

    //
    // Input
    //
    this.cursors =
      this.input.keyboard!
        .createCursorKeys();

    //
    // UI
    //
    this.add.text(
      20,
      20,
      "Knowledge RPG Prototype",
      {
        color: "#ffffff",
        fontSize: "20px"
      }
    ).setScrollFactor(0);

    this.debugText =
      this.add.text(
        20,
        50,
        "",
        {
          color: "#ffff00",
          fontSize: "16px"
        }
      )
      .setScrollFactor(0);

    this.biomeText =
      this.add.text(
        20,
        80,
        "",
        {
          color: "#ffffff",
          fontSize: "16px"
        }
      )
      .setScrollFactor(0);

    this.hpText =
      this.add.text(
        20,
        110,
        "",
        {
          color: "#00ffff",
          fontSize: "16px"
        }
      )
      .setScrollFactor(0);

    this.add.text(
      20,
      140,
      "TAB = Bestiary",
      {
        color: "#ffffff",
        fontSize: "16px"
      }
    ).setScrollFactor(0);

    this.add.text(
      this.scale.width - 20,
      20,
      "Reset Progress",
      {
        color: "#ffffff",
        backgroundColor: "#8b2222",
        fontSize: "18px",
        padding: { x: 12, y: 8 }
      }
    )
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        const confirmed = window.confirm(
          "Reset HP to 100 and release all captured monsters?"
        );

        if (!confirmed) {
          return;
        }

        SaveSystem.resetCapturedMonsters();
        SaveSystem.setPlayerHp(100);
        this.hpText.setText("HP: 100");
      });
  }

  update() {

    //
    // Open Bestiary
    //
    if (
      Phaser.Input.Keyboard.JustDown(
        this.bestiaryKey
      )
    ) {

      this.scene.start(
        "BestiaryScene",
        {
          playerX: this.player.x,
          playerY: this.player.y
        }
      );

      return;
    }

    //
    // Movement
    //
    const speed = 220;

    let moving = false;

    this.player.setVelocity(0);

    if (
      this.cursors.left.isDown
    ) {
      this.player.setVelocityX(
        -speed
      );

      moving = true;
    }

    if (
      this.cursors.right.isDown
    ) {
      this.player.setVelocityX(
        speed
      );

      moving = true;
    }

    if (
      this.cursors.up.isDown
    ) {
      this.player.setVelocityY(
        -speed
      );

      moving = true;
    }

    if (
      this.cursors.down.isDown
    ) {
      this.player.setVelocityY(
        speed
      );

      moving = true;
    }

    //
    // UI
    //
    const biome =
      this.getCurrentBiome();

    this.debugText.setText(
      `X: ${Math.round(this.player.x)}
Y: ${Math.round(this.player.y)}`
    );

    this.biomeText.setText(
      `Biome: ${biome}`
    );

    this.hpText.setText(
      `HP: ${SaveSystem.getPlayerHp()}`
    );

    //
    // Health Station Collision
    //
    for (
      const station of this.healthStations
    ) {

      const distance =
        Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          station.x,
          station.y
        );

      if (
        distance < 50
      ) {
        SaveSystem.markHealthStationUsed(station.id);
        this.scene.start("HealthStationScene",
          {
            stationId: station.id,
            playerX:this.player.x,
            playerY:this.player.y
          }
        );
        return;
      }
    }

    //
    // Random Encounters
    //
    if (
      moving &&
      Math.random() < 0.01
    ) {

      const monster =
        MonsterSystem.getUncapturedMonsterForBiome(
          biome
        );

      if (!monster) {

        console.log(
          `${biome} complete`
        );

        return;
      }

      this.scene.start(
        "BattleScene",
        {
          monster,

          playerX:
            this.player.x,

          playerY:
            this.player.y
        }
      );
    }
  }
}