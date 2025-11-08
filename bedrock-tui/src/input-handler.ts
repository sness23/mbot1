import type { Client } from "baltica";
import { PlayerAuthInputPacket, InputData, type Vector3f } from "@serenityjs/protocol";
import { GameState } from "./game-state";
import type { BlessedClient } from "./blessed-client";

export class InputHandler {
  private client: Client;
  private gameState: GameState;
  private ui: BlessedClient;
  private keysPressed: Set<string> = new Set();
  private gameLoopInterval?: NodeJS.Timeout;
  private readonly TICK_RATE = 50; // 20 ticks per second
  private readonly MOVE_SPEED = 0.15;

  constructor(client: Client, gameState: GameState, ui: BlessedClient) {
    this.client = client;
    this.gameState = gameState;
    this.ui = ui;
    this.setupKeyboardInput();
  }

  private setupKeyboardInput(): void {
    const screen = this.ui.getScreen();

    // Movement keys
    screen.key(["w"], () => {
      this.keysPressed.add("w");
    });
    screen.key(["a"], () => {
      this.keysPressed.add("a");
    });
    screen.key(["s"], () => {
      this.keysPressed.add("s");
    });
    screen.key(["d"], () => {
      this.keysPressed.add("d");
    });
    screen.key(["space"], () => {
      this.keysPressed.add("space");
    });
    screen.key(["S-left"], () => { // Shift key
      this.keysPressed.add("shift");
    });

    // Hotbar selection
    for (let i = 1; i <= 9; i++) {
      screen.key([i.toString()], () => {
        this.gameState.setSelectedSlot(i - 1);
        this.ui.render();
      });
    }

    // Clear keys periodically (since we don't get key-up events easily)
    setInterval(() => {
      this.keysPressed.clear();
    }, this.TICK_RATE);
  }

  public startGameLoop(): void {
    this.gameLoopInterval = setInterval(() => {
      this.processInput();
      this.gameState.tick++;
    }, this.TICK_RATE);
  }

  public stopGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = undefined;
    }
  }

  private processInput(): void {
    if (this.keysPressed.size === 0) {
      // Send idle packet to maintain connection
      this.sendInput([], { x: 0, y: 0, z: 0 });
      return;
    }

    const inputFlags: InputData[] = [];
    let deltaX = 0;
    let deltaZ = 0;
    let deltaY = 0;

    const radians = (this.gameState.rotation.yaw * Math.PI) / 180;

    // Movement
    if (this.keysPressed.has("w")) {
      inputFlags.push(InputData.Up);
      deltaX += -Math.sin(radians) * this.MOVE_SPEED;
      deltaZ += Math.cos(radians) * this.MOVE_SPEED;
    }
    if (this.keysPressed.has("s")) {
      inputFlags.push(InputData.Down);
      deltaX += Math.sin(radians) * this.MOVE_SPEED;
      deltaZ += -Math.cos(radians) * this.MOVE_SPEED;
    }
    if (this.keysPressed.has("a")) {
      inputFlags.push(InputData.Left);
      deltaX += -Math.cos(radians) * this.MOVE_SPEED;
      deltaZ += -Math.sin(radians) * this.MOVE_SPEED;
    }
    if (this.keysPressed.has("d")) {
      inputFlags.push(InputData.Right);
      deltaX += Math.cos(radians) * this.MOVE_SPEED;
      deltaZ += Math.sin(radians) * this.MOVE_SPEED;
    }

    // Jump
    if (this.keysPressed.has("space")) {
      inputFlags.push(InputData.Jumping, InputData.JumpDown);
      deltaY = 0.42;
    }

    // Sneak
    if (this.keysPressed.has("shift")) {
      inputFlags.push(InputData.Sneaking, InputData.SneakDown);
    }

    // Update velocity in game state
    this.gameState.velocity = { x: deltaX, y: deltaY, z: deltaZ };

    // Always send input to maintain server connection
    this.sendInput(inputFlags.length > 0 ? inputFlags : [], {
      x: deltaX,
      y: deltaY,
      z: deltaZ,
    });
  }

  private sendInput(inputFlags: InputData[], delta: Vector3f): void {
    if (!this.gameState.connected) return;

    const packet = new PlayerAuthInputPacket();

    // Update position
    this.gameState.position.x += delta.x;
    this.gameState.position.y += delta.y;
    this.gameState.position.z += delta.z;

    packet.position = this.gameState.position;
    packet.pitch = this.gameState.rotation.pitch;
    packet.yaw = this.gameState.rotation.yaw;
    packet.headYaw = this.gameState.rotation.headYaw;
    packet.inputData = inputFlags;
    packet.inputMode = 1; // Touch
    packet.playMode = 0; // Normal
    packet.interactionModel = 0; // Touch
    packet.vrGazeDirection = { x: 0, y: 0, z: 0 };
    packet.tick = this.gameState.tick;
    packet.delta = delta;
    packet.analogMoveVector = { x: delta.x, y: delta.z };

    try {
      this.client.send(packet.serialize());
    } catch (error) {
      // Silently handle packet errors
    }
  }
}
