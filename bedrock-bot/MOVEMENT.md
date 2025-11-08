# Bot Movement Guide

## What the Bot Can Do

I've created a movement system for the bot! Here's what's available:

### Movement Module (`src/movement.ts`)

The `BotMovement` class provides these capabilities:

#### Basic Movement
- **`forward(distance)`** - Move forward
- **`backward(distance)`** - Move backward
- **`left(distance)`** - Strafe left
- **`right(distance)`** - Strafe right

#### Actions
- **`jump()`** - Jump
- **`sneak()`** - Start sneaking/crouching
- **`unsneak()`** - Stop sneaking

#### Info
- **`getPosition()`** - Get current XYZ coordinates
- **`getRotation()`** - Get current pitch/yaw/headYaw

### How It Works

Movement in Minecraft Bedrock uses the **PlayerAuthInputPacket** which contains:
- Position (x, y, z)
- Rotation (pitch, yaw, headYaw)
- Input flags (Up, Down, Left, Right, Jumping, Sneaking, etc.)
- Delta movement vector
- Tick counter

The bot tracks its position by listening to:
- `StartGamePacket` - Initial spawn position
- `MovePlayerPacket` - Position updates from server

### Example Usage

```typescript
import { BedrockBot } from "./bot";
import { BotMovement } from "./movement";
import { localConfig } from "./config";

const bot = new BedrockBot(localConfig);
await bot.connect();

const movement = new BotMovement(bot.getClient());

// Wait for bot to spawn
bot.getClient().once("StartGamePacket", async () => {
  // Move forward 5 times
  for (let i = 0; i < 5; i++) {
    movement.forward(0.2);
    await sleep(100);
  }

  // Jump
  movement.jump();

  // Get position
  console.log(movement.getPosition());
});
```

## Current Status

The movement system is **implemented** but may need some adjustments:

1. **Packet Version**: The server is running 1.21.121.1 and Baltica supports 1.21.120
2. **Unknown Packets**: We're seeing warnings about packets 313 and 320
3. **Position Tracking**: The bot can track its position but server-side validation may reject movements

## Next Steps

To get movement fully working:

1. **Test with sness.net** - The remote server might have different validation
2. **Adjust packet structure** - May need to tweak PlayerAuthInputPacket fields
3. **Add physics** - Implement gravity, collision detection
4. **Pathfinding** - Add A* pathfinding for smart navigation

## Other Capabilities

Beyond movement, the bot can:
- ✅ **Chat** - Send and receive chat messages
- ✅ **Listen to events** - React to any packet from the server
- 🚧 **Use items** - Cast fishing rod, use blocks (needs implementation)
- 🚧 **Break blocks** - Mine/dig (needs implementation)
- 🚧 **Place blocks** - Build structures (needs implementation)
- 🚧 **Inventory management** - Access and organize items (needs implementation)

The foundation is there - we just need to add the specific packet handling for each feature!
