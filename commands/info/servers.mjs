import mongoose from "mongoose";
import Ban from "../../schemas/Ban.mjs";
import { EmbedBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

async function getBansFromDatabase(guildId) {
  const bans = await Ban.find({ guilds: guildId });
  return bans;
}

function areBansSynced(guildBans, dbBans) {
  const guildBanSet = new Set(guildBans.map((ban) => ban.user.id));
  const dbBanSet = new Set(dbBans.map((ban) => ban.userId));

  return (
    guildBanSet.size === dbBanSet.size &&
    [...guildBanSet].every((user) => dbBanSet.has(user))
  );
}

export default {
  data: {
    name: "servers",
    description: "List all servers the bot is in",
    permissions: ["Administrator"],
    permissionsRequired: "all",
  },
  load: true,
  async execute(interaction) {
    const uri = process.env.MONGODB_URI_BANS;
    let connection = mongoose.connections.find(
      (connection) => connection.name === "bans"
    );

    if (!connection) {
      connection = await mongoose.createConnection(uri);
    }

    await interaction.deferReply();

    try {
      const guilds = interaction.client.guilds.cache;

      let embed = new EmbedBuilder().setColor("#0099ff").setTitle("Servers");

      let serverInfo = "";

      for (const guild of guilds.values()) {
        const fetchedGuild = await guild.fetch();

        const ownerId = fetchedGuild.ownerId ?? "Unknown";
        const owner = await fetchedGuild.fetchOwner();
        const ownerName = owner.user?.username ?? "Unknown";

        const bans = await fetchedGuild.bans.fetch();

        const banCount = bans.size;

        const dbBans = await getBansFromDatabase(guild.id);

        const bansSynced = areBansSynced(bans, dbBans);

        serverInfo += `Server Name: ${guild.name}\n`;
        serverInfo += `Server ID: ${guild.id}\n`;
        serverInfo += `Owner Name: ${ownerName}\n`;
        serverInfo += `Owner ID: ${ownerId}\n`;
        serverInfo += `Ban Count: ${banCount}\n`;
        serverInfo += `Bans Synced: ${bansSynced ? "Yes" : "No"}\n`;
        serverInfo += `Has Bans: ${banCount > 0 ? "Yes" : "No"}\n\n`;
      }

      let totalServers = guilds.size;
      let serverInfos = serverInfo.split("Server Name:");

      let fieldCount = 1;

      for (let i = 1; i < serverInfos.length; i++) {
        let serverInfo = "Server Name:" + serverInfos[i];
        let formattedServerInfo =
          "```" +
          serverInfo.replace(/: /g, ":   ").replace(/\n/g, "\n") +
          "```";
        embed.addFields({
          name: `Server Information ${fieldCount++}`,
          value: formattedServerInfo,
        });
      }

      embed.addFields({
        name: "Total Servers",
        value: totalServers.toString(),
      });

      await interaction.followUp({ embeds: [embed] });
    } catch (error) {
      console.error(error);
    }
  },
};

process.on("SIGINT", async () => {
  console.log("Closing MongoDB connection");
  await mongoose.connection.close();
  process.exit(0);
});
