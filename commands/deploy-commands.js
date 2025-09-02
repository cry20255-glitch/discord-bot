const { SlashCommandBuilder } = require('discord.js');

// Example locations from GTA 5
const LOCATIONS = [
  { name: 'Vespucci Beach', distance: 3 },
  { name: 'Del Perro Pier', distance: 5 },
  { name: 'Downtown Vinewood', distance: 8 },
  { name: 'Paleto Bay', distance: 15 },
  { name: 'Sandy Shores', distance: 12 }
];

let balances = {}; // Store balances in memory

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

    // Pick a random location
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

    // Calculate payout based on distance
    const payout = location.distance * (service === 'uber' ? 20 : 15);

    // Add balance
    if (!balances[userId]) balances[userId] = 0;
    balances[userId] += payout;

    await interaction.reply(
      `🚗 You completed a **${service.toUpperCase()}** delivery to **${location.name}**!\n` +
      `💰 You earned **$${payout}**. Total balance: **$${balances[userId]}**`
    );
  },
};
