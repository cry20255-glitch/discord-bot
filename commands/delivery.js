const { SlashCommandBuilder } = require('discord.js');

let truckers = {}; // Active delivery sessions
let balances = {}; // Player balances

// Example GTA V locations
const locations = [
  { name: "Los Santos Docks", distance: 5 },
  { name: "Paleto Bay", distance: 15 },
  { name: "Sandy Shores", distance: 10 },
  { name: "Vinewood Hills", distance: 7 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trucker')
    .setDescription('Start or end a trucker delivery shift')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Choose start or end')
        .setRequired(true)
        .addChoices(
          { name: 'Start Shift', value: 'start' },
          { name: 'End Shift', value: 'end' }
        )
    ),

  async execute(interaction) {
    const action = interaction.options.getString('action');
    const userId = interaction.user.id;
    const member = interaction.member;

    // Check for Trucker role
    if (!member.roles.cache.some(role => role.name.toLowerCase() === 'trucker')) {
      return interaction.reply({ content: '❌ You need the **Trucker** role to use this command.', ephemeral: true });
    }

    if (action === 'start') {
      if (truckers[userId]) {
        return interaction.reply({ content: '🚚 You are already on a delivery shift!', ephemeral: true });
      }

      const location = locations[Math.floor(Math.random() * locations.length)];
      truckers[userId] = location;

      return interaction.reply(`🚛 You started your delivery! Drive to **${location.name}** to drop off your package.`);
    }

    if (action === 'end') {
      if (!truckers[userId]) {
        return interaction.reply({ content: '❌ You are not currently on a shift.', ephemeral: true });
      }

      const location = truckers[userId];
      const payout = location.distance * 100; // Example: 100 per distance unit
      balances[userId] = (balances[userId] || 0) + payout;

      delete truckers[userId];

      return interaction.reply(`✅ Delivery complete! You earned **$${payout}**. Your total balance is **$${balances[userId]}**.`);
    }
  },
};
