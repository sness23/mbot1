import { Client } from "baltica";
import {
  PlayerAuthInputPacket,
  InputData,
  type Vector3f,
} from "@serenityjs/protocol";

// Configuration
const SERVER_ADDRESS = "sness.net";
const SERVER_PORT = 19132;
const BOT_USERNAME = "KeyboardBot";
const OFFLINE_MODE = false; // Set to true for local server, false for sness.net

// Game loop settings
const TICK_RATE = 50; // 20 ticks per second (50ms per tick)
const MOVE_SPEED = 0.15;

class KeyboardController {
  private client: Client;
  private position: Vector3f = { x: 0, y: 0, z: 0 };
  private rotation: { pitch: number; yaw: number; headYaw: number } = {
    pitch: 0,
    yaw: 0,
    headYaw: 0,
  };
  private tick: bigint = 0n;
  private connected: boolean = false;

  // Key state tracking (for held keys)
  private keysPressed: Set<string> = new Set();

  // Game loop
  private gameLoopInterval?: NodeJS.Timeout;

  constructor() {
    this.client = new Client({
      offline: OFFLINE_MODE,
      username: BOT_USERNAME,
      address: SERVER_ADDRESS,
      port: SERVER_PORT,
      tokensFolder: "./auth-tokens",
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on("session", () => {
      console.log("✓ Authentication session created");
    });

    this.client.on("connect", () => {
      console.log("\n✓ Connected to server!");
      this.connected = true;
    });

    this.client.on("StartGamePacket", (packet: any) => {
      try {
        // Try different possible packet structures
        if (packet.position) {
          this.position = packet.position;
        } else if (packet.playerPosition) {
          this.position = packet.playerPosition;
        } else if (packet.spawn) {
          this.position = packet.spawn;
        } else {
          // Default spawn position if we can't find it
          this.position = { x: 0, y: 64, z: 0 };
        }

        console.log(`✓ Spawned at X:${this.position.x.toFixed(2)}, Y:${this.position.y.toFixed(2)}, Z:${this.position.z.toFixed(2)}`);
        console.log("\n=== READY TO PLAY ===");
        console.log("Controls: W/A/S/D = Move, SPACE = Jump, SHIFT = Sneak, Q = Quit");
        console.log("Hold keys down to keep moving!\n");

        // Start the game loop
        this.startGameLoop();
      } catch (error) {
        console.error("Error processing StartGamePacket:", error);
        // Still start the game loop even if we couldn't get position
        this.startGameLoop();
      }
    });

    this.client.on("MovePlayerPacket", (packet: any) => {
      try {
        if (packet.position) {
          this.position = packet.position;
        }
        if (packet.pitch !== undefined && packet.yaw !== undefined) {
          this.rotation = {
            pitch: packet.pitch || 0,
            yaw: packet.yaw || 0,
            headYaw: packet.headYaw || packet.yaw || 0,
          };
        }
      } catch (error) {
        // Silently ignore position update errors
      }
    });

    this.client.on("TextPacket", (packet: any) => {
      if (packet.source && packet.message) {
        console.log(`[Chat] ${packet.source}: ${packet.message}`);
      }
    });

    this.client.on("disconnect", (reason: any) => {
      console.log(`\n✗ Disconnected: ${reason}`);
      this.stopGameLoop();
      process.exit(0);
    });

    this.client.on("error", (error: any) => {
      console.error(`✗ Error: ${error}`);
    });
  }

  private sendInput(inputFlags: InputData[], delta: Vector3f = { x: 0, y: 0, z: 0 }): void {
    if (!this.connected) return;

    const packet = new PlayerAuthInputPacket();

    // Update position
    this.position.x += delta.x;
    this.position.y += delta.y;
    this.position.z += delta.z;

    packet.position = this.position;
    packet.pitch = this.rotation.pitch;
    packet.yaw = this.rotation.yaw;
    packet.headYaw = this.rotation.headYaw;
    packet.inputData = inputFlags;
    packet.inputMode = 1;
    packet.playMode = 0;
    packet.interactionModel = 0;
    packet.vrGazeDirection = { x: 0, y: 0, z: 0 };
    packet.tick = this.tick++;
    packet.delta = delta;
    packet.analogMoveVector = { x: delta.x, y: delta.z };

    try {
      this.client.send(packet.serialize());
    } catch (error) {
      // Silently handle errors
    }
  }

  private startGameLoop(): void {
    console.log("Game loop started!\n");

    this.gameLoopInterval = setInterval(() => {
      this.processInput();
    }, TICK_RATE);
  }

  private stopGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = undefined;
    }
  }

