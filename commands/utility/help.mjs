import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "help",
    description: "List all of my commands or info about a specific command.",
    permissions: [],
    permissionsRequired: "none",
    options: [
      {
        name: "command",
        type: 3,
        description: "The command you want to know about",
        required: false,
      },
    ],
  },
  load: false,
  async execute(interaction) {
    const { commands } = interaction.client;
    const commandName = interaction.options.getString("command");

    if (!commandName) {
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Help")
        .setDescription(
          commands.map((command) => command.data.name).join(", ")
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }

    const command = commands.get(commandName);

    if (!command) {
      await interaction.reply(
        `I couldn't find a command with the name \`${commandName}\`.`
      );
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`Command: ${command.data.name}`)
      .addField(
        "Description",
        command.data.description || "No description provided"
      );

    await interaction.reply({ embeds: [embed] });
  },
};
