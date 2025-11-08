import { BedrockBot } from "./bot";
import { remoteConfig } from "./config";

async function main() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║  Connecting to Remote Server (sness.net)      ║");
  console.log("╚════════════════════════════════════════════════╝\n");

  const bot = new BedrockBot(remoteConfig);
  await bot.connect();
}

// Run the bot
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
