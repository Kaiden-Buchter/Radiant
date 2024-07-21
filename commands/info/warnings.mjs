import { EmbedBuilder } from "discord.js";
import Warn from "../../schemas/Warn.mjs";

export default {
  data: {
    name: "warnings",
    description: "Display a user's warnings.",
    permissions: [],
    permissionsRequired: "none",
    options: [
      {
        name: "user",
        type: 6,
        description: "The user to display warnings for",
        required: true,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    const user = interaction.options.getUser("user");

    try {
      const userData = await Warn.findOne({ userId: user.id });

      if (!userData || userData.warns.length === 0) {
        const embed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("No Warnings")
          .setDescription(`${user.username} has no warnings.`);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      const warnings = userData.warns
        .map(
          (warn, index) =>
            `**Warning ${index + 1}:** ${warn.reason} (Moderator: ${
              warn.moderator
            })`
        )
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor("#FFFF00")
        .setTitle(`${user.username}'s Warnings`)
        .setDescription(warnings);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription(
          `Failed to get warnings for ${user.username}. Please try again.`
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
