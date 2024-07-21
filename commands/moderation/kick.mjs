import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "kick",
    description: "Kick a user",
    permissions: ["Administrator", "KickMembers"],
    permissionsRequired: "some",
    options: [
      {
        name: "user",
        type: 6,
        description: "The user to kick",
        required: true,
      },
      {
        name: "reason",
        type: 3,
        description: "Reason for kicking the user",
        required: false,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("reason") || "No reason provided";
    const member = interaction.guild.members.cache.get(user.id);

    if (
      interaction.member.roles.highest.position <= member.roles.highest.position
    ) {
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription(
          "You cannot kick a user who has the same or a higher role than you."
        );
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    try {
      await member.kick(reason);
      await interaction.reply({
        content: `${user.tag} has been kicked for: ${reason}`,
        ephemeral: true,
      });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription(`Failed to kick the user. Error: ${error.message}`);
      await interaction.reply({ embeds: [embed] });
    }
  },
};
