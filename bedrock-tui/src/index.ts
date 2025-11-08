import { Client } from "baltica";
import { GameState } from "./game-state";
import { BlessedClient } from "./blessed-client";
import { InputHandler } from "./input-handler";
import { getConfig } from "./config";

class BedrockTUIClient {
  private client: Client;
  private gameState: GameState;
  private ui: BlessedClient;
  private inputHandler: InputHandler;
  private renderInterval?: NodeJS.Timeout;
  private config = getConfig();

  constructor() {
    // Initialize game state
    this.gameState = new GameState();
    this.gameState.serverAddress = `${this.config.address}:${this.config.port}`;
    this.gameState.username = this.config.username;

    // Initialize UI
    this.ui = new BlessedClient(this.gameState);

    // Initialize Baltica client
    this.client = new Client({
      offline: this.config.offline,
      username: this.config.username,
      address: this.config.address,
      port: this.config.port,
      tokensFolder: this.config.tokensFolder || "./auth-tokens",
    });

    // Initialize input handler
    this.inputHandler = new InputHandler(this.client, this.gameState, this.ui);

    // Setup event handlers
    this.setupClientEvents();

    // Setup command handler
    this.ui.setCommandHandler((cmd: string) => {
      this.handleCommand(cmd);
    });
  }

  private setupClientEvents(): void {
    // Connection events
    this.client.on("connect", () => {
      this.gameState.connected = true;
      this.ui.addSystemMessage("✓ Connected to server!");
      this.ui.addSystemMessage(`Server: ${this.config.address}:${this.config.port}`);
      this.ui.addSystemMessage(`Auth: ${this.config.offline ? "Offline" : "Xbox Live"}`);
      this.ui.render();
    });

    this.client.on("disconnect", (reason: string) => {
      this.gameState.connected = false;
      this.ui.addSystemMessage(`✗ Disconnected: ${reason}`);
      this.ui.render();
      this.cleanup();
      setTimeout(() => process.exit(0), 1000);
    });

    this.client.on("error", (error: Error) => {
      this.ui.addSystemMessage(`✗ Error: ${error.message}`);
      this.ui.render();
    });

    // Session events (Xbox Live)
    this.client.on("session", () => {
      this.ui.addSystemMessage("✓ Xbox Live session created");
      this.ui.render();
    });

    // Game events
    this.client.on("StartGamePacket", (packet: any) => {
      try {
        // Get initial position
        if (packet.position) {
          this.gameState.updatePosition(packet.position);
        } else if (packet.playerPosition) {
          this.gameState.updatePosition(packet.playerPosition);
        } else {
          this.gameState.updatePosition({ x: 0, y: 64, z: 0 });
        }

        this.ui.addSystemMessage("✓ Spawned in world!");
        this.ui.addSystemMessage(
          `Position: X=${this.gameState.position.x.toFixed(1)}, Y=${this.gameState.position.y.toFixed(1)}, Z=${this.gameState.position.z.toFixed(1)}`
        );

        // Start game loop and rendering
        this.inputHandler.startGameLoop();
        this.startRendering();
        this.ui.render();
      } catch (error) {
        this.ui.addSystemMessage(`Error processing spawn: ${error}`);
      }
    });

    this.client.on("MovePlayerPacket", (packet: any) => {
      try {
        if (packet.position) {
          this.gameState.updatePosition(packet.position);
        }
        if (packet.pitch !== undefined && packet.yaw !== undefined) {
          this.gameState.updateRotation(
            packet.pitch || 0,
            packet.yaw || 0,
            packet.headYaw || packet.yaw || 0
          );
        }
        if (packet.onGround !== undefined) {
          this.gameState.onGround = packet.onGround;
        }
      } catch (error) {
        // Silently ignore position update errors
      }
    });

    // Chat events
    this.client.on("TextPacket", (packet: any) => {
      if (packet.source && packet.message) {
        this.gameState.addChatMessage(packet.source, packet.message);
        this.ui.addChatMessage(packet.source, packet.message);
        this.ui.render();
      } else if (packet.message) {
        // System message
        this.ui.addSystemMessage(packet.message);
        this.ui.render();
      }
    });

    // Health/stats events (if available)
    this.client.on("SetHealthPacket", (packet: any) => {
      if (packet.health !== undefined) {
        this.gameState.updateStats({ health: packet.health });
      }
    });

    this.client.on("UpdateAttributesPacket", (packet: any) => {
      // Update player attributes if needed
    });
  }

  private handleCommand(command: string): void {
    if (!command.trim()) return;

    // Send as chat message
    try {
      this.client.queue("text", {
        type: "chat",
        needs_translation: false,
        source_name: this.config.username,
        message: command,
        xuid: "",
        platform_chat_id: "",
      });

      this.gameState.addChatMessage(this.config.username, command);
      this.ui.addChatMessage(this.config.username, command);
      this.ui.render();
    } catch (error) {
      this.ui.addSystemMessage(`Failed to send message: ${error}`);
      this.ui.render();
    }
  }

  private startRendering(): void {
    // Render UI at 10 FPS (every 100ms)
    this.renderInterval = setInterval(() => {
      this.ui.render();
    }, 100);
  }

  private cleanup(): void {
    if (this.renderInterval) {
      clearInterval(this.renderInterval);
    }
    this.inputHandler.stopGameLoop();
    this.ui.cleanup();
  }

  public async start(): Promise<void> {
    // Show splash screen
    this.ui.addSystemMessage("╔════════════════════════════════════════╗");
    this.ui.addSystemMessage("║  MINECRAFT BEDROCK TUI CLIENT         ║");
    this.ui.addSystemMessage("╚════════════════════════════════════════╝");
    this.ui.addSystemMessage("");
    this.ui.addSystemMessage(`Connecting to ${this.config.address}:${this.config.port}...`);
    this.ui.addSystemMessage(`Auth mode: ${this.config.offline ? "Offline/LAN" : "Xbox Live"}`);

    if (!this.config.offline) {
      this.ui.addSystemMessage("");
      this.ui.addSystemMessage("⚠ Xbox Live Authentication Required:");
      this.ui.addSystemMessage("  A browser window will open for login.");
      this.ui.addSystemMessage("  Follow the prompts to sign in.");
      this.ui.addSystemMessage("  Tokens will be cached for future use.");
    }

    this.ui.addSystemMessage("");
    this.ui.addSystemMessage("Press Q to quit, T to type in chat");
    this.ui.render();

    try {
      await this.client.connect();
    } catch (error) {
      this.ui.addSystemMessage(`✗ Failed to connect: ${error}`);
      this.ui.render();
      setTimeout(() => {
        this.cleanup();
        process.exit(1);
      }, 2000);
    }
  }
}

// Main entry point
async function main() {
  const client = new BedrockTUIClient();

  try {
    await client.start();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Handle uncaught errors gracefully
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

main().catch((error) => {
  console.error("Failed to start:", error);
  process.exit(1);
});
