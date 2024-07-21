import dotenv from "dotenv";
import { EmbedBuilder, PermissionsBitField } from "discord.js";

dotenv.config();

export default {
  data: {
    name: "openticket",
    description: "Open a support ticket",
    permissions: [],
    permissionsRequired: "none",
  },
  load: false,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const user = interaction.user;

    if (creatingTickets.has(user.id)) {
      return interaction.reply({
        content: "Your ticket is being created...",
        ephemeral: true,
      });
    }

    const existingTicket = guild.channels.cache.find(
      (channel) => channel.name === `ticket-${user.id}`
    );
    if (existingTicket) {
      return interaction.editReply({
        content: "You already have an open ticket.",
        ephemeral: true,
      });
    }

    const categoryID = process.env.TICKET_CATEGORY_ID;
    const supportRoleID = process.env.SUPPORT_ROLE_ID;

    creatingTickets.set(user.id, true);

    try {
      const channel = await guild.channels.create({
        name: `ticket-${user.id}`,
        type: 0,
        parent: categoryID,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },
          {
            id: supportRoleID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },
        ],
      });

      channel.setTopic(`Opened by: ${user.id}, Support: ${supportRoleID}`);

      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("New Ticket")
        .setDescription(
          "Please describe your issue or question here. A support team member will be with you shortly."
        );

      channel.send({ content: `<@&${supportRoleID}>`, embeds: [embed] });

      await interaction.editReply({
        content: `Your ticket has been opened. ${channel}`,
      });
    } catch (error) {
      console.error(error);
    } finally {
      creatingTickets.delete(user.id);
    }
  },
};
