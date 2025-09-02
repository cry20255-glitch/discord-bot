const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

const BALANCES_FILE = './balances.json';

// Load balances from file or initialize empty object
let balances = {};
if (fs.existsSync(BALANCES_FILE)) {
  balances = JSON.parse(fs.readFileSync(BALANCES_FILE, 'utf8'));
}

function saveBalances() {
  fs.writeFileSync(BALANCES_FILE, JSON.stringify(balances, null, 2));
}

// Predefined locations for deliveries
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delivery')
    .setDescription('Start a delivery job (Uber or DoorDash).')
    .addStringOption(option =>
      option.setName('service')
        .setDescription('Choose Uber or DoorDash')
        .setRequired(true)
        .addChoices(
          { name: 'Uber', value: 'uber' },
          { name: 'DoorDash', value: 'doordash' },
        )),
  async execute(interaction) {
    const service = interaction.options.getString('service');
    const userId = interaction.user.id;

    // Role Check
    const uberRole = interaction.guild.roles.cache.find(r => r.name === 'Uber');
    const doorDashRole = interaction.guild.roles.cache.find(r => r.name === 'DoorDash');

    if (service === 'uber' && !interaction.member.roles.cache.has(uberRole?.id)) {
      return interaction.reply({ content: '🚗 You need the **Uber** role to take Uber jobs!', ephemeral: true });
    }
    if (service === 'doordash' && !interaction.member.roles.cache.has(doorDashRole?.id)) {
      return interaction.reply({ content: '🍔 You need the **DoorDash** role to take DoorDash jobs!', ephemeral: true });
    }

    // Pick a random location
    const location = locations[Math.floor(Math.random() * locations.length)];

    // Set payouts
    const payout = service === 'uber'
      ? Math.floor(Math.random() * 200) + 200 // Uber pays $200-$400
      : Math.floor(Math.random() * 100) + 100; // DoorDash pays $100-$200

    // Update balance
    if (!balances[userId]) balances[userId] = 0;
    balances[userId] += payout;
    saveBalances();

    await interaction.reply(
      `✅ You completed a **${service.toUpperCase()}** delivery to **${location}** and earned **$${payout}**!`
    );
  },
};
