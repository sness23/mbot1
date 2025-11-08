import { Client, TextPacket, TextPacketType } from "baltica";

const host = process.env.BEDROCK_HOST ?? "127.0.0.1";
const port = Number(process.env.BEDROCK_PORT ?? 19132);

const client = new Client({ hostname: host, port });

client.on("connected", async () => {
  console.log(`[client] connected to ${host}:${port}`);
});

client.on("text", (packet: TextPacket) => {
  if (packet.type === TextPacketType.Raw || packet.type === TextPacketType.Chat) {
    console.log(`[chat] ${packet.message}`);
  }
});

client.connect().catch((e) => {
  console.error("connect error:", e);
});
