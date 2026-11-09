// src/systems/SaveSystem.ts

export interface SaveData {
  seenMonsters: number[];
  capturedMonsters: number[];

  playerHp: number;

  usedHealthStations: string[];
}

export class SaveSystem {

  private static readonly STORAGE_KEY =
    "monster-rpg-save";

  private static readonly DEFAULT_SAVE: SaveData = {
    seenMonsters: [],
    capturedMonsters: [],

    playerHp: 100,

    usedHealthStations: []
  };

  static load(): SaveData {

    const raw = localStorage.getItem(
      this.STORAGE_KEY
    );

    if (!raw) {
      return {
        ...this.DEFAULT_SAVE
      };
    }

    try {

      const data = JSON.parse(raw);

      return {
        seenMonsters:
          data.seenMonsters ?? [],

        capturedMonsters:
          data.capturedMonsters ?? [],

        playerHp:
          data.playerHp ?? 100,

        usedHealthStations:
          data.usedHealthStations ?? []
      };

    } catch (error) {

      console.error(
        "Failed to load save data:",
        error
      );

      return {
        ...this.DEFAULT_SAVE
      };
    }
  }

  static save(
    data: SaveData
  ): void {

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(data)
    );
  }

  static reset(): void {

    localStorage.removeItem(
      this.STORAGE_KEY
    );
  }

  //
  // Monster Tracking
  //

  static seeMonster(
    monsterId: number
  ): void {

    const data = this.load();

    if (
      !data.seenMonsters.includes(
        monsterId
      )
    ) {

      data.seenMonsters.push(
        monsterId
      );

      this.save(data);
    }
  }

  static captureMonster(
    monsterId: number
  ): void {

    const data = this.load();

    if (
      !data.capturedMonsters.includes(
        monsterId
      )
    ) {

      data.capturedMonsters.push(
        monsterId
      );

      this.save(data);
    }
  }

  static resetCapturedMonsters(): void {

    const data = this.load();
    data.capturedMonsters = [];
    this.save(data);
  }

  static hasSeenMonster(
    monsterId: number
  ): boolean {

    return this.load()
      .seenMonsters.includes(
        monsterId
      );
  }

  static hasCapturedMonster(
    monsterId: number
  ): boolean {

    return this.load()
      .capturedMonsters.includes(
        monsterId
      );
  }

  static getSeenMonsters(): number[] {

    return this.load()
      .seenMonsters;
  }

  static getCapturedMonsters(): number[] {

    return this.load()
      .capturedMonsters;
  }

  static getSeenCount(): number {

    return this.load()
      .seenMonsters.length;
  }

  static getCapturedCount(): number {

    return this.load()
      .capturedMonsters.length;
  }

  //
  // Player HP
  //

  static getPlayerHp(): number {

    return this.load()
      .playerHp;
  }

  static setPlayerHp(
    hp: number
  ): void {

    const data = this.load();

    data.playerHp = Math.max(
      0,
      Math.min(100, hp)
    );

    this.save(data);
  }

  static healPlayer(
    amount: number
  ): void {

    const data = this.load();

    data.playerHp = Math.min(
      100,
      data.playerHp + amount
    );

    this.save(data);
  }

  //
  // Health Stations
  //

  static isHealthStationUsed(
    stationId: string
  ): boolean {

    return this.load()
      .usedHealthStations.includes(
        stationId
      );
  }

  static markHealthStationUsed(
    stationId: string
  ): void {

    const data = this.load();

    if (
      !data.usedHealthStations.includes(
        stationId
      )
    ) {

      data.usedHealthStations.push(
        stationId
      );

      this.save(data);
    }
  }

  static getUsedHealthStations(): string[] {

    return this.load()
      .usedHealthStations;
  }
}