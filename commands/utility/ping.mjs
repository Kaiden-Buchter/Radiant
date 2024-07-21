import { EmbedBuilder } from "discord.js";
import os from "os";

export default {
  data: {
    name: "ping",
    description: "Ping the bot",
    permissions: [],
    permissionsRequired: "none",
  },
  load: true,
  async execute(interaction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    const roundTripLatency =
      sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = interaction.client.ws.ping;
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    const totalMemory = os.totalmem() / 1024 / 1024;
    const freeMemory = os.freemem() / 1024 / 1024;

    const totalSeconds = process.uptime();
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let uptimeString = "";
    if (days > 0) uptimeString += `${days} day${days > 1 ? "s" : ""}, `;
    if (hours > 0) uptimeString += `${hours} hour${hours > 1 ? "s" : ""}, `;
    if (minutes > 0)
      uptimeString += `${minutes} minute${minutes > 1 ? "s" : ""}, `;
    uptimeString += `${seconds} second${seconds > 1 ? "s" : ""}`;

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Ping Information")
      .addFields(
        {
          name: "Round-trip latency",
          value: `${roundTripLatency}ms`,
          inline: true,
        },
        { name: "API Latency", value: `${apiLatency}ms`, inline: true },
        { name: "Bot Uptime", value: uptimeString, inline: true },
        {
          name: "Memory Usage",
          value: `${memoryUsage.toFixed(2)} MB`,
          inline: true,
        },
        {
          name: "Total System Memory",
          value: `${totalMemory.toFixed(2)} MB`,
          inline: true,
        },
        {
          name: "Free System Memory",
          value: `${freeMemory.toFixed(2)} MB`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.editReply({ content: "Pong!", embeds: [embed] });
  },
};
