// index.js
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config(); // Optional if you're running locally

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Load token from Render environment
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("❌ No token found! Set TOKEN in Render Environment Variables.");
  process.exit(1);
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

client.login(TOKEN);
