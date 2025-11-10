import { Client } from "baltica";
import {
  SetLocalPlayerAsInitializedPacket,
  Vector3f
} from "@serenityjs/protocol";

// Configuration
const OFFLINE = process.env.OFFLINE === "true";
const SERVER_ADDRESS = OFFLINE ? "127.0.0.1" : "sness.net";
const SERVER_PORT = 19132;
const BOT_USERNAME = "FishBot";

console.log("=".repeat(60));
console.log("BEDROCK FISHING BOT");
console.log("=".repeat(60));
console.log(`Server: ${SERVER_ADDRESS}:${SERVER_PORT}`);
console.log(`Mode: ${OFFLINE ? "OFFLINE" : "ONLINE (Xbox Live)"}`);
console.log(`Bot: ${BOT_USERNAME}`);
console.log("=".repeat(60));

class FishingBot {
  private client: Client;
  private position: Vector3f = new Vector3f(0, 0, 0);
  private rotation: { pitch: number; yaw: number; headYaw: number } = {
    pitch: 0,
    yaw: 0,
    headYaw: 0,
  };
  private spawned: boolean = false;
  private runtimeEntityId: bigint = 0n;

  constructor() {
    console.log("[INIT] Creating Baltica client...");

    this.client = new Client({
      offline: OFFLINE,
      username: BOT_USERNAME,
      address: SERVER_ADDRESS,
      port: SERVER_PORT,
      tokensFolder: "./auth-tokens",
    });

    this.setupEventHandlers();
  }

  private log(category: string, message: string, data?: any) {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, -1);
    console.log(`[${timestamp}] [${category}] ${message}`);
    if (data) {
      console.log(`    Data:`, JSON.stringify(data, null, 2));
    }
  }

  private setupEventHandlers(): void {
    this.log("EVENTS", "Setting up event handlers...");

    // Session created (Xbox Live)
    this.client.on("session", () => {
      this.log("AUTH", "✓ Xbox Live session created");
    });

    // Connected to server
    this.client.on("connect", () => {
      this.log("CONNECT", "✓ Connected to server!");
    });

    // Disconnected (using any to bypass TypeScript event type checking)
    (this.client as any).on("disconnect", (reason: string) => {
      this.log("DISCONNECT", `✗ Disconnected: ${reason}`);
      process.exit(0);
    });

    // Errors (using any to bypass TypeScript event type checking)
    (this.client as any).on("error", (error: Error) => {
      this.log("ERROR", `✗ Error: ${error.message}`);
      console.error(error);
    });

    // Start game - Initial spawn
    this.client.on("StartGamePacket", (packet: any) => {
      this.log("SPAWN", "Received StartGamePacket");

      try {
        if (packet.position) {
          this.position = packet.position;
        } else {
          this.position = new Vector3f(0, 64, 0);
        }

        // Store runtime entity ID
        if (packet.runtimeEntityId) {
          this.runtimeEntityId = packet.runtimeEntityId;
          this.log("SPAWN", `Runtime Entity ID: ${this.runtimeEntityId}`);
        }

        this.log("SPAWN", "✓ Spawned in world!", {
          position: this.position,
          rotation: this.rotation,
        });

        this.spawned = true;

        // Send initialization packet (critical for proper spawn!)
        this.log("SPAWN", "Sending SetLocalPlayerAsInitializedPacket...");
        const initPacket = new SetLocalPlayerAsInitializedPacket();
        initPacket.runtimeEntityId = this.runtimeEntityId;

        try {
          this.client.send(initPacket.serialize());
          this.log("SPAWN", "✓ Initialization packet sent!");
          this.log("FISHING", "Bot is now standing still, ready for fishing implementation...");
        } catch (error) {
          this.log("SPAWN", `✗ Error sending init packet: ${error}`);
        }

      } catch (error) {
        this.log("SPAWN", `✗ Error processing spawn: ${error}`);
      }
    });

    // Position updates from server
    this.client.on("MovePlayerPacket", (packet: any) => {
      try {
        if (packet.position) {
          const oldPos = { ...this.position };
          this.position = packet.position;

          // Only log if position actually changed
          const moved =
            oldPos.x !== this.position.x ||
            oldPos.y !== this.position.y ||
            oldPos.z !== this.position.z;

          if (moved) {
            this.log("MOVE", "Server updated position", {
              from: oldPos,
              to: this.position,
            });
          }
        }

        if (packet.pitch !== undefined && packet.yaw !== undefined) {
          this.rotation = {
            pitch: packet.pitch || 0,
            yaw: packet.yaw || 0,
            headYaw: packet.headYaw || packet.yaw || 0,
          };
        }
      } catch (error) {
        // Ignore position update errors
      }
    });

    // Chat messages
    this.client.on("TextPacket", (packet: any) => {
      if (packet.source && packet.message) {
        this.log("CHAT", `<${packet.source}> ${packet.message}`);
      } else if (packet.message) {
        this.log("CHAT", packet.message);
      }
    });

    // Log unknown packets for debugging
    this.client.on("packet", (packet: any) => {
      if (packet.name && packet.name.includes("Unknown")) {
        this.log("PACKET", `Received unknown packet: ${packet.name}`);
      }
    });
  }

  async connect(): Promise<void> {
    this.log("CONNECT", "Attempting to connect...");

    if (!OFFLINE) {
      this.log("AUTH", "Xbox Live authentication required - browser will open");
    }

    try {
      await this.client.connect();
      this.log("CONNECT", "Connection initiated successfully");
    } catch (error) {
      this.log("CONNECT", `✗ Failed to connect: ${error}`);
      throw error;
    }
  }
}

// Main
async function main() {
  const bot = new FishingBot();

  try {
    await bot.connect();
    console.log("\n✓ Bot connected and standing still");
    console.log("  Press Ctrl+C to exit");
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
