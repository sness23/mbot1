# Bedrock Bot

A simple Minecraft Bedrock Edition bot written in TypeScript using Baltica.

## Features

- Connects to both local and remote Minecraft Bedrock servers
- Offline mode support (no Xbox Live authentication required for local servers)
- Xbox Live authentication for online servers
- Listens to chat messages
- Ready to be extended with automation features

## Getting Started

### Prerequisites

- Node.js v22+ installed
- For local testing: A Minecraft Bedrock Dedicated Server running locally
- For remote servers: A Microsoft/Xbox account

### Installation

```bash
npm install
```

### Running the Bot

#### Connect to Local Server (Offline Mode)

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

#### Connect to Remote Server (Xbox Live Auth)

Development mode:
```bash
npm run dev:remote
```

Production mode:
```bash
npm run build
npm start:remote
```

**First time connecting to a remote server:**
- A browser window will open asking you to login with Microsoft/Xbox
- Follow the authentication prompts
- Tokens will be cached in `auth-tokens/` for future use
- You won't need to login again unless tokens expire

## Configuration

Edit `src/config.ts` to configure server settings:

**Local Server (`localConfig`):**
- `offline: true` - No Xbox Live authentication
- `username: "ClaudeBot"` - Bot's display name in offline mode
- `address: "127.0.0.1"` - Local server
- `port: 19132` - Default Bedrock port

**Remote Server (`remoteConfig`):**
- `offline: false` - Requires Xbox Live authentication
- `username: "ClaudeBot"` - Used for token storage folder name
- `address: "sness.net"` - Your remote server
- `port: 19132` - Default Bedrock port
- `tokensFolder: "./auth-tokens"` - Where auth tokens are cached

## Roadmap

- [x] Basic connection to server
- [ ] Auto-fishing functionality
- [ ] Auto-mining
- [ ] Highway building with obsidian
- [ ] Custom scripting language (miniverse/tinyverse)

## License

ISC
