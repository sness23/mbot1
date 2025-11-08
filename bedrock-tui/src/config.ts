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
  username: "TUIBot",
  address: "127.0.0.1",
  port: 19132,
};

// Remote server configuration (sness.net)
export const remoteConfig: BotConfig = {
  offline: false,
  username: "TUIBot",
  address: "sness.net",
  port: 19132,
  tokensFolder: "./auth-tokens",
};

// Get config based on environment variable
export function getConfig(): BotConfig {
  return process.env.OFFLINE === "true" ? localConfig : remoteConfig;
}
