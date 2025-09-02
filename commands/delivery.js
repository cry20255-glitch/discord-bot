const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');

const DATA_FILE = './playerData.json';

// Load player data (balances, xp, levels)
let playerData = {};
if (fs.existsSync(DATA_FILE)) {
  playerData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

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

const cooldowns = new Map();
const COOLDOWN_TIME = 60 * 1000; // 60 seconds

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

    // Cooldown
    if (cooldowns.has(userId)) {
      const remaining = cooldowns.get(userId) - Date.now();
      if (remaining > 0) {
        return interaction.reply({
          content: `⏳ You must wait **${Math.ceil(remaining / 1000)}s** before another delivery!`,
          ephemeral: true
        });
      }
    }

    // Role check
    const uberRole = interaction.guild.roles.cache.find(r => r.name === 'Uber');
    const doorDashRole = interaction.guild.roles.cache.find(r => r.name === 'DoorDash');

    if (service === 'uber' && !interaction.member.roles.cache.has(uberRole?.id)) {
      return interaction.reply({ content: '🚗 You need the **Uber** role to take Uber jobs!', ephemeral: true });
    }
    if (service === 'doordash' && !interaction.member.roles.cache.has(doorDashRole?.id)) {
      return interaction.reply({ content: '🍔 You need the **DoorDash** role to take DoorDash jobs!', ephemeral: true });
    }

    // Choose location and payout
    const location = locations[Math.floor(Math.random() * locations.length)];
    const payout = service === 'uber'
      ? Math.floor(Math.random() * 200) + 200
      : Math.floor(Math.random() * 100) + 100;

    // Give XP
    const xpEarned = Math.floor(Math.random() * 20) + 10;

    // Init player data
    if (!playerData[userId]) {
      playerData[userId] = { balance: 0, xp: 0, level: 1 };
    }

    // Update stats
    playerData[userId].balance += payout;
    playerData[userId].xp += xpEarned;

    // Leveling system
    const xpNeeded = playerData[userId].level * 100;
    let leveledUp = false;
    if (playerData[userId].xp >= xpNeeded) {
      playerData[userId].level++;
      playerData[userId].xp -= xpNeeded;
      leveledUp = true;
    }

    savePlayerData();

    cooldowns.set(userId, Date.now() + COOLDOWN_TIME);
    setTimeout(() => cooldowns.delete(userId), COOLDOWN_TIME);

    let replyMsg = `✅ You completed a **${service.toUpperCase()}** delivery to **${location}**!\n💰 Earned: **$${payout}**\n⭐ XP Gained: **${xpEarned}**\n`;
    if (leveledUp) replyMsg += `🎉 **You leveled up to Level ${playerData[userId].level}!**`;

    await interaction.reply(replyMsg);
  },
};

