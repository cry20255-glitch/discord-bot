const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

const DATA_FILE = './playerData.json';
let playerData = {};

// Load player data
if (fs.existsSync(DATA_FILE)) {
  playerData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// Save player data
function savePlayerData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(playerData, null, 2));
}

// Delivery locations
const locations = [
  "Vespucci Beach",
  "Downtown Vinewood",
  "Sandy Shores",
  "Paleto Bay",
  "Los Santos Airport",
  "Mirror Park",
  "Grapeseed",
  "Rockford Hills"
];

// Cooldowns
const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 1000; // 60 seconds

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delivery')
    .setDescription('Start a delivery job (Uber, DoorDash, or Trucker).')
    .addStringOption(option =>
      option.setName('service')
        .setDescription('Choose a service')
        .setRequired(true)
        .addChoices(
          { name: 'Uber', value: 'uber' },
          { name: 'DoorDash', value: 'doordash' },
          { name: 'Trucker', value: 'trucker' }
        )
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const service = interaction.options.getString('service');

    // Check cooldown
    const now = Date.now();
    if (cooldowns.has(userId)) {
      const expiration = cooldowns.get(userId) + COOLDOWN_TIME;
      if (now < expiration) {
        const remaining = Math.ceil((expiration - now) / 1000);
        return interaction.reply({ content: `⏳ Please wait **${remaining} seconds** before doing another delivery.`, ephemeral: true });
      }
    }

    // Put user on cooldown
    cooldowns.set(userId, now);

    await interaction.deferReply(); // Prevent timeout

    // Choose random location
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];

    // Earnings based on service
    let minPay, maxPay, time;
    if (service === 'uber') {
      minPay = 100; maxPay = 300; time = 3000; // 3 sec wait
    } else if (service === 'doordash') {
      minPay = 150; maxPay = 400; time = 4000; // 4 sec wait
    } else if (service === 'trucker') {
      minPay = 500; maxPay = 1000; time = 6000; // 6 sec wait
    }

    const earnings = Math.floor(Math.random() * (maxPay - minPay + 1)) + minPay;

    // Simulate delivery
    setTimeout(() => {
      // Update player data
      if (!playerData[userId]) {
        playerData[userId] = { balance: 0, xp: 0, level: 1 };
      }
      playerData[userId].balance += earnings;
      playerData[userId].xp += Math.floor(earnings / 10);
      savePlayerData();

      interaction.editReply(
        `🚗 You completed a **${service}** delivery to **${randomLocation}** and earned **$${earnings}**!\n💰 Your new balance: **$${playerData[userId].balance}**`
      );
    }, time);
  },
};
