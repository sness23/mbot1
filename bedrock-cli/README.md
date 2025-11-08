# Bedrock CLI - Keyboard Controller

An interactive command-line game that lets you control a Minecraft Bedrock bot with your keyboard in real-time!

## Features

🎮 **Real-time keyboard control** - Press keys to move the bot
⌨️  **Simple controls** - W/S for forward/backward, Space to jump
📍 **Position tracking** - See where you are in the world
💬 **Chat integration** - See chat messages in real-time

## Controls

```
W      - Move Forward
S      - Move Backward
SPACE  - Jump
P      - Show Position
H      - Show Help
Q      - Quit
```

## Quick Start

```bash
npm start
```

That's it! The bot will connect to `127.0.0.1:19132` and you can start controlling it with your keyboard.

## How It Works

1. Bot connects to the Minecraft Bedrock server
2. Raw keyboard input is captured in the terminal
3. Key presses are converted to movement packets
4. Packets are sent to the server in real-time
5. You see the bot move in-game!

## Configuration

Edit `src/index.ts` to change:
- `SERVER_ADDRESS` - Server IP (default: sness.net)
- `SERVER_PORT` - Server port (default: 19132)
- `BOT_USERNAME` - Bot's name (default: KeyboardBot)
- `OFFLINE_MODE` - Set to `true` for local server, `false` for online (default: false)

### Connect to Local Server

To connect to `127.0.0.1` instead:
1. Change `SERVER_ADDRESS` to `"127.0.0.1"`
2. Change `OFFLINE_MODE` to `true`

### Xbox Live Authentication

On first run, you'll need to authenticate:
1. A login code will appear in the console
2. Visit the Microsoft link and enter the code
3. Sign in with your Xbox account
4. Tokens are cached in `auth-tokens/` for future use

## Tips

- Make sure the Bedrock server is running before starting
- You can see the bot move if you connect from another device
- Movement uses PlayerAuthInputPacket for realistic physics
- Press 'P' frequently to check your position

## What's Next?

This is just the beginning! You can extend this with:
- A/D for strafing left/right
- Mouse look (rotation control)
- Block breaking/placing
- Inventory management
- Auto-pathfinding to coordinates
- Scripted movement sequences

## Have Fun!

You're literally playing Minecraft from the command line. How cool is that?! 🎮
