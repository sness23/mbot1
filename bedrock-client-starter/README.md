# Bedrock Client Starters — Most-Recently Updated (as of 2025-11-07)

This kit collects actively-maintained open‑source **Minecraft Bedrock** client libraries that can **connect to a server** with minimal code, plus tiny starter snippets. (Java Edition projects are intentionally excluded.)

> Tip: Bedrock uses UDP/RakNet on port **19132** by default.

## Quick Picks

- **PrismarineJS `bedrock-protocol` (Node.js)** — actively maintained with frequent releases. Easiest “hello client” experience and great for quick scripting.  
  Repo: https://github.com/PrismarineJS/bedrock-protocol  
  API docs: https://app.unpkg.com/bedrock-protocol/files/docs/API.md

- **Sandertv `gophertunnel` (Go)** — production‑grade Bedrock network stack with simple `Dial` + packet loop and Realms/XBL support.  
  Repo: https://github.com/Sandertv/gophertunnel  
  Go pkg docs: https://pkg.go.dev/github.com/Sandertv/gophertunnel/minecraft

- **SanctumTerra `Baltica` (TypeScript)** — modern TS library with a straightforward `Client` API; clean “connect + echo text” example.  
  Repo: https://github.com/SanctumTerra/Baltica

- **bedrock-crustaceans `bedrock-rs` (Rust)** — modular Rust toolkit with client/server/protocol crates. Good if you want a Rust stack.  
  Repo: https://github.com/bedrock-crustaceans/bedrock-rs

- **zuri-mc `zuri` (Rust)** — an in‑progress Bedrock client using Bevy; connects to localhost by default; useful reference/client skeleton.  
  Repo: https://github.com/zuri-mc/zuri

---

## Minimal “Connect to a Server” Examples

> Replace `127.0.0.1` and `19132` with your server host/port. For LAN/offline testing, many stacks let you disable Xbox Live (XBL) auth.

### 1) Node.js — `bedrock-protocol`

File: `node-bedrock-protocol/client.js` (included)

```bash
npm init -y
npm i bedrock-protocol
node node-bedrock-protocol/client.js
```

### 2) Go — `gophertunnel`

File: `go-gophertunnel/main.go` (included)

```bash
cd go-gophertunnel
go mod init example.com/bedrock-client
go get github.com/Sandertv/gophertunnel@latest
go run .
```

### 3) TypeScript — `Baltica`

File: `ts-baltica/client.ts` (included)

```bash
# assumes Node 20+ with TS toolchain
npm i -D typescript ts-node @types/node
npm i baltica
npx ts-node ts-baltica/client.ts
```

### 4) Rust — `zuri` (client app in repo)

Zuri is a full client app; see its README for env vars and `cargo run --release`.  
Repo: https://github.com/zuri-mc/zuri

---

## Step 2: “Cast the fishing line” (control input)

At a high level, **casting** is a “use‑item” action from the client while holding a fishing rod. Practical notes per stack:

- **gophertunnel (Go):** modern Bedrock servers commonly use **server‑authoritative movement**. In that mode, clients send `PlayerAuthInput` packets each tick including input flags. To perform “use item”, you (a) ensure the correct selected hotbar slot and held item, and (b) send the appropriate input/interaction packets (`PlayerAuthInput` and/or item request transactions, depending on server settings). See the `minecraft/protocol/packet` docs for `PlayerAuthInput` and related types.

- **bedrock‑protocol (Node):** you queue packets on the client (e.g., `client.queue('text', ...)` in the examples). For item use, consult the protocol docs for `item_stack_request`/`inventory_transaction` vs. newer input flows, and send the corresponding packet with correct fields while the fishing rod is selected.

- **Baltica (TS)/Rust libs:** similar concept—set held item/slot, then send “use item” action with the right packet type for the targeted Bedrock version.

Because Bedrock input rules vary by version and by **server‑authoritative movement** setting, test on the exact server you target. The links in **Resources** map to the packet docs you’ll need.

---

## Resources

- Bedrock protocol docs (PrismarineJS): https://prismarinejs.github.io/minecraft-data/?v=bedrock_1.21.120&d=protocol  
- `bedrock-protocol` README & examples: https://github.com/PrismarineJS/bedrock-protocol#readme  
- `gophertunnel` package docs (`Dial`, `DoSpawn`, `ReadPacket`, `WritePacket`, `PlayerAuthInput`): https://pkg.go.dev/github.com/Sandertv/gophertunnel/minecraft  
- Bedrock Wiki — RakNet & protocol notes: https://wiki.bedrock.dev/servers/raknet and https://wiki.bedrock.dev/servers/bedrock  
- Zuri README (client env vars & defaults): https://github.com/zuri-mc/zuri#readme  
- Baltica README (client usage): https://github.com/SanctumTerra/Baltica#client-usage

---

## What to try next

1. **Smoke test** with `bedrock-protocol` or `gophertunnel` against your LAN/world.  
2. **Automate a join + chat echo** (already in the Node example).  
3. **Switch hotbar to fishing rod** and send a **use‑item action** according to the protocol version your server advertises.  
4. If your server uses server‑authoritative movement, ensure you send **`PlayerAuthInput`** every tick and include the **“use item”** input when casting.

---

_This bundle is a convenience starter. Check each upstream repo for licenses & attribution._
