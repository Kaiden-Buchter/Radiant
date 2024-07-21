import mongoose from "mongoose";
import Ban from "../../schemas/Ban.mjs";
import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "syncbans",
    description: "Syncs bans from the database to the server",
    permissions: ["Administrator", "BanMembers"],
    permissionsRequired: "all",
  },
  load: true,
  async execute(interaction) {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        "mongodb+srv://Admin:radiantAdmin8243@radiant.gej3efo.mongodb.net/bans?retryWrites=true&w=majority&appName=Radiant"
      );
    }

    const bans = await Ban.find({});
    const serverBans = await interaction.guild.bans.fetch();
    let bannedUsers = [];
    let unbannedUsers = [];

    for (const ban of bans) {
      if (!ban.guilds.includes(interaction.guild.id)) {
        ban.guilds.push(interaction.guild.id);
        await ban.save();
      }
      try {
        if (!serverBans.has(ban.userId)) {
          await interaction.guild.members.ban(ban.userId, {
            reason: `Global Ban - [Radiant]: ${ban.reason}`,
          });
          bannedUsers.push(ban.userId);
        }
      } catch (error) {
        const embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("Error")
          .setDescription(`Failed to ban user ${ban.userId}.`);
        await interaction.reply({ embeds: [embed] });
        return;
      }
    }

    for (const [userId] of serverBans) {
      if (!bans.some((ban) => ban.userId === userId)) {
        try {
          await interaction.guild.members.unban(userId);
          unbannedUsers.push(userId);
        } catch (error) {
          const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("Error")
            .setDescription(`Failed to unban user ${userId}.`);
          await interaction.reply({ embeds: [embed] });
          return;
        }
      }
    }

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Synced")
      .setDescription(
        `Synced bans from the database and cleaned up server bans.\n\nBanned Users: ${
          bannedUsers.join(", ") || "None"
        }\nUnbanned Users: ${unbannedUsers.join(", ") || "None"}`
      );
    await interaction.reply({ embeds: [embed] });
  },
};
