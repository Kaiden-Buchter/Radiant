import mongoose from "mongoose";
import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "dbstatus",
    description: "Check the database connection status",
    permissions: ["Administrator"],
    permissionsRequired: "all",
  },
  load: true,
  async execute(interaction) {
    let statusMessage = "";
    let color = "";
    switch (mongoose.connection.readyState) {
      case 0:
        statusMessage = "Disconnected";
        color = "#ff0000";
        break;
      case 1:
        statusMessage = "Connected";
        color = "#00ff00";
        break;
      case 2:
        statusMessage = "Connecting";
        color = "#ffff00";
        break;
      case 3:
        statusMessage = "Disconnecting";
        color = "#ff0000";
        break;
      default:
        statusMessage = "Unknown status";
        color = "#ff0000";
        break;
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle("Database Status")
      .setDescription(`The current database status is: **${statusMessage}**`);

    await interaction.reply({ embeds: [embed] });
  },
};
