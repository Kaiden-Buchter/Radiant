import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "unban",
    description: "Unban a user",
    permissions: ["Administrator", "BanMembers"],
    permissionsRequired: "some",
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
    const userId = interaction.options.getString("userid");

    try {
      await interaction.guild.bans.remove(userId);
      await interaction.reply({
        content: `The user has been unbanned.`,
        ephemeral: true,
      });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription(`Failed to unban the user.`);
      await interaction.reply({ embeds: [embed] });
    }
  },
};
