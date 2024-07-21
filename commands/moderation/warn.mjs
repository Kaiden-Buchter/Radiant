import { EmbedBuilder } from "discord.js";
import Warn from "../../schemas/Warn.mjs";

export default {
  data: {
    name: "warn",
    description: "Warn a user.",
    permissions: ["Administrator", "ManageRoles"],
    permissionsRequired: "some",
    options: [
      {
        name: "user",
        type: 6,
        description: "The user to warn",
        required: true,
      },
      {
        name: "reason",
        type: 3,
        description: "The reason for the warning",
        required: true,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const moderator = interaction.user.id;

    try {
      await Warn.findOneAndUpdate(
        { userId: user.id },
        { $push: { warns: { reason, moderator } } },
        { new: true, upsert: true }
      );

      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Success")
        .setDescription(`Successfully warned ${user.username} for ${reason}.`);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription(`Failed to warn ${user.username}. Please try again.`);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
