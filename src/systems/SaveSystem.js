// src/systems/SaveSystem.ts
export class SaveSystem {
    static load() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) {
            return {
                ...this.DEFAULT_SAVE
            };
        }
        try {
            const data = JSON.parse(raw);
            return {
                seenMonsters: data.seenMonsters ?? [],
                capturedMonsters: data.capturedMonsters ?? [],
                playerHp: data.playerHp ?? 100,
                usedHealthStations: data.usedHealthStations ?? []
            };
        }
        catch (error) {
            console.error("Failed to load save data:", error);
            return {
                ...this.DEFAULT_SAVE
            };
        }
    }
    static save(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
    static reset() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
    //
    // Monster Tracking
    //
    static seeMonster(monsterId) {
        const data = this.load();
        if (!data.seenMonsters.includes(monsterId)) {
            data.seenMonsters.push(monsterId);
            this.save(data);
        }
    }
    static captureMonster(monsterId) {
        const data = this.load();
        if (!data.capturedMonsters.includes(monsterId)) {
            data.capturedMonsters.push(monsterId);
            this.save(data);
        }
    }
    static hasSeenMonster(monsterId) {
        return this.load()
            .seenMonsters.includes(monsterId);
    }
    static hasCapturedMonster(monsterId) {
        return this.load()
            .capturedMonsters.includes(monsterId);
    }
    static getSeenMonsters() {
        return this.load()
            .seenMonsters;
    }
    static getCapturedMonsters() {
        return this.load()
            .capturedMonsters;
    }
    static getSeenCount() {
        return this.load()
            .seenMonsters.length;
    }
    static getCapturedCount() {
        return this.load()
            .capturedMonsters.length;
    }
    //
    // Player HP
    //
    static getPlayerHp() {
        return this.load()
            .playerHp;
    }
    static setPlayerHp(hp) {
        const data = this.load();
        data.playerHp = Math.max(0, Math.min(100, hp));
        this.save(data);
    }
    static healPlayer(amount) {
        const data = this.load();
        data.playerHp = Math.min(100, data.playerHp + amount);
        this.save(data);
    }
    //
    // Health Stations
    //
    static isHealthStationUsed(stationId) {
        return this.load()
            .usedHealthStations.includes(stationId);
    }
    static markHealthStationUsed(stationId) {
        const data = this.load();
        if (!data.usedHealthStations.includes(stationId)) {
            data.usedHealthStations.push(stationId);
            this.save(data);
        }
    }
    static getUsedHealthStations() {
        return this.load()
            .usedHealthStations;
    }
}
SaveSystem.STORAGE_KEY = "monster-rpg-save";
SaveSystem.DEFAULT_SAVE = {
    seenMonsters: [],
    capturedMonsters: [],
    playerHp: 100,
    usedHealthStations: []
};
