const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

const BALANCES_FILE = './balances.json';

// Load balances from file or initialize empty object
let balances = {};
if (fs.existsSync(BALANCES_FILE)) {
  balances = JSON.parse(fs.readFileSync(BALANCES_FILE, 'utf8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top delivery earners.'),
  async execute(interaction) {
    if (Object.keys(balances).length === 0) {
      return interaction.reply('📊 Nobody has earned any money yet!');
    }

    // Sort balances and get top 10
    const sorted = Object.entries(balances)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    let leaderboardText = '🏆 **Top Earners** 🏆\n\n';
    for (let i = 0; i < sorted.length; i++) {
      const [userId, money] = sorted[i];
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      const username = member ? member.user.username : 'Unknown User';
      leaderboardText += `**${i + 1}.** ${username} - $${money}\n`;
    }

    await interaction.reply(leaderboardText);
  },
};
