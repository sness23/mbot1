# Bedrock Test - Simple Movement Debugger

A minimal test client to debug basic Minecraft Bedrock movement. No fancy UI, just pure logging and simple movement commands.

## What It Does

The bot will:
1. Connect to server
2. Wait 2 seconds after spawning
3. Walk **forward** 1 block, wait 1 second
4. Repeat forward movement 5 times total
5. Walk **backward** 1 block, wait 1 second
6. Repeat backward movement 5 times total
7. Loop forever (forward 5x, backward 5x, repeat)

## Logging

Extremely verbose logging to debug issues:
- `[INIT]` - Initialization
- `[AUTH]` - Authentication events
- `[CONNECT]` - Connection events
- `[SPAWN]` - Spawn/position initialization
- `[MOVE]` - Movement attempts and position updates
- `[PACKET]` - Packet sending details
- `[CHAT]` - Chat messages
- `[TEST]` - Test execution flow
- `[ERROR]` - Errors

## Quick Start

### Prerequisites

```bash
npm install
```

### Run Against Local Server (Offline)

```bash
npm run dev:local
```

### Run Against Remote Server (Xbox Live)

```bash
npm start
```

## Expected Output

```
============================================================
BEDROCK MOVEMENT TEST CLIENT
============================================================
Server: 127.0.0.1:19132
Mode: OFFLINE
Bot: TestBot
============================================================
[04:20:15.123] [INIT] Creating Baltica client...
[04:20:15.124] [EVENTS] Setting up event handlers...
[04:20:15.125] [CONNECT] Attempting to connect...
[04:20:15.500] [CONNECT] ✓ Connected to server!
[04:20:15.750] [SPAWN] Received StartGamePacket
[04:20:15.751] [SPAWN] ✓ Spawned in world!
    Data: {
      "position": { "x": 100, "y": 64, "z": 200 },
      "rotation": { "pitch": 0, "yaw": 0, "headYaw": 0 }
    }
[04:20:17.751] [TEST] Starting movement test in 2 seconds...
[04:20:19.751] [TEST] ==================================================
[04:20:19.751] [TEST] STARTING MOVEMENT TEST
[04:20:19.751] [TEST] Pattern: Forward 5 blocks, Backward 5 blocks, REPEAT
[04:20:19.751] [TEST] ==================================================
[04:20:19.751] [TEST] ──────────────────────────────────────────────────
[04:20:19.751] [TEST] Move #1 - FORWARD (step 1/5)
[04:20:19.751] [TEST] Current position: X=100.00, Y=64.00, Z=200.00
[04:20:19.751] [MOVE] Attempting to move 1 block forward...
[04:20:19.751] [MOVE] Movement calculation
    Data: {
      "yaw": 0,
      "radians": 0,
      "direction": "forward",
      "deltaX": 0,
      "deltaZ": 1
    }
[04:20:19.752] [PACKET] Sending PlayerAuthInputPacket
    Data: {
      "position": { "x": 100, "y": 64, "z": 200.05 },
      "inputData": ["Up"],
      "delta": { "x": 0, "y": 0, "z": 0.05 },
      "tick": "0"
    }
[04:20:19.850] [MOVE] Server updated position
    Data: {
      "from": { "x": 100, "y": 64, "z": 200 },
      "to": { "x": 100, "y": 64, "z": 200.5 },
      "delta": { "x": 0, "y": 0, "z": 0.5 }
    }
...
```

## Configuration

Edit `src/index.ts` to change:

```typescript
const SERVER_ADDRESS = OFFLINE ? "127.0.0.1" : "sness.net";
const SERVER_PORT = 19132;
const BOT_USERNAME = "TestBot";
```

## How Movement Works

1. **Calculate direction** from yaw (rotation)
2. **Send 20 packets** over 1 second (20 ticks/sec)
3. Each packet moves `1/20th` of a block
4. Total movement: **1 block per second**

## Debugging

### Bot connects but doesn't move

Check logs for:
- `[SPAWN]` - Did bot spawn successfully?
- `[PACKET]` - Are packets being sent?
- `[MOVE]` - Is server acknowledging movement?

### "Server updated position" never appears

Server is rejecting movement. Possible causes:
- Server-side movement validation
- Incorrect packet structure
- Protocol version mismatch

### Position jumps back

Server is teleporting bot back. Usually means:
- Client-predicted position too different from server
- Anti-cheat triggering
- Physics validation failing

## Packet Details

The bot sends `PlayerAuthInputPacket` with:
- `position` - Current bot position (client-predicted)
- `rotation` - Pitch, yaw, headYaw
- `inputData` - Array of input flags (Up, Down, Left, Right, etc.)
- `delta` - Movement vector this tick
- `analogMoveVector` - Horizontal movement (x, z)
- `tick` - Incremental tick counter
- `inputMode` - 1 (Touch mode)
- `playMode` - 0 (Normal)

## Testing Checklist

- [ ] Bot connects successfully
- [ ] Bot spawns and receives position
- [ ] Test starts after 2 seconds
- [ ] Packets are being sent (check logs)
- [ ] Server acknowledges position updates
- [ ] Bot actually moves in-game (connect from another client to verify)

## Next Steps

Once basic movement works:
1. Test rotation (looking around)
2. Test jumping
3. Test sneaking
4. Add more complex movement patterns
5. Build full TUI on top of working foundation

## Notes

- No fancy UI = easier to debug
- Verbose logging = see exactly what's happening
- Simple pattern = easy to verify in-game
- 1 second delays = easy to follow along

This is the foundation. Get this working, THEN add complexity! 🎯
