import type { Client } from "baltica";
import {
  PlayerAuthInputPacket,
  InputData,
  type Vector3f
} from "@serenityjs/protocol";

export class BotMovement {
  private client: Client;
  private position: Vector3f = { x: 0, y: 0, z: 0 };
  private rotation: { pitch: number; yaw: number; headYaw: number } = {
    pitch: 0,
    yaw: 0,
    headYaw: 0
  };
  private onGround: boolean = false;
  private tick: bigint = 0n;

  constructor(client: Client) {
    this.client = client;
    this.setupPositionTracking();
  }

  private setupPositionTracking(): void {
    // Listen for StartGamePacket to get initial position
    this.client.on("StartGamePacket", (packet: any) => {
      this.position = packet.position;
      console.log(`Initial position: x=${this.position.x}, y=${this.position.y}, z=${this.position.z}`);
    });

    // Listen for MovePlayerPacket to track position updates
    this.client.on("MovePlayerPacket", (packet: any) => {
      if (packet.runtimeId === this.client.startGameData?.runtimeId) {
        this.position = packet.position;
        this.rotation = {
          pitch: packet.pitch,
          yaw: packet.yaw,
          headYaw: packet.headYaw
        };
        this.onGround = packet.onGround;
      }
    });
  }

  /**
   * Send a movement input to the server
   */
  private sendInput(inputFlags: InputData[], delta: Vector3f = { x: 0, y: 0, z: 0 }): void {
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
    packet.inputMode = 1; // Touch
    packet.playMode = 0; // Normal
    packet.interactionModel = 0; // Touch
    packet.vrGazeDirection = { x: 0, y: 0, z: 0 };
    packet.tick = this.tick++;
    packet.delta = delta;
    packet.analogMoveVector = { x: delta.x, y: delta.z }; // x and z for horizontal movement

    this.client.send(packet.serialize());
  }

  /**
   * Move forward
   */
  forward(distance: number = 0.1): void {
    console.log(`Moving forward by ${distance}`);
    // Calculate forward direction based on yaw
    const radians = (this.rotation.yaw * Math.PI) / 180;
    const deltaX = -Math.sin(radians) * distance;
    const deltaZ = Math.cos(radians) * distance;

    this.sendInput([InputData.Up, InputData.Sneaking], { x: deltaX, y: 0, z: deltaZ });
  }

  /**
   * Move backward
   */
  backward(distance: number = 0.1): void {
    console.log(`Moving backward by ${distance}`);
    const radians = (this.rotation.yaw * Math.PI) / 180;
    const deltaX = Math.sin(radians) * distance;
    const deltaZ = -Math.cos(radians) * distance;

    this.sendInput([InputData.Down, InputData.Sneaking], { x: deltaX, y: 0, z: deltaZ });
  }

  /**
   * Strafe left
   */
  left(distance: number = 0.1): void {
    console.log(`Moving left by ${distance}`);
    const radians = (this.rotation.yaw * Math.PI) / 180;
    const deltaX = -Math.cos(radians) * distance;
    const deltaZ = -Math.sin(radians) * distance;

    this.sendInput([InputData.Left, InputData.Sneaking], { x: deltaX, y: 0, z: deltaZ });
  }

  /**
   * Strafe right
   */
  right(distance: number = 0.1): void {
    console.log(`Moving right by ${distance}`);
    const radians = (this.rotation.yaw * Math.PI) / 180;
    const deltaX = Math.cos(radians) * distance;
    const deltaZ = Math.sin(radians) * distance;

    this.sendInput([InputData.Right, InputData.Sneaking], { x: deltaX, y: 0, z: deltaZ });
  }

  /**
   * Jump
   */
  jump(): void {
    console.log("Jumping");
    this.sendInput([InputData.Jumping, InputData.JumpDown], { x: 0, y: 0.42, z: 0 });
  }

  /**
   * Sneak/crouch
   */
  sneak(): void {
    console.log("Sneaking");
    this.sendInput([InputData.Sneaking, InputData.SneakDown]);
  }

  /**
   * Stop sneaking
   */
  unsneak(): void {
    console.log("Stop sneaking");
    this.sendInput([InputData.SneakUp]);
  }

  /**
   * Get current position
   */
  getPosition(): Vector3f {
    return { ...this.position };
  }

  /**
   * Get current rotation
   */
  getRotation() {
    return { ...this.rotation };
  }
}
