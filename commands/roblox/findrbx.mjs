import KnownRbxUser from "../../schemas/KnownRbxUser.mjs";
import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "findrbx",
    description: "Find the Roblox account linked to a Discord account.",
    permissions: [],
    permissionsRequired: "none",
    options: [
      {
        name: "user",
        type: 6,
        description: "The Discord user you want to look up",
        required: false,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    let discordId = interaction.user.id;

    if (interaction.options.getUser("user")) {
      discordId = interaction.options.getUser("user").id;
    }

    const knownUser = await KnownRbxUser.findOne({ discordId: discordId });

    if (knownUser) {
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Account Link")
        .setDescription(
          `The Discord account is linked to the Roblox account with Username: ${knownUser.robloxUser} (${knownUser.robloxId})`
        );

      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply(
        "The Discord account is not linked to any Roblox account."
      );
    }
  },
};
