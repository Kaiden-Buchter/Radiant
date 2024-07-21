import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export default {
  data: {
    name: "sendpanel",
    description: "Send a panel to a channel",
    permissions: ["Administrator"],
    permissionsRequired: "all",
    options: [
      {
        name: "channel",
        type: 7,
        description: "The channel to send the panel to",
        required: true,
      },
      {
        name: "title",
        type: 3,
        description: "The title of the embed",
        required: true,
      },
      {
        name: "description",
        type: 3,
        description: "The description of the embed",
        required: true,
      },
      {
        name: "color",
        type: 3,
        description: "The color of the embed",
        required: false,
        choices: [
          {
            name: "Blue",
            value: "#0099ff",
          },
          {
            name: "Green",
            value: "#00ff00",
          },
          {
            name: "Red",
            value: "#ff0000",
          },
          {
            name: "Yellow",
            value: "#ffff00",
          },
          {
            name: "Purple",
            value: "#800080",
          },
          {
            name: "Orange",
            value: "#ffa500",
          },
          {
            name: "Pink",
            value: "#ff69b4",
          },
          {
            name: "White",
            value: "#ffffff",
          },
          {
            name: "Black",
            value: "#000000",
          },
          {
            name: "Gray",
            value: "#808080",
          },
          {
            name: "Brown",
            value: "#a52a2a",
          },
          {
            name: "Cyan",
            value: "#00ffff",
          },
          {
            name: "Magenta",
            value: "#ff00ff",
          },
          {
            name: "Teal",
            value: "#008080",
          },
          {
            name: "Navy",
            value: "#000080",
          },
          {
            name: "Maroon",
            value: "#800000",
          },
          {
            name: "Olive",
            value: "#808000",
          },
          {
            name: "Lime",
            value: "#00ff00",
          },
          {
            name: "Aqua",
            value: "#00ffff",
          },
          {
            name: "Fuchsia",
            value: "#ff00ff",
          },
          {
            name: "Silver",
            value: "#c0c0c0",
          },
          {
            name: "Lavender",
            value: "#e6e6fa",
          },
          {
            name: "Tan",
            value: "#d2b48c",
          },
          {
            name: "Salmon",
            value: "#fa8072",
          },
          {
            name: "Coral",
            value: "#ff7f50",
          },
        ],
      },
    ],
  },
  load: true,
  async execute(interaction) {
    await interaction.deferReply();

    const channel = interaction.options.getChannel("channel");
    const color = interaction.options.getString("color") || "#0099ff";
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(description);

    const openTicketButton = new ButtonBuilder()
      .setCustomId("open_ticket")
      .setLabel("Open Ticket")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(openTicketButton);

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.editReply({
      content: `The panel has been sent to ${channel}.`,
      ephemeral: true,
    });
  },
};
