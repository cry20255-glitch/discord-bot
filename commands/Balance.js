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
    .setName('balance')
    .setDescription('Check your delivery earnings.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const balance = balances[userId] || 0;

    await interaction.reply(`💰 **${interaction.user.username}**, your total balance is: **$${balance}**`);
  },
};
