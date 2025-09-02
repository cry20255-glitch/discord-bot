// index.js
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = '!';
let truckers = {}; // Active delivery sessions
let balances = {}; // Player balances

// Load balances from file
if (fs.existsSync('balances.json')) {
  balances = JSON.parse(fs.readFileSync('balances.json'));
}

// Save balances to file
function saveBalances() {
  fs.writeFileSync('balances.json', JSON.stringify(balances, null, 2));
}

// When bot is ready
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Listen for commands
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Check role requirement
  if (!message.member.roles.cache.some((role) => role.name === 'trucker') && command !== 'balance') {
    return message.reply('🚫 You need the **trucker** role to use this command.');
  }

  if (command === 'startshift') {
    if (truckers[message.author.id]) {
      return message.reply('🚚 You are already on a shift!');
    }
    truckers[message.author.id] = { deliveries: 0 };
    return message.reply('🟢 Shift started! Use `!deliver` to deliver boxes.');
  }

  if (command === 'deliver') {
    if (!truckers[message.author.id]) {
      return message.reply('❌ You are not on a shift! Start with `!startshift`.');
    }

    // Locations and payout
    const locations = [
      { name: 'Los Santos Docks', payout: 100 },
      { name: 'Paleto Bay', payout: 250 },
      { name: 'Sandy Shores', payout: 200 },
      { name: 'Downtown Vinewood', payout: 150 },
    ];
    const delivery = locations[Math.floor(Math.random() * locations.length)];

    truckers[message.author.id].deliveries += 1;

    return message.reply(`📦 Delivered to **${delivery.name}** for **$${delivery.payout}**!`);
  }

  if (command === 'endshift') {
    const session = truckers[message.author.id];
    if (!session) return message.reply('❌ You are not on a shift.');

    // Calculate earnings
    const deliveries = session.deliveries;
    const totalPay = deliveries * 100; // Simple payout formula

    // Add to balance
    balances[message.author.id] = (balances[message.author.id] || 0) + totalPay;
    saveBalances();

    delete truckers[message.author.id];
    return message.reply(`🔴 Shift ended! You delivered **${deliveries} boxes** and earned **$${totalPay}**.`);
  }

  if (command === 'balance') {
    const bal = balances[message.author.id] || 0;
    return message.reply(`💰 Your balance: **$${bal}**`);
  }
});

// Login
client.login(process.env.DISCORD_TOKEN);
