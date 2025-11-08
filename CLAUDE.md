# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository contains Minecraft Bedrock Edition bot implementations written in TypeScript. The project aims to create headless bots capable of connecting to Bedrock servers (local and remote) and performing automated tasks like fishing, mining, and eventually a custom scripting language.

## Project Structure

The repository is organized into several TypeScript sub-projects:

- **bedrock-bot/** - Main bot implementation with movement system and Xbox Live authentication
- **bedrock-cli/** - Interactive keyboard-controlled bot with real-time terminal input
- **bedrock-tui/** - Full-featured Terminal UI client with multi-panel interface (recommended)
- **bedrock-client-starter/** - Collection of reference implementations and documentation
- **docs/** - Project ideas and research notes
- **repos/** - Git submodules of upstream Bedrock libraries (Baltica, bedrock-protocol, gophertunnel)

## Core Technology Stack

- **Language:** TypeScript (Node.js v22+)
- **Main Library:** Baltica v0.1.15 (Bedrock protocol implementation)
- **Protocol Layer:** @serenityjs/protocol for packet definitions
- **Build Tool:** TypeScript compiler (tsc) + tsx for development
- **Target Platform:** Ubuntu Linux (primary)

## Development Commands

### bedrock-bot/

```bash
# Install dependencies
npm install

# Development mode - local server (offline, no Xbox auth)
npm run dev

# Development mode - remote server (sness.net, Xbox Live auth required)
npm run dev:remote

# Test movement system
npm run test:movement

# Build for production
npm run build

# Run production build
npm start              # Local server
npm start:remote       # Remote server
```

### bedrock-cli/

```bash
# Install dependencies
npm install

# Run interactive keyboard controller
npm start

# Build for production
npm run build
```

### bedrock-tui/ (Recommended)

```bash
# Install dependencies
npm install

# Run with remote server (sness.net, Xbox Live auth)
npm start

# Run with local server (offline mode)
npm run dev:local

# Development mode
npm run dev

# Build for production
npm run build
```

## Architecture

### BedrockBot Class (`bedrock-bot/src/bot.ts`)

The main bot wrapper that handles:
- Client initialization with Baltica
- Event handlers for connection, disconnection, errors
- Chat message listening
- Xbox Live authentication flow (when `offline: false`)

### BotMovement Class (`bedrock-bot/src/movement.ts`)

Movement system using `PlayerAuthInputPacket`:
- Position and rotation tracking via `StartGamePacket` and `MovePlayerPacket`
- Movement methods: `forward()`, `backward()`, `left()`, `right()`
- Actions: `jump()`, `sneak()`, `unsneak()`
- Position/rotation getters for navigation

Movement uses server-authoritative input model with tick-based `PlayerAuthInputPacket` containing:
- Position (x, y, z)
- Rotation (pitch, yaw, headYaw)
- Input flags (Up, Down, Left, Right, Jumping, Sneaking, etc.)
- Delta movement vector
- Analog move vector for horizontal movement

### Configuration (`bedrock-bot/src/config.ts`)

Two preset configurations:
- **localConfig** - Offline mode for 127.0.0.1:19132 (no Xbox auth)
- **remoteConfig** - Online mode for sness.net:19132 (requires Xbox Live)

Key config options:
- `offline: boolean` - Toggle Xbox Live authentication
- `username: string` - Bot display name (offline) or token folder name (online)
- `address: string` - Server hostname/IP
- `port: number` - Server port (default 19132)
- `tokensFolder?: string` - Where to cache Xbox auth tokens

### KeyboardController (`bedrock-cli/src/index.ts`)

Real-time keyboard input controller:
- Captures raw terminal input using readline/blessed
- Game loop running at 20 ticks/second (50ms intervals)
- Held key state tracking for smooth continuous movement
- Position display and chat integration

### Terminal UI Client (`bedrock-tui/`)

Full-featured terminal UI using blessed library with multi-panel layout:

**GameState** (`src/game-state.ts`)
- Central state management for position, rotation, stats, inventory
- Chat message history with timestamp
- Health/hunger bar rendering
- Direction string calculation from yaw

**BlessedClient** (`src/blessed-client.ts`)
- Six-panel layout using blessed widgets:
  - World View (60% left) - Position, rotation, movement state
  - Stats (top-right) - Health, hunger, XP, connection status
  - Inventory (mid-right) - Hotbar and item list
  - Controls (bottom-right) - Keybind reference
  - Chat (bottom-left) - Scrolling log with colors
  - Command Input (bottom) - Hidden textbox for chat/commands
- Tag-based color formatting (`{red-fg}text{/}`)
- Focus management with Tab/Shift+Tab
- Command handler integration

**InputHandler** (`src/input-handler.ts`)
- Keyboard event handling via blessed screen.key()
- 20 tick/second game loop
- Held key tracking with periodic clearing
- Movement calculation with yaw-based direction
- PlayerAuthInputPacket generation and sending

**Architecture Flow:**
1. Main creates GameState, BlessedClient, Baltica Client, InputHandler
2. InputHandler starts game loop (input → packets)
3. Baltica events update GameState
4. Render loop updates UI from GameState (10 FPS)
5. User keyboard input captured by blessed → InputHandler
6. Commands typed via 'T' key → sent as TextPacket

## Xbox Live Authentication

When connecting to online servers (`offline: false`):

1. **First Run:** Browser opens for Microsoft/Xbox login → tokens cached in `auth-tokens/` folder
2. **Subsequent Runs:** Cached tokens used automatically
3. **Bot Identity:** Bot appears with YOUR Xbox gamertag, not the configured username
4. **Multiple Bots:** Each bot needs its own Xbox account and separate `tokensFolder`

## Protocol Details

- **Bedrock Version:** Baltica supports 1.21.120
- **Server Version:** Local test server runs 1.21.121.1 (compatible but may show unknown packet warnings)
- **Transport:** UDP/RakNet on port 19132
- **Movement Model:** Server-authoritative with `PlayerAuthInputPacket`

## Known Issues

- Unknown packets 313 and 320 warnings (version mismatch between 1.21.120 and 1.21.121.1)
- Movement validation may reject client-predicted positions on some servers
- Physics not fully implemented (gravity, collision detection)

## Testing

To test bot locally:

1. Run a Minecraft Bedrock Dedicated Server on localhost:19132
2. Use `npm run dev` in bedrock-bot/ or `npm start` in bedrock-cli/
3. Connect from another device/instance to see the bot in-game

To test remote connection:

1. Ensure sness.net:19132 is accessible
2. Use `npm run dev:remote` - browser will open for Xbox authentication
3. Tokens cached for future runs

## Future Roadmap

- Auto-fishing functionality (use-item action with fishing rod)
- Auto-mining (block breaking)
- Highway building with obsidian placement
- Custom scripting language (miniverse/tinyverse based on Verse)

## Packet Resources

- Baltica client documentation: https://github.com/SanctumTerra/Baltica
- Bedrock protocol docs: https://prismarinejs.github.io/minecraft-data/?v=bedrock_1.21.120&d=protocol
- PlayerAuthInput reference: Part of @serenityjs/protocol package
