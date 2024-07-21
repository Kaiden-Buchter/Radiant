import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "leaveserver",
    description: "Make the bot leave a specified server by its ID.",
    permissions: ["Administrator"],
    permissionsRequired: "all",
    options: [
      {
        name: "serverid",
        type: 3,
        description: "The ID of the server you want the bot to leave",
        required: true,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    await interaction.deferReply();

    const serverId = interaction.options.getString("serverid");

    const guild = interaction.client.guilds.cache.get(serverId);

    if (!guild) {
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription("I'm not in a server with that ID.");
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await guild.leave();

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Success")
      .setDescription(`I have left the server with ID ${serverId}.`);
    await interaction.reply({ embeds: [embed] });
  },
};
