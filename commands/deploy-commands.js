const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

// Example locations from GTA 5
const LOCATIONS = [
  { name: 'Vespucci Beach', distance: 3 },
  { name: 'Del Perro Pier', distance: 5 },
  { name: 'Downtown Vinewood', distance: 8 },
  { name: 'Paleto Bay', distance: 15 },
  { name: 'Sandy Shores', distance: 12 }
];

const BALANCES_FILE = './balances.json';

// Load balances from file or initialize empty object
let balances = {};
if (fs.existsSync(BALANCES_FILE)) {
  balances = JSON.parse(fs.readFileSync(BALANCES_FILE, 'utf8'));
}

// Save balances to file
function saveBalances() {
  fs.writeFileSync(BALANCES_FILE, JSON.stringify(balances, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delivery')
    .setDescription('Start an Uber or DoorDash delivery job.')
    .addStringOption(option =>
      option.setName('service')
        .setDescription('Choose delivery service')
        .setRequired(true)
        .addChoices(
          { name: 'Uber', value: 'uber' },
          { name: 'DoorDash', value: 'doordash' }
        )
    ),
  async execute(interaction) {
    const service = interaction.options.getString('service');
    const userId = interaction.user.id;

    // Check for correct role
    const uberRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'uber');
    const doorDashRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'doordash');

    if (
      (service === 'uber' && (!uberRole || !interaction.member.roles.cache.has(uberRole.id))) ||
      (service === 'doordash' && (!doorDashRole || !interaction.member.roles.cache.has(doorDashRole.id)))
    ) {
      return interaction.reply({ content: `❌ You need the **${service}** role to use this command!`, ephemeral: true });
    }

    // Pick a random location
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

    // Calculate payout
    const payout = location.distance * (service === 'uber' ? 20 : 15);

    // Update balance
    if (!balances[userId]) balances[userId] = 0;
    balances[userId] += payout;
    saveBalances();

    await interaction.reply(
      `🚗 You completed a **${service.toUpperCase()}** delivery to **${location.name}**!\n` +
      `💰 You earned **$${payout}**. Total balance: **$${balances[userId]}**`
    );
  },
};

