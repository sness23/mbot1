// Minimal Bedrock client using PrismarineJS bedrock-protocol
const bedrock = require('bedrock-protocol')

const host = process.env.BEDROCK_HOST || '127.0.0.1'
const port = Number(process.env.BEDROCK_PORT || 19132)
const username = process.env.BEDROCK_USERNAME || 'BedrockBot'
const offline = process.env.BEDROCK_OFFLINE !== 'false' // default true for local testing

const client = bedrock.createClient({ host, port, username, offline })

client.on('connect', () => {
  console.log(`[client] connected to ${host}:${port} as ${username}`)
})

client.on('join', () => {
  console.log('[client] joined world')
})

client.on('text', (pk) => {
  console.log(`[chat] <${pk.source_name}> ${pk.message}`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Disconnecting...')
  try { client.disconnect('Bye!') } catch {}
  process.exit(0)
})
