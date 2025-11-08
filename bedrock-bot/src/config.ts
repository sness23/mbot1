export interface BotConfig {
  offline: boolean;
  username: string;
  address: string;
  port: number;
  tokensFolder?: string;
}

// Local server configuration
export const localConfig: BotConfig = {
  offline: true,
  username: "ClaudeBot",
  address: "127.0.0.1",
  port: 19132,
};

// Remote server configuration (sness.net)
export const remoteConfig: BotConfig = {
  offline: false,
  username: "ClaudeBot",
  address: "sness.net",
  port: 19132,
  tokensFolder: "./auth-tokens",
};
