import { EmbedBuilder } from "discord.js";

export default {
  data: {
    name: "globalkick",
    description: "Kick a user globally from all servers the bot is in",
    permissions: ["Administrator", "KickMembers"],
    permissionsRequired: "all",
    options: [
      {
        name: "userid",
        type: 3,
        description: "The ID of the user to kick",
        required: true,
      },
      {
        name: "reason",
        type: 3,
        description: "The reason for the kick",
        required: false,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    await interaction.deferReply();

    const userId = interaction.options.getString("userid");
    const reason =
      interaction.options.getString("reason") || "No reason provided";

    const client = interaction.client;

    let kickCount = 0;
    let failedCount = 0;

    for (const guild of client.guilds.cache.values()) {
      try {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (member) {
          await member.kick(reason);
          kickCount++;
        }
      } catch (error) {
        console.error(
          `Failed to kick user ${userId} from guild ${guild.id}: ${error}`
        );
        failedCount++;
      }
    }

    const embed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("Global Kick Report")
      .setDescription(
        `Attempted to kick User ${userId} globally.\n\nSuccesses: ${kickCount}\nFailures: ${failedCount}\nReason: ${reason}`
      );
    await interaction.reply({ embeds: [embed] });
  },
};
