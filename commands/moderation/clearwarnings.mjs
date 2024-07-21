import { EmbedBuilder } from "discord.js";
import Warn from "../../schemas/Warn.mjs";

export default {
  data: {
    name: "clearwarnings",
    description: "Clear all warnings for a user.",
    permissions: ["Administrator", "ManageRoles"],
    permissionsRequired: "some",
    options: [
      {
        name: "user",
        type: 6,
        description: "The user to clear warnings for",
        required: true,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    const user = interaction.options.getUser("user");

    try {
      const result = await Warn.findOneAndDelete({ userId: user.id });

      if (!result) {
        const embed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("No Warnings")
          .setDescription(`${user.username} had no warnings.`);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Warnings Cleared")
        .setDescription(`Cleared all warnings for ${user.username}.`);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription(
          `Failed to clear warnings for ${user.username}. Please try again.`
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
