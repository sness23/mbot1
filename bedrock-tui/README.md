# Bedrock TUI - Terminal UI Client for Minecraft Bedrock

A fully-featured terminal user interface (TUI) for playing Minecraft Bedrock Edition from the command line. Control your character in real-time with keyboard input while viewing stats, inventory, chat, and more in a rich terminal interface.

## Features

🎮 **Real-time Keyboard Control** - Full WASD movement, jump, sneak
📊 **Multi-Panel Interface** - World view, stats, inventory, chat, and controls
💬 **Chat Integration** - Send and receive messages
🎯 **Position Tracking** - Live coordinates and rotation
📦 **Inventory Display** - See your hotbar and items
🌐 **Online & Offline Support** - Connect to local servers or Xbox Live
🚀 **Headless Operation** - Works over SSH, in tmux/screen
⚡ **Low Latency** - 20 tick/second game loop matching Minecraft

## Interface Layout

```
┌────────────────────┬──────────────────┐
│   World View       │   Player Stats   │
│   - Position       │   - Health       │
│   - Rotation       │   - Hunger       │
│   - Direction      │   - Experience   │
│   - Velocity       │   - Connection   │
│                    ├──────────────────┤
│                    │   Inventory      │
│                    │   - Hotbar 1-9   │
│                    │   - Items        │
├────────────────────┤                  │
│   Chat             ├──────────────────┤
│   [Messages]       │   Controls       │
│                    │   - Keybinds     │
└────────────────────┴──────────────────┘
```

## Quick Start

### Prerequisites

- Node.js v22+ installed
- For local testing: Minecraft Bedrock Dedicated Server
- For remote servers: Microsoft/Xbox account

### Installation

```bash
npm install
```

### Running the Client

#### Connect to Remote Server (sness.net with Xbox Live)

```bash
npm start
```

**First time:**
- Browser opens for Microsoft/Xbox login
- Sign in and approve
- Tokens cached in `auth-tokens/` for future use

#### Connect to Local Server (Offline Mode)

```bash
npm run dev:local
```

## Controls

### Movement
- **W** - Move forward
- **A** - Strafe left
- **S** - Move backward
- **D** - Strafe right
- **Space** - Jump
- **Shift** - Sneak

### Actions
- **1-9** - Select hotbar slot
- **T** - Open chat/command input
- **E** - Open inventory (planned)

### Interface
- **Tab** - Focus next panel
- **Shift+Tab** - Focus previous panel
- **Q** - Quit

## Configuration

Edit `src/config.ts` to configure:

```typescript
export const remoteConfig: BotConfig = {
  offline: false,           // Set to true for local servers
  username: "TUIBot",       // Your bot's name
  address: "sness.net",     // Server address
  port: 19132,              // Server port
  tokensFolder: "./auth-tokens", // Auth cache location
};
```

Or use environment variables:

```bash
OFFLINE=true npm start    # Force offline mode
```

## Architecture

### Components

**GameState** (`src/game-state.ts`)
- Tracks player position, rotation, stats, inventory
- Manages chat message history
- Provides utility methods (health bars, direction strings)

**BlessedClient** (`src/blessed-client.ts`)
- Creates and manages the terminal UI using blessed
- Multiple box widgets for different panels
- Renders game state to screen
- Handles UI input (chat, commands)

**InputHandler** (`src/input-handler.ts`)
- Captures keyboard input in real-time
- Maintains held key state
- Runs 20 tick/second game loop
- Sends PlayerAuthInputPacket to server

**Main** (`src/index.ts`)
- Integrates Baltica client with UI
- Event handling for packets (StartGamePacket, MovePlayerPacket, TextPacket)
- Connection management
- Rendering loop (10 FPS UI updates)

## How It Works

1. **Connection**: Baltica client connects to Bedrock server via RakNet/UDP
2. **Authentication**: Xbox Live auth (online) or direct connect (offline)
3. **Spawn**: Receive StartGamePacket with initial position
4. **Game Loop**: 20 ticks/second (50ms intervals)
   - Process held keys
   - Calculate movement deltas
   - Send PlayerAuthInputPacket to server
5. **Rendering**: UI updates 10 times/second (100ms intervals)
6. **Events**: Listen for server packets and update game state

