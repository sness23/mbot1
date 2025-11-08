import type { Vector3f } from "@serenityjs/protocol";

export interface PlayerStats {
  health: number;
  maxHealth: number;
  hunger: number;
  maxHunger: number;
  experience: number;
  level: number;
}

export interface InventorySlot {
  name: string;
  count: number;
  slot: number;
}

export class GameState {
  // Position and rotation
  public position: Vector3f = { x: 0, y: 0, z: 0 };
  public rotation: { pitch: number; yaw: number; headYaw: number } = {
    pitch: 0,
    yaw: 0,
    headYaw: 0,
  };
  public velocity: Vector3f = { x: 0, y: 0, z: 0 };
  public onGround: boolean = false;

  // Player stats
  public stats: PlayerStats = {
    health: 20,
    maxHealth: 20,
    hunger: 20,
    maxHunger: 20,
    experience: 0,
    level: 0,
  };

  // Inventory
  public inventory: InventorySlot[] = [];
  public selectedHotbarSlot: number = 0;

  // Chat messages
  public chatMessages: Array<{ sender: string; message: string; timestamp: Date }> = [];
  public maxChatMessages: number = 50;

  // Connection state
  public connected: boolean = false;
  public serverAddress: string = "";
  public username: string = "";

  // Game tick
  public tick: bigint = 0n;

  constructor() {}

  updatePosition(pos: Vector3f): void {
    this.position = { ...pos };
  }

  updateRotation(pitch: number, yaw: number, headYaw: number): void {
    this.rotation = { pitch, yaw, headYaw };
  }

  updateStats(partial: Partial<PlayerStats>): void {
    this.stats = { ...this.stats, ...partial };
  }

  addChatMessage(sender: string, message: string): void {
    this.chatMessages.push({
      sender,
      message,
      timestamp: new Date(),
    });

    // Keep only last N messages
    if (this.chatMessages.length > this.maxChatMessages) {
      this.chatMessages.shift();
    }
  }

  updateInventory(slots: InventorySlot[]): void {
    this.inventory = slots;
  }

  setSelectedSlot(slot: number): void {
    this.selectedHotbarSlot = Math.max(0, Math.min(8, slot));
  }

  getDirectionString(): string {
    const yaw = this.rotation.yaw;
    if (yaw >= 337.5 || yaw < 22.5) return "South";
    if (yaw >= 22.5 && yaw < 67.5) return "Southwest";
    if (yaw >= 67.5 && yaw < 112.5) return "West";
    if (yaw >= 112.5 && yaw < 157.5) return "Northwest";
    if (yaw >= 157.5 && yaw < 202.5) return "North";
    if (yaw >= 202.5 && yaw < 247.5) return "Northeast";
    if (yaw >= 247.5 && yaw < 292.5) return "East";
    return "Southeast";
  }

  getHealthBar(width: number = 10): string {
    const filled = Math.floor((this.stats.health / this.stats.maxHealth) * width);
    const empty = width - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }

  getHungerBar(width: number = 10): string {
    const filled = Math.floor((this.stats.hunger / this.stats.maxHunger) * width);
    const empty = width - filled;
    return "▓".repeat(filled) + "░".repeat(empty);
  }
}
