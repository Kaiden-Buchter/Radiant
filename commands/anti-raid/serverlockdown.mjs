import { EmbedBuilder, ChannelType } from "discord.js";

export default {
  data: {
    name: "serverlockdown",
    description: "Lock / Unlock the server",
    permissions: ["Administrator"],
    permissionsRequired: "all",
    options: [
      {
        name: "lock",
        type: 5,
        description: "True to lock the server, false to unlock",
        required: true,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    const lock = interaction.options.getBoolean("lock");
    const channels = interaction.guild.channels.cache.filter(
      (channel) => channel.type === ChannelType.GuildText
    );

    if (channels.size === 0) {
      await interaction.reply({
        content: "No text channels found.",
        ephemeral: true,
      });
      return;
    }

    await toggleChannelLockdown(channels, lock, interaction);
  },
};

async function toggleChannelLockdown(channels, lock, interaction) {
  const everyoneRole = interaction.guild.roles.everyone;
  const permissionsEditPromises = channels.map((channel) =>
    channel.permissionOverwrites
      .edit(everyoneRole, { SendMessages: lock ? false : true })
      .catch((error) =>
        console.error(
          `Failed to edit permissions for channel ${channel.name}:`,
          error
        )
      )
  );

  try {
    await Promise.all(permissionsEditPromises);
    const embed = new EmbedBuilder()
      .setTitle("Server Lockdown")
      .setDescription(
        `The server has been **${
          lock ? "locked down" : "unlocked"
        }**. Members ${lock ? "**cannot**" : "**can now**"} send messages.`
      )
      .setColor(lock ? 0xff0000 : 0x00ff00)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error("Error locking/unlocking the server:", error);
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("There was an error trying to execute that command!")
      .setColor(0xff0000)
      .setTimestamp();

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}
