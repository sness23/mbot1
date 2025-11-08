Got it—here are the freshest, actively-updated open-source **Bedrock (not Java)** client projects that can already connect to servers. I’ve sorted by recency and noted the language + why they’re good fits.

### Top picks (very current)

1. **SanctumTerra/Baltica** — TypeScript
   A focused Bedrock toolkit that ships a **Client**, **Server**, and **MITM proxy**. Latest release **v0.1.15 (Nov 5, 2025)** targets **1.21.120**. The README includes a dead-simple “Client Usage” snippet (connect + read chat) so you can be online in minutes. ([GitHub][1])

2. **PrismarineJS/bedrock-protocol** — Node.js
   Battle-tested protocol lib used widely in the Bedrock tooling ecosystem. Latest release **3.50.0 (Oct 30, 2025)** and supports versions up through **1.21.120**. The README shows a minimal client connect example and how to handle packets. If you want fast iteration with JS, this is great. ([GitHub][2])

3. **Sandertv/gophertunnel** — Go
   A “Swiss-army knife” for Bedrock networking. The README points to examples for **dialing a connection** and includes a working **MITM proxy** in `main.go`. As of **v1.47.5** it requires **Go 1.24**, which signals very recent upkeep. If you like strong typing + performance, Go is an excellent choice. ([GitHub][3])

### Solid alternates (Rust ecosystem)

* **bedrock-crustaceans/bedrock-rs** — Rust
  A modular **client+server** Bedrock toolkit (protocol, level, server crates). Good if you want Rust performance and a growing ecosystem; expect to wire some pieces yourself. ([GitHub][4])

* **zuri-mc/zuri** — Rust
  A (work-in-progress) **Bedrock client** with a simple CLI run flow and env-based config; connects to a local Bedrock server by default. Not as turnkey as the two picks above, but a nice Rust reference client. ([GitHub][5])

---

## Step 1: “just connect to a Bedrock server”

All four of the above can do this today. If you want the shortest path:

* **TypeScript:** use Baltica’s “Client Usage” example (connect, listen for chat, send a message). ([GitHub][1])
* **Node.js:** use bedrock-protocol’s minimal client connect example and start listening to packets. ([GitHub][6])
* **Go:** copy the “dial a connection” example referenced in gophertunnel’s README (and peek at the MITM file for a full end-to-end pattern). ([GitHub][3])

(Heads-up: Real servers may need **Xbox Live auth**; these libs support online auth and/or an **offline** toggle for local testing. See each README.)

---

## Step 2: “make the client cast a fishing line”

Mechanically, casting is the client sending “use item” while holding a fishing rod:

* On current Bedrock versions, **player input is carried by the `PlayerAuthInput` packet** (client→server). You:

  1. Equip/select the hotbar slot containing the **fishing rod** (typically via an equipment/update packet, depending on lib), then
  2. Send **input** indicating a **use-item** action for that tick.
     Both **bedrock-protocol** and **gophertunnel** expose typed packet APIs for this workflow; check their packet docs for the exact fields for your target version. ([UNPKG][7])

If you want a starting point, I’d prototype in **TypeScript** (Baltica or bedrock-protocol) because iteration is fast, then port to Go/Rust once you’ve nailed the packet sequence.

---

## Quick recommendations by preference

* **Fastest to proof-of-concept:** Baltica (TS) or bedrock-protocol (Node). ([GitHub][1])
* **Performance / static typing:** gophertunnel (Go). ([GitHub][3])
* **Rust fans / future engine work:** bedrock-rs or zuri. ([GitHub][4])

Want me to drop in a minimal “connect + echo chat” sample for your favorite language and then outline the exact packets for casting? I can do that next.

[1]: https://github.com/SanctumTerra/Baltica "GitHub - SanctumTerra/Baltica: Minecraft Bedrock Toolkit that provides fast and reliable Client, Server and Bridge (MITM Proxy)."
[2]: https://github.com/PrismarineJS/bedrock-protocol "GitHub - PrismarineJS/bedrock-protocol: Minecraft Bedrock protocol library, with authentication and encryption"
[3]: https://github.com/Sandertv/gophertunnel "GitHub - Sandertv/gophertunnel: General purpose library for Minecraft Bedrock Edition software written in Go"
[4]: https://github.com/bedrock-crustaceans/bedrock-rs?utm_source=chatgpt.com "Universal library for Minecraft Bedrock in Rust"
[5]: https://github.com/zuri-mc/zuri "GitHub - zuri-mc/zuri: A not-so-complete Minecraft: Bedrock Edition client in Rust."
[6]: https://github.com/PrismarineJS/bedrock-protocol?utm_source=chatgpt.com "PrismarineJS/bedrock-protocol"
[7]: https://app.unpkg.com/bedrock-protocol%403.49.0/files/docs/API.md?utm_source=chatgpt.com "bedrock-protocol"


