import { Client } from "baltica";
import { PlayerAuthInputPacket, InputData, type Vector3f } from "@serenityjs/protocol";

// Configuration
const OFFLINE = process.env.OFFLINE === "true";
const SERVER_ADDRESS = OFFLINE ? "127.0.0.1" : "sness.net";
const SERVER_PORT = 19132;
const BOT_USERNAME = "TestBot";

console.log("=".repeat(60));
console.log("BEDROCK MOVEMENT TEST CLIENT");
console.log("=".repeat(60));
console.log(`Server: ${SERVER_ADDRESS}:${SERVER_PORT}`);
console.log(`Mode: ${OFFLINE ? "OFFLINE" : "ONLINE (Xbox Live)"}`);
console.log(`Bot: ${BOT_USERNAME}`);
console.log("=".repeat(60));

class MovementTest {
  private client: Client;
  private position: Vector3f = { x: 0, y: 0, z: 0 };
  private rotation: { pitch: number; yaw: number; headYaw: number } = {
    pitch: 0,
    yaw: 0,
    headYaw: 0,
  };
  private tick: bigint = 0n;
  private spawned: boolean = false;
  private testRunning: boolean = false;
  private moveCount: number = 0;
  private direction: "forward" | "backward" = "forward";

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

    // Disconnected
    this.client.on("disconnect", (reason: string) => {
      this.log("DISCONNECT", `✗ Disconnected: ${reason}`);
      process.exit(0);
    });

    // Errors
    this.client.on("error", (error: Error) => {
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
          this.position = { x: 0, y: 64, z: 0 };
        }

        this.log("SPAWN", "✓ Spawned in world!", {
          position: this.position,
          rotation: this.rotation,
        });

        this.spawned = true;

        // Wait 2 seconds, then start test
        this.log("TEST", "Will start movement test in 2 seconds...");
        setTimeout(() => {
          this.log("TEST", "Timer triggered! Starting test now...");
          this.startTest();
        }, 2000);

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
              delta: {
                x: this.position.x - oldPos.x,
                y: this.position.y - oldPos.y,
                z: this.position.z - oldPos.z,
              }
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

  private startTest(): void {
    this.log("TEST", "=".repeat(50));
    this.log("TEST", "STARTING MOVEMENT TEST");
    this.log("TEST", "Pattern: Forward 5 blocks, Backward 5 blocks, REPEAT");
    this.log("TEST", "=".repeat(50));

    this.testRunning = true;
    this.moveCount = 0;
    this.direction = "forward";

    // Execute one move every 1 second
    this.executeNextMove();
  }

  private executeNextMove(): void {
    if (!this.testRunning) return;

    // Determine current cycle position
    const cyclePosition = this.moveCount % 10;

    if (cyclePosition < 5) {
      // First 5 moves: forward
      this.direction = "forward";
    } else {
      // Next 5 moves: backward
      this.direction = "backward";
    }

    const stepInCycle = cyclePosition < 5 ? cyclePosition + 1 : cyclePosition - 4;

    this.log("TEST", "─".repeat(50));
    this.log("TEST", `Move #${this.moveCount + 1} - ${this.direction.toUpperCase()} (step ${stepInCycle}/5)`);
    this.log("TEST", `Current position: X=${this.position.x.toFixed(2)}, Y=${this.position.y.toFixed(2)}, Z=${this.position.z.toFixed(2)}`);

    // Move one block
    this.moveOneBlock(this.direction);

    this.moveCount++;

    // Schedule next move after 1 second
    setTimeout(() => this.executeNextMove(), 1000);
  }

  private moveOneBlock(direction: "forward" | "backward"): void {
    this.log("MOVE", `▶ Attempting to move 1 block ${direction}...`);

    // Calculate direction based on yaw
    const radians = (this.rotation.yaw * Math.PI) / 180;
    const movementDistance = 1.0; // 1 block

    let deltaX = 0;
    let deltaZ = 0;

    if (direction === "forward") {
      deltaX = -Math.sin(radians) * movementDistance;
      deltaZ = Math.cos(radians) * movementDistance;
    } else {
      deltaX = Math.sin(radians) * movementDistance;
      deltaZ = -Math.cos(radians) * movementDistance;
    }

    this.log("MOVE", "Movement calculation", {
      yaw: this.rotation.yaw,
      radians: radians,
      direction: direction,
      deltaX: deltaX,
      deltaZ: deltaZ,
      perPacketX: deltaX / 20,
      perPacketZ: deltaZ / 20,
    });

    // Send multiple input packets to ensure movement
    const inputFlag = direction === "forward" ? InputData.Up : InputData.Down;

    this.log("MOVE", `Sending 20 packets with input flag: ${InputData[inputFlag]}`);

    // Send 20 packets (1 second worth at 20 ticks/sec)
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        this.sendMovementPacket([inputFlag], {
          x: deltaX / 20,
          y: 0,
          z: deltaZ / 20,
        }, i === 0); // Only log first packet
      }, i * 50); // 50ms = 20 ticks per second
    }

    this.log("MOVE", "✓ All 20 packets scheduled");
  }

  private sendMovementPacket(inputFlags: InputData[], delta: Vector3f, shouldLog: boolean = false): void {
    const packet = new PlayerAuthInputPacket();

    // Ensure delta is valid
    const safeDelta = delta || { x: 0, y: 0, z: 0 };

    // Update our predicted position
    this.position.x += safeDelta.x;
    this.position.y += safeDelta.y;
    this.position.z += safeDelta.z;

    packet.position = this.position;
    packet.pitch = this.rotation.pitch;
    packet.yaw = this.rotation.yaw;
    packet.headYaw = this.rotation.headYaw;
    packet.inputData = inputFlags;
    packet.inputMode = 1; // Touch
    packet.playMode = 0; // Normal
    packet.interactionModel = 0; // Touch
    packet.vrGazeDirection = { x: 0, y: 0, z: 0 };
    packet.tick = this.tick++;
    packet.delta = safeDelta;
    packet.analogMoveVector = { x: safeDelta.x, y: safeDelta.z };

    if (shouldLog) {
      this.log("PACKET", "Sending PlayerAuthInputPacket", {
        position: packet.position,
        inputData: inputFlags.map(f => InputData[f]),
        delta: delta,
        tick: packet.tick.toString(),
      });
    }

    try {
      this.client.send(packet.serialize());
    } catch (error) {
      this.log("PACKET", `✗ Error sending packet: ${error}`);
    }
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
  const test = new MovementTest();

  try {
    await test.connect();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
