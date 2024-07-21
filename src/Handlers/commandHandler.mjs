import {
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import dotenv from "dotenv";

dotenv.config();

let openTickets = new Map();

async function hasPermission(interaction, command) {
  let missingPermissions = [];
  let permissionMessage;

  switch (command.data.permissionsRequired) {
    case "all":
      permissionMessage =
        "You must have all the required permissions to run this command.";
      missingPermissions = command.data.permissions.filter(
        (permission) =>
          !interaction.member.permissions.has(
            PermissionsBitField.Flags[permission]
          )
      );
      break;
    case "some":
      permissionMessage =
        "You must have at least one of the required permissions to run this command.";
      if (
        command.data.permissions.some((permission) =>
          interaction.member.permissions.has(
            PermissionsBitField.Flags[permission]
          )
        )
      )
        return true;
      missingPermissions = command.data.permissions;
      break;
    case "none":
      return true;
  }

  if (missingPermissions.length > 0) {
    const embed = new EmbedBuilder()
      .setTitle("Missing Permissions")
      .setDescription(permissionMessage)
      .addFields(
        { name: "Command", value: `\`${command.data.name}\``, inline: true },
        {
          name: "Required Permissions",
          value: `\`${missingPermissions.join("`, `")}\``,
          inline: true,
        },
        {
          name: "Required Type",
          value: command.data.permissionsRequired,
          inline: true,
        }
      )
      .setColor("#FF0000");

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return false;
  }

  return true;
}

export default async function interactionHandler(client, interaction) {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (await hasPermission(interaction, command)) {
      try {
        await command.execute(interaction);
      } catch (executionError) {
        console.error(executionError);
        if (!interaction.replied) {
          try {
            await interaction.reply({
              content: "There was an error while executing this command!",
              ephemeral: true,
            });
          } catch (replyError) {
            console.error("Failed to send error message:", replyError);
          }
        }
      }
    }
  } else if (interaction.isButton()) {
    switch (interaction.customId) {
      case "open_ticket":
        await handleOpenTicket(interaction);
        break;
      case "claim_ticket":
        await handleClaimTicket(interaction);
        break;
      case "close_ticket":
        await handleCloseTicket(interaction, client);
        break;
    }
  }
}

async function handleOpenTicket(interaction) {
  const userId = interaction.user.id;
  if (openTickets.has(userId)) {
    await interaction.reply({
      content: "You already have an active ticket.",
      ephemeral: true,
    });
    return;
  }

  openTickets.set(userId, true);

  try {
    const categoryID = process.env.TICKET_CATEGORY_ID;
    const supportRoleID = process.env.SUPPORT_ROLE_ID;
    const guild = interaction.guild;

    const channel = await guild.channels.create({
      name: `ticket-${userId}`,
      type: 0,
      parent: categoryID,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: userId,
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

    channel.setTopic(`Opened by: ${userId}, Support: ${supportRoleID}`);

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("New Ticket")
      .setDescription(
        "Please describe your issue or question here. A support team member will be with you shortly."
      );

    const claimButton = new ButtonBuilder()
      .setCustomId("claim_ticket")
      .setLabel("Claim")
      .setStyle(ButtonStyle.Success);

    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Close")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(claimButton, closeButton);

    channel.send({
      content: `<@&${supportRoleID}>`,
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: `Your ticket has been opened. ${channel}`,
      ephemeral: true,
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error trying to open your ticket.",
      ephemeral: true,
    });
  }
}

async function handleClaimTicket(interaction) {
  const { member } = interaction;
  const supportRoleID = process.env.SUPPORT_ROLE_ID;
  if (!member.roles.cache.has(supportRoleID)) {
    await interaction.reply({
      content: "You do not have permission to claim this ticket.",
      ephemeral: true,
    });
    return;
  }

  const components = interaction.message.components.map((component) => {
    const newComponent = component.toJSON();
    newComponent.components = newComponent.components.map((button) => {
      if (button.custom_id === "claim_ticket") {
        button.disabled = true;
      }
      return button;
    });
    return newComponent;
  });

  await interaction.update({ components });

  await interaction.message.edit({ content: `<@${member.id}> has claimed this ticket.` });
  await interaction.followUp({
    content: "You have claimed this ticket.",
    ephemeral: true,
  });
}

async function handleCloseTicket(interaction, client) {
  const { member, message } = interaction;
  const userId = message.channel.name.split("-")[1];
  const supportRoleID = process.env.SUPPORT_ROLE_ID;

  if (
    !member.roles.cache.has(supportRoleID) &&
    interaction.user.id !== userId
  ) {
    await interaction.reply({
      content: "You do not have permission to close this ticket.",
      ephemeral: true,
    });
    return;
  }

  const messages = await message.channel.messages.fetch({ limit: 100 });
  const transcript = messages
    .map((m) => `${m.createdAt.toISOString()} - ${m.author.tag}: ${m.content}`)
    .reverse()
    .join("\n\n");

  const MAX_MESSAGE_LENGTH = 2000 - 9;
  const transcriptParts = [];
  let startIndex = 0;

  while (startIndex < transcript.length) {
    let endIndex = startIndex + MAX_MESSAGE_LENGTH;
    if (endIndex < transcript.length) {
      endIndex = transcript.lastIndexOf("\n\n", endIndex) + 2;
    }
    transcriptParts.push(transcript.substring(startIndex, endIndex));
    startIndex = endIndex;
  }

  const user = await client.users.fetch(userId);

  await message.channel.delete();
  openTickets.delete(userId);

  for (const part of transcriptParts) {
    const messageToSend = "```yaml\n" + part + "\n```";
    await user.send(
      `The ticket for ${user.tag} has been closed. Here's the transcript:\n${messageToSend}`
    );
  }
}