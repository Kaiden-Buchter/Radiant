import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "userinfo",
    description: "Get information about a user.",
    permissions: [],
    permissionsRequired: "none",
    options: [
      {
        name: "user",
        type: 6,
        description: "The user you want to get information about",
        required: true,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);

    const roles = member.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((role) => role.toString())
      .slice(0, -1);

    const highestRole = member.roles.highest;

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`${user.username}'s Information`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "User ID", value: user.id },
        { name: "Username", value: user.username },
        { name: "Created At", value: user.createdAt.toDateString() },
        { name: "Joined Server", value: member.joinedAt.toDateString() },
        { name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
        { name: "Highest Role", value: highestRole.toString(), inline: true },
        { name: "Role Count", value: `${roles.length}`, inline: true },
        { name: "Roles", value: roles.length ? roles.join(", ") : "None" }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
