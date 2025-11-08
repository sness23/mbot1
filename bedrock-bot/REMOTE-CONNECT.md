# Connecting to sness.net

This guide explains how to connect your bot to the remote server at sness.net.

## Quick Start

```bash
npm run dev:remote
```

## What Happens

### First Time Running

1. **Authentication Prompt**: The bot will display a message like:
   ```
   ⚠ Xbox Live Authentication Required:
     If this is your first time, a browser will open for login.
     Follow the prompts to sign in with your Microsoft/Xbox account.
     Tokens will be cached for future use.
   ```

2. **Browser Opens**: Your default browser will open with a Microsoft login page

3. **Login Flow**:
   - Sign in with your Microsoft/Xbox account
   - Approve the authentication request
   - The browser will show a success message

4. **Tokens Saved**: Authentication tokens are saved to `auth-tokens/ClaudeBot/`

5. **Bot Connects**: The bot will connect to sness.net using your Xbox account

### Subsequent Runs

- The bot will use cached tokens from `auth-tokens/`
- No browser login needed
- Instant connection to the server

## Important Notes

- **Your Gamertag**: The bot will appear in-game with YOUR Xbox gamertag (not "ClaudeBot")
- **One Account Per Bot**: Each bot needs its own Xbox account for simultaneous connections
- **Token Security**: Keep the `auth-tokens/` folder private (it's in .gitignore)

## Multiple Bots

To run multiple bots simultaneously:

1. Create a new config in `src/config.ts`:
   ```typescript
   export const remoteConfig2: BotConfig = {
     offline: false,
     username: "Bot2",  // Different username = different token folder
     address: "sness.net",
     port: 19132,
     tokensFolder: "./auth-tokens-bot2",
   };
   ```

2. Create a new script file (e.g., `src/remote2.ts`)

3. Each bot will need a separate Xbox account for authentication

## Troubleshooting

### "Authentication failed"
- Try deleting the `auth-tokens/` folder and re-authenticating
- Make sure you have a valid Xbox Live account

### "Connection refused"
- Check that sness.net is online and accepting connections
- Verify port 19132 is accessible
- Check your firewall settings

### Bot appears with wrong name
- The bot uses your Xbox gamertag, not the `username` config
- The `username` field only affects the token storage folder name

## Server Version Compatibility

- Local server version: 1.21.121.1
- Baltica version: 0.1.15 (supports 1.21.120)
- Should be compatible, but check for warnings about unknown packets
