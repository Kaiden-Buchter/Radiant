import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "ban",
    description: "Ban a user",
    permissions: ["Administrator", "BanMembers"],
    permissionsRequired: "some",
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
    const userId = interaction.options.getString("userid");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    try {
      await interaction.guild.members.ban(userId, { reason });
      await interaction.reply({
        content: `The user with ID ${userId} has been banned for: ${reason}`,
        ephemeral: true,
      });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription(`Failed to ban the user. Error: ${error.message}`);
      await interaction.reply({ embeds: [embed] });
    }
  },
};
