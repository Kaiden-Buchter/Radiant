import { EmbedBuilder, ChannelType } from "discord.js";

export default {
  data: {
    name: "serverinfo",
    description: "Shows details about the server.",
    permissions: [],
    permissionsRequired: "none",
  },
  load: true,
  async execute(interaction) {
    const { guild } = interaction;
    const owner = await guild.fetchOwner();
    const rolesCount = guild.roles.cache.size;
    const textChannelsCount = guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText
    ).size;
    const voiceChannelsCount = guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildVoice
    ).size;
    const categoriesCount = guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildCategory
    ).size;

    const embed = new EmbedBuilder()
      .setTitle(`${guild.name}'s Information`)
      .setThumbnail(guild.iconURL()({ dynamic: true }))
      .addFields(
        { name: "Server ID", value: guild.id },
        { name: "Owner", value: owner.user.tag },
        { name: "Member Count", value: guild.memberCount.toString() },
        { name: "Creation Date", value: guild.createdAt.toDateString() },
        { name: "Region", value: guild.preferredLocale },
        {
          name: "Verification Level",
          value: guild.verificationLevel.toString(),
        },
        { name: "Roles Count", value: rolesCount.toString() },
        {
          name: "Channels",
          value: `Text: ${textChannelsCount}, Voice: ${voiceChannelsCount}, Categories: ${categoriesCount}`,
        }
      )
      .setColor("#0099ff");

    interaction.reply({ embeds: [embed] });
  },
};
