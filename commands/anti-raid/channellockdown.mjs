import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "channellockdown",
    description: "Lock / Unlock a channel",
    permissions: ["Administrator"],
    permissionsRequired: "all",
    options: [
      {
        name: "channel",
        type: 7,
        description: "The channel to lock / unlock",
        required: true,
      },
      {
        name: "lock",
        type: 5,
        description: "True to lock the channel, false to unlock",
        required: true,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const lock = interaction.options.getBoolean("lock");
    const everyoneRole = interaction.guild.roles.everyone;

    try {
      await channel.permissionOverwrites.edit(everyoneRole, {
        SendMessages: lock ? false : true,
      });

      const successEmbed = new EmbedBuilder()
        .setTitle(`Channel ${lock ? "Locked" : "Unlocked"}`)
        .setDescription(
          `${channel.name} has been ${lock ? "locked" : "unlocked"}.`
        )
        .setColor(lock ? 0xff0000 : 0x00ff00);
      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription(
          `Failed to ${
            lock ? "lock" : "unlock"
          } the channel. Make sure the channel exists and the bot has the necessary permissions.`
        )
        .setColor(0xff0000);
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
