import { Client } from "baltica";
import type { BotConfig } from "./config";

export class BedrockBot {
  private client: Client;
  private config: BotConfig;

  constructor(config: BotConfig) {
    this.config = config;
    this.client = new Client({
      offline: config.offline,
      username: config.username,
      address: config.address,
      port: config.port,
      tokensFolder: config.tokensFolder || "./tokens",
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Handle connection event
    this.client.on("connect", () => {
      console.log("✓ Successfully connected to the server!");
      console.log(`Server: ${this.config.address}:${this.config.port}`);
      console.log(`Bot username: ${this.client.username}`);
      console.log(`Auth mode: ${this.config.offline ? "Offline" : "Xbox Live"}`);
    });

    // Handle disconnection
    this.client.on("disconnect", (reason) => {
      console.log(`✗ Disconnected from server: ${reason}`);
    });

    // Listen for errors
    this.client.on("error", (error) => {
      console.error("Error occurred:", error);
    });

    // Listen for chat messages
    this.client.on("TextPacket", (packet) => {
      if (packet.source && packet.message) {
        console.log(`[Chat] ${packet.source}: ${packet.message}`);
      }
    });

    // Handle session creation (for Xbox Live auth)
    this.client.on("session", () => {
      console.log("✓ Session created successfully");
    });
  }

  async connect(): Promise<void> {
    console.log("\n=== Starting Bedrock Bot ===");
    console.log(`Target: ${this.config.address}:${this.config.port}`);
    console.log(`Mode: ${this.config.offline ? "Offline/LAN" : "Online (Xbox Live)"}`);

    if (!this.config.offline) {
      console.log("\n⚠ Xbox Live Authentication Required:");
      console.log("  If this is your first time, a browser will open for login.");
      console.log("  Follow the prompts to sign in with your Microsoft/Xbox account.");
      console.log("  Tokens will be cached for future use.\n");
    }

    try {
      await this.client.connect();
      console.log("Connection initiated...");
    } catch (error) {
      console.error("Failed to connect:", error);
      throw error;
    }
  }

  getClient(): Client {
    return this.client;
  }

  disconnect(): void {
    // The client will handle cleanup
    console.log("Disconnecting bot...");
  }
}