  private processInput(): void {
    if (this.keysPressed.size === 0) return;

    const inputFlags: InputData[] = [];
    let deltaX = 0;
    let deltaZ = 0;
    let deltaY = 0;

    const radians = (this.rotation.yaw * Math.PI) / 180;

    // Movement
    if (this.keysPressed.has('w')) {
      inputFlags.push(InputData.Up);
      deltaX += -Math.sin(radians) * MOVE_SPEED;
      deltaZ += Math.cos(radians) * MOVE_SPEED;
    }
    if (this.keysPressed.has('s')) {
      inputFlags.push(InputData.Down);
      deltaX += Math.sin(radians) * MOVE_SPEED;
      deltaZ += -Math.cos(radians) * MOVE_SPEED;
    }
    if (this.keysPressed.has('a')) {
      inputFlags.push(InputData.Left);
      deltaX += -Math.cos(radians) * MOVE_SPEED;
      deltaZ += -Math.sin(radians) * MOVE_SPEED;
    }
    if (this.keysPressed.has('d')) {
      inputFlags.push(InputData.Right);
      deltaX += Math.cos(radians) * MOVE_SPEED;
      deltaZ += Math.sin(radians) * MOVE_SPEED;
    }

    // Jump
    if (this.keysPressed.has(' ')) {
      inputFlags.push(InputData.Jumping, InputData.JumpDown);
      deltaY = 0.42;
    }

    // Sneak
    if (this.keysPressed.has('shift')) {
      inputFlags.push(InputData.Sneaking, InputData.SneakDown);
    }

    if (inputFlags.length > 0) {
      this.sendInput(inputFlags, { x: deltaX, y: deltaY, z: deltaZ });
    }
  }

  async connect(): Promise<void> {
    console.log("\n╔══════════════════════════════════════╗");
    console.log("║  MINECRAFT KEYBOARD CONTROLLER      ║");
    console.log("╚══════════════════════════════════════╝\n");
    console.log(`Connecting to ${SERVER_ADDRESS}:${SERVER_PORT}...`);
    console.log(`Auth mode: ${OFFLINE_MODE ? "Offline/LAN" : "Xbox Live"}`);

    if (!OFFLINE_MODE) {
      console.log("\n⚠ Xbox Live Authentication:");
      console.log("  Follow the browser prompts to sign in\n");
    }

    await this.client.connect();
  }

  setupKeyboardInput(): void {
    // Enable raw mode for stdin
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    // Handle key presses
    process.stdin.on('data', (key: string) => {
      // Ctrl+C or Q to quit
      if (key === '\u0003' || key === 'q') {
        console.log("\n\nGoodbye!");
        this.stopGameLoop();
        process.exit(0);
      }

      // Add key to pressed set
      const keyLower = key.toLowerCase();

      if (keyLower === 'w' || keyLower === 'a' || keyLower === 's' || keyLower === 'd' ||
          key === ' ' || key === '\t') {
        this.keysPressed.add(keyLower === '\t' ? 'shift' : keyLower);

        // Show which keys are pressed
        const keys = Array.from(this.keysPressed).join(',').toUpperCase();
        process.stdout.write(`\rKeys: ${keys}     `);
      }
    });

    // Clear keys periodically (workaround for no key-up detection)
    setInterval(() => {
      this.keysPressed.clear();
    }, TICK_RATE);
  }
}

async function main() {
  const controller = new KeyboardController();

  try {
    await controller.connect();
    controller.setupKeyboardInput();
  } catch (error) {
    console.error("Failed to start:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
