import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "closeticket",
    description: "Close a support ticket",
    permissions: [],
    permissionsRequired: "none",
  },
  load: false,
  async execute(interaction) {
    const guild = interaction.guild;
    const user = interaction.user;

    const ticketChannel = interaction.channel;

    if (!ticketChannel.name.startsWith("ticket-")) {
      return interaction.reply({
        content: "You do not have an open ticket.",
        ephemeral: true,
      });
    }

    const topic = ticketChannel.topic;

    if (!topic) {
      return interaction.reply({
        content: "This ticket does not have a valid topic.",
        ephemeral: true,
      });
    }

    const openedById = topic.split(", ")[0].split(": ")[1];
    const supportId = topic.split(", ")[1].split(": ")[1];

    const openedByUser = await guild.members.fetch(openedById);

    const member = await guild.members.fetch(user.id);

    if (member.roles.cache.has(supportId) || openedById === openedByUser.id) {
      const messages = await ticketChannel.messages.fetch();

      const transcript = messages
        .map((m) => `${m.author.username}: ${m.content}`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Ticket Transcript")
        .setDescription(transcript);

      try {
        await openedByUser.send({ embeds: [embed] });
      } catch (error) {
        if (error.code === 50007) {
          return user.send({
            content:
              "Unable to send transcript to the user. They might have DMs disabled.",
          });
        }
        console.error(error);
      }
      ticketChannel.delete();
    } else {
      return interaction.reply({
        content: "You do not have permission to close this ticket.",
        ephemeral: true,
      });
    }
  },
};
