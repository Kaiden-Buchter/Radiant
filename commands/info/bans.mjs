import mongoose from "mongoose";
import Ban from "../../schemas/Ban.mjs";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

export default {
  data: {
    name: "bans",
    description: "Display all bans",
    permissions: ["BanMembers", "Administrator"],
    permissionsRequired: "some",
  },
  load: true,
  async execute(interaction) {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI_BANS);
    }

    const globalBans = await Ban.find({ guilds: interaction.guild.id });
    const serverBans = await interaction.guild.bans.fetch();

    const combinedBans = globalBans
      .map((ban) => ({
        userId: ban.userId,
        reason: ban.reason,
        type: "Global",
      }))
      .concat(
        serverBans.map((ban) => ({
          userId: ban.user.id,
          reason: ban.reason,
          type: "Server",
        }))
      )
      .reduce((acc, current) => {
        const x = acc.find((item) => item.userId === current.userId);
        if (!x) {
          return acc.concat([current]);
        } else if (x.type === "Server" && current.type === "Global") {
          return acc.map((item) =>
            item.userId === current.userId ? current : item
          );
        }
        return acc;
      }, []);

    if (combinedBans.length === 0) {
      const embed = new EmbedBuilder()
        .setColor("#FFA500")
        .setTitle("No Bans")
        .setDescription("There are no recorded bans in this server.");
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    function chunkArray(array, chunkSize) {
      const result = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
      }
      return result;
    }

    const banChunks = chunkArray(combinedBans, 25);
    const pageCount = banChunks.length;
    let currentPage = 0;

    function createBansEmbed(bansChunk) {
      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle(`Banned Users`)
        .setFooter({ text: `Page ${currentPage + 1} of ${banChunks.length}` });

      bansChunk.forEach((ban) => {
        embed.addFields({
          name: `UserId: ${ban.userId}`,
          value: `User: <@${ban.userId}>\nReason: ${ban.reason}\nType: ${ban.type}`,
          inline: true,
        });
      });

      return embed;
    }

    function createButtons() {
      const row = new ActionRowBuilder();

      row.addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === pageCount - 1)
      );

      return row;
    }

    const embed = createBansEmbed(banChunks[currentPage]);
    const buttons = createButtons();

    const message = await interaction.reply({
      embeds: [embed],
      components: [buttons],
      fetchReply: true,
    });
  },
};
