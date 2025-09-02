const fs = require('fs');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const DATA_FILE = './playerData.json';

// Load player data
let playerData = {};
if (fs.existsSync(DATA_FILE)) {
  playerData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Check your delivery stats (level, XP, balance).'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const user = interaction.user;

    // If user has no data, initialize
    if (!playerData[userId]) {
      playerData[userId] = { balance: 0, xp: 0, level: 1 };
      fs.writeFileSync(DATA_FILE, JSON.stringify(playerData, null, 2));
    }

    const { balance, xp, level } = playerData[userId];
    const xpNeeded = level * 100;

    // Create an embed for a nice look
    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle(`${user.username}'s Profile`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: '💰 Balance', value: `$${balance}`, inline: true },
        { name: '⭐ Level', value: `${level}`, inline: true },
        { name: '📈 XP', value: `${xp} / ${xpNeeded}`, inline: true }
      )
      .setFooter({ text: 'Keep delivering to level up!' });

    await interaction.reply({ embeds: [embed] });
  },
};
