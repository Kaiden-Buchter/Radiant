import mongoose from "mongoose";
import noblox from "noblox.js";
import RbxUser from "../../schemas/Rbx.mjs";
import KnownRbxUser from "../../schemas/KnownRbxUser.mjs";
import { EmbedBuilder } from "discord.js";

const dbConnectionString =
  "mongodb+srv://Admin:radiantAdmin8243@radiant.gej3efo.mongodb.net/rbx?retryWrites=true&w=majority&appName=Radiant";

mongoose
  .connect(dbConnectionString)
  .catch((err) => console.error("Database connection error", err));

async function replyWithEmbed(interaction, color, title, description) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description);
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function deleteTemporaryUser(discordId) {
  try {
    await RbxUser.deleteOne({ discordId });
  } catch (error) {
    console.error("Error deleting temporary user", error);
  }
}

export default {
  data: {
    name: "linkrbx",
    description: "Link your Roblox account to your Discord account.",
    permissions: [],
    permissionsRequired: "none",
    options: [
      {
        name: "username",
        type: 3,
        description: "Your Roblox username",
        required: true,
      },
      {
        name: "verify",
        type: 5,
        description: "Check if the verification code is in your Roblox profile",
        required: false,
      },
    ],
  },
  load: true,
  async execute(interaction) {
    const robloxUsername = interaction.options.getString("username");
    const verify = interaction.options.getBoolean("verify");
    const discordId = interaction.user.id;

    try {
      const userId = await noblox.getIdFromUsername(robloxUsername);
      const robloxId = userId;

      const existingUser = await KnownRbxUser.findOne({ discordId });
      if (existingUser && existingUser.robloxId) {
        return replyWithEmbed(
          interaction,
          "#FF0000",
          "Error",
          "This Discord account is already linked to a Roblox account."
        );
      }

      const existingRobloxUser = await KnownRbxUser.findOne({ robloxId });
      if (existingRobloxUser) {
        return replyWithEmbed(
          interaction,
          "#FF0000",
          "Error",
          "This Roblox account is already linked to a different Discord account."
        );
      }

      const ongoingVerification = await RbxUser.findOne({ robloxId });
      if (ongoingVerification && ongoingVerification.discordId !== discordId) {
        return replyWithEmbed(
          interaction,
          "#FF0000",
          "Error",
          "This Roblox account is currently in the process of being linked to a different Discord account."
        );
      }

      if (!verify) {
        const tempUser = await RbxUser.findOne({ discordId });
        if (tempUser) {
          return replyWithEmbed(
            interaction,
            "#00FF00",
            "Verification Code",
            `Your verification code is still: ${tempUser.verificationCode}. Please put this code in your Roblox profile's about. You have 5 minutes. Then, run the command again with the verify option.`
          );
        } else {
          const verificationCode = Math.random().toString(36).substring(2, 15);
          await new RbxUser({
            discordId,
            robloxId,
            verificationCode,
            verificationCodeCreatedAt: Date.now(),
          }).save();
          return replyWithEmbed(
            interaction,
            "#00FF00",
            "Verification Code",
            `Please put the following code in your Roblox profile's about: ${verificationCode}. You have 5 minutes. Then, run the command again with the verify option.`
          );
        }
      } else {
        const userToVerify = await RbxUser.findOne({ discordId });
        if (!userToVerify || !userToVerify.verificationCode) {
          return replyWithEmbed(
            interaction,
            "#FF0000",
            "Error",
            "Please run the command without the verify option first."
          );
        }

        const blurb = await noblox.getBlurb(robloxId);
        if (blurb.includes(userToVerify.verificationCode)) {
          userToVerify.robloxId = robloxId;
          await userToVerify.save();
          await new KnownRbxUser({
            discordId,
            robloxId,
            robloxUser: robloxUsername,
          }).save();
          await deleteTemporaryUser(discordId);
          return replyWithEmbed(
            interaction,
            "#00FF00",
            "Success",
            `Successfully linked your Roblox account ${robloxUsername} to your Discord account.`
          );
        } else {
          await deleteTemporaryUser(discordId);
          return replyWithEmbed(
            interaction,
            "#FF0000",
            "Error",
            "Verification failed."
          );
        }
      }
    } catch (error) {
      await deleteTemporaryUser(discordId);
      return replyWithEmbed(
        interaction,
        "#FF0000",
        "Error",
        "Failed to link your Roblox account. Please make sure the username is correct."
      );
    }
  },
};
