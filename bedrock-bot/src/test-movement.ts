import { BedrockBot } from "./bot";
import { BotMovement } from "./movement";
import { localConfig } from "./config";

async function main() {
  console.log("\n=== Movement Test ===\n");

  const bot = new BedrockBot(localConfig);
  await bot.connect();

  const client = bot.getClient();
  const movement = new BotMovement(client);

  // Wait for the bot to fully spawn before moving
  client.once("StartGamePacket", async () => {
    console.log("\n✓ Bot received StartGamePacket - spawning complete!\n");

    // Wait a moment for everything to settle
    await sleep(3000);

    console.log("=== Starting Movement Sequence ===\n");

    // Move forward
    console.log("1. Moving forward...");
    for (let i = 0; i < 5; i++) {
      movement.forward(0.2);
      await sleep(100);
    }
    await sleep(1000);

    // Jump
    console.log("\n2. Jumping...");
    movement.jump();
    await sleep(500);

    // Move backward
    console.log("\n3. Moving backward...");
    for (let i = 0; i < 5; i++) {
      movement.backward(0.2);
      await sleep(100);
    }
    await sleep(1000);

    // Strafe left
    console.log("\n4. Strafing left...");
    for (let i = 0; i < 5; i++) {
      movement.left(0.2);
      await sleep(100);
    }
    await sleep(1000);

    // Strafe right
    console.log("\n5. Strafing right...");
    for (let i = 0; i < 5; i++) {
      movement.right(0.2);
      await sleep(100);
    }
    await sleep(1000);

    // Sneak
    console.log("\n6. Sneaking...");
    movement.sneak();
    await sleep(2000);
    movement.unsneak();

    console.log("\n=== Movement Test Complete ===");
    console.log(`Final position: ${JSON.stringify(movement.getPosition())}`);
    console.log("\nBot will continue running. Press Ctrl+C to exit.");
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
