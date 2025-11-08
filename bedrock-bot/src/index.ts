import { BedrockBot } from "./bot";
import { localConfig } from "./config";

async function main() {
  const bot = new BedrockBot(localConfig);
  await bot.connect();
}

// Run the bot
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
