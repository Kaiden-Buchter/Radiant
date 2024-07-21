export default {
  data: {
    name: "disableantiraid",
    description: "Disable the anti-raid system",
    permissions: ["Administrator"],
    permissionsRequired: "all",
  },
  load: false,
  async execute(interaction) {
    const role = interaction.guild.roles.cache.find((r) => r.name === "Locked");
    if (!role) {
      await interaction.reply("The server is not locked.");
      return;
    }

    for (const member of interaction.guild.members.cache.values()) {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
      }
    }

    await interaction.reply("The server has been unlocked.");
  },
};
