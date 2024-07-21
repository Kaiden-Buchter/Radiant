import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "purge",
    description: "Purge a specified number of messages.",
    permissions: ["Administrator", "ManageMessages"],
    permissionsRequired: "some",
    options: [
      {
        name: "count",
        type: 4,
        description: "Number of messages to purge",
        required: true,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    const count = interaction.options.getInteger("count");

    if (count < 1 || count > 100) {
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription("You need to input a number between 1 and 100.");
      await interaction.reply({ embeds: [embed] });
    }

    await interaction.channel.bulkDelete(count, true).catch(async (error) => {
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Error")
        .setDescription(
          "An error occurred while trying to delete messages.",
          error
        );
      await interaction.reply({ embeds: [embed] });
    });

    const successEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Success")
      .setDescription(`Successfully deleted ${count} messages.`);

    await interaction
      .reply({ embeds: [successEmbed], fetchReply: true })
      .then((sentMessage) => {
        setTimeout(() => sentMessage.delete(), 5000);
      })
      .catch((error) =>
        console.error("Error deleting the success message:", error)
      );
  },
};