## Protocol Details

- **Bedrock Version**: 1.21.120 (via Baltica v0.1.15)
- **Packet Types**: PlayerAuthInputPacket, MovePlayerPacket, TextPacket, StartGamePacket
- **Movement Model**: Server-authoritative with client prediction
- **Input Flags**: Up, Down, Left, Right, Jumping, Sneaking, etc.

## Advanced Usage

### Multiple Panels

The UI is divided into six panels:
1. **World View** (top-left, 60% width) - Position, rotation, movement state
2. **Stats** (top-right, 40% width) - Health, hunger, XP, connection
3. **Inventory** (middle-right) - Hotbar and items
4. **Controls** (bottom-right) - Keybind help
5. **Chat** (bottom-left) - Scrolling chat log
6. **Command Input** (bottom) - Hidden until 'T' pressed

### Sending Commands

Press **T** to open command input, type your message/command, press Enter.
- Chat messages: `Hello world`
- Commands: `/tp @s ~ ~10 ~` (if server supports)

### Running Over SSH

Works perfectly over SSH connections:

```bash
ssh user@host
cd bedrock-tui
npm start
```

### Running in tmux/screen

Ideal for persistent sessions:

```bash
tmux new -s minecraft
cd bedrock-tui
npm start
# Detach: Ctrl+B, D
# Reattach: tmux attach -t minecraft
```

## Troubleshooting

### "Cannot find package 'blessed'"

```bash
npm install
```

### "Connection refused"

- Check server is running and accessible
- Verify address and port in config
- Check firewall rules

### "Authentication failed"

- Delete `auth-tokens/` folder and re-authenticate
- Ensure you have a valid Xbox Live account

### Movement not working

- Make sure server uses server-authoritative movement
- Check console for packet errors
- Verify server version compatibility (1.21.x)

### UI rendering issues

- Ensure terminal supports Unicode and colors
- Try resizing terminal to at least 120x40
- Check TERM environment variable: `echo $TERM`

## Development

### Build

```bash
npm run build
```

Output in `dist/`

### Development Mode

```bash
npm run dev         # Remote server
npm run dev:local   # Local server
```

Uses `tsx` for hot TypeScript execution.

### Project Structure

```
bedrock-tui/
├── src/
│   ├── index.ts           # Main entry point
│   ├── config.ts          # Server configuration
│   ├── game-state.ts      # Game state management
│   ├── blessed-client.ts  # Terminal UI
│   └── input-handler.ts   # Keyboard input & game loop
├── package.json
├── tsconfig.json
└── README.md
```

## Roadmap

- [x] Real-time keyboard control
- [x] Multi-panel TUI interface
- [x] Position and rotation tracking
- [x] Chat integration
- [x] Hotbar selection
- [ ] Mouse look (rotation control)
- [ ] Block breaking/placing
- [ ] Full inventory management
- [ ] Chunk visualization (ASCII art)
- [ ] Entity rendering
- [ ] Auto-pathfinding
- [ ] Fishing automation
- [ ] Mining automation

## Comparison with Other Clients

| Feature                | bedrock-tui | bedrock-cli | bedrock-bot |
|------------------------|-------------|-------------|-------------|
| Real-time input        | ✓ Yes       | ✓ Yes       | ✗ No        |
| Rich UI                | ✓ Yes       | ✗ No        | ✗ No        |
| Multi-panel layout     | ✓ Yes       | ✗ No        | ✗ No        |
| Inventory display      | ✓ Yes       | ✗ No        | ✗ No        |
| Chat scrollback        | ✓ Yes       | ~ Limited   | ✓ Yes       |
| Headless               | ✓ Yes       | ✓ Yes       | ✓ Yes       |
| Works over SSH         | ✓ Yes       | ✓ Yes       | ✓ Yes       |
| Easy to extend         | ✓ Yes       | ~ Moderate  | ✓ Yes       |

## License

ISC

## Credits

- **Baltica**: Minecraft Bedrock protocol library by SanctumTerra
- **blessed**: Terminal interface library
- **@serenityjs/protocol**: Bedrock packet definitions

## Contributing

This is a research/personal project. Feel free to fork and modify for your needs.
