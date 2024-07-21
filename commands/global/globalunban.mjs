import { MongoClient } from "mongodb";
import Ban from "../../schemas/Ban.mjs";
import { EmbedBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI_BANS;
  try {
    const client = await MongoClient.connect(mongoUri);
    return client.db("globalBan");
  } catch (err) {
    throw new Error("Failed to connect to MongoDB:", err);
  }
}

let db;

export default {
  data: {
    name: "globalunban",
    description: "Unban a user globally from all servers the bot is in",
    permissions: ["Administrator", "BanMembers"],
    permissionsRequired: "all",
    options: [
      {
        name: "userid",
        type: 3,
        description: "The ID of the user to unban",
        required: true,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    await interaction.deferReply();

    const userId = interaction.options.getString("userid");
    let unbanCount = 0;
    let failedCount = 0;

    if (!db) {
      db = await connectToDatabase();
    }

    const ban = await Ban.findOne({ userId: userId });
    if (!ban) {
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription("This user is not globally banned.");
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    for (const guildId of ban.guilds) {
      const guild = interaction.client.guilds.cache.get(guildId);
      if (!guild) continue;

      try {
        await guild.bans.remove(userId, "Synced global unban");
        unbanCount++;
      } catch (error) {
        console.error(
          `Failed to unban user ${userId} in guild ${guildId}:`,
          error
        );
        failedCount++;
      }
    }

    if (unbanCount > 0) {
      try {
        await Ban.deleteOne({ userId: userId });
      } catch (error) {
        console.error(`Failed to delete ban record for user ${userId}:`, error);
        failedCount++;
      }
    }

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Global Unban Report")
      .setDescription(
        `Attempted to globally unban User ${userId}.\n\nSuccesses: ${unbanCount}\nFailures: ${failedCount}`
      );
    await interaction.editReply({ embeds: [embed] });
  },
};
