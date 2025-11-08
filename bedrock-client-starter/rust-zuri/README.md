# Zuri (Rust) quick notes

Zuri is a Bedrock client written in Rust using Bevy. It connects to `127.0.0.1:19132` by default.

Quickstart:

```bash
git clone https://github.com/zuri-mc/zuri
cd zuri
# Optional: edit `.env` to point to a remote server or toggle XBOX auth
echo 'ZURI_IP="127.0.0.1:19132"\nXBOX=false' > .env
cargo run --release
```

See the Zuri README for details and environment variables.
