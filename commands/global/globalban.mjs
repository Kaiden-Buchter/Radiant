import { MongoClient } from "mongodb";
import Ban from "../../schemas/Ban.mjs";
import { EmbedBuilder, PermissionsBitField } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI_BANS;
  try {
    const client = await MongoClient.connect(mongoUri);
    return client.db("bans");
  } catch (err) {
    throw new Error("Failed to connect to MongoDB:", err);
  }
}

let db;

export default {
  data: {
    name: "globalban",
    description: "Ban a user globally from all servers the bot is in",
    permissions: ["Administrator", "BanMembers"],
    permissionsRequired: "all",
    options: [
      {
        name: "userid",
        type: 3,
        description: "The ID of the user to ban",
        required: true,
      },
      {
        name: "reason",
        type: 3,
        description: "The reason for the ban",
        required: false,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    await interaction.deferReply();

    const userId = interaction.options.getString("userid");
    const reason = interaction.options.getString("reason")
      ? `${interaction.options.getString("reason")}`
      : "No reason provided";

    if (!db) {
      db = await connectToDatabase();
    }

    const guilds = Array.from(interaction.client.guilds.cache.values());
    const discordIdRegex = /^\d{17,19}$/;
    let bannedGuilds = new Set();
    let banCount = 0;
    let failedCount = 0;

    if (!discordIdRegex.test(userId)) {
      console.log(`Skipping: ${userId} is not a valid Discord ID.`);
      await interaction.editReply(
        `Skipping: ${userId} is not a valid Discord ID.`
      );
      return;
    }

    for (const guild of guilds) {
      try {
        const botMember = await guild.members.fetch(interaction.client.user.id);
        if (!botMember.permissions.has(PermissionsBitField.Flags.BanMembers))
          continue;

        const result = await guild.members.ban(userId, {
          reason: `Global Ban - [Radiant]: ${reason}`,
        });
        if (result) {
          bannedGuilds.add(guild.id);
          banCount++;
        }
      } catch (error) {
        console.error(
          `Failed to ban user ${userId} in guild ${guild.id}:`,
          error
        );
        failedCount++;
      }
    }

    try {
      let existingBan = await db.collection("bans").findOne({ userId: userId });
      if (!existingBan) {
        await db.collection("bans").insertOne(
          new Ban({
            userId: userId,
            guilds: Array.from(bannedGuilds),
            reason: reason,
          })
        );
      } else {
        const updatedGuilds = Array.from(
          new Set([...existingBan.guilds, ...bannedGuilds])
        );
        await db
          .collection("bans")
          .updateOne({ userId: userId }, { $set: { guilds: updatedGuilds } });
      }
    } catch (dbError) {
      console.error("Failed to update the database for the ban:", dbError);
      failedCount++;
    }

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Global Ban Report")
      .setDescription(`Globally banned <@${userId}> (${userId}).`)
      .addFields(
        { name: "Successes:", value: String(banCount), inline: true },
        { name: "Failures:", value: String(failedCount), inline: true },
        {
          name: "Executed By:",
          value: `<@${interaction.member.id}>`,
          inline: true,
        },
        { name: "Reason:", value: `\`${reason}\`` }
      )
      .setTimestamp()
      .setFooter({ text: `Banned in ${bannedGuilds.size} guilds` });

    await interaction.editReply({ embeds: [embed] });
  },
};
