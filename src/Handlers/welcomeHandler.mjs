import { createCanvas, loadImage, Image } from "canvas";
import fetch from "node-fetch";
import webp from "webp-converter";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function welcomeHandler(member) {
  try {
    const background = await loadImage(
      "assets/images/Radiant_Welcome_Background.png"
    );
    const canvas = createCanvas(background.width, background.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatarURL = member.user.displayAvatarURL({ format: "png" });
    let avatarBuffer;
    let avatar;

    try {
      const response = await fetch(avatarURL);
      const avatarArrayBuffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.startsWith("image/")) {
        throw new Error("Unsupported image type");
      }

      avatarBuffer = Buffer.from(avatarArrayBuffer);

      if (contentType === "image/webp") {
        const tempWebpPath = path.join(__dirname, "temp.webp");
        const tempPngPath = path.join(__dirname, "temp.png");

        fs.writeFileSync(tempWebpPath, avatarBuffer);
        await webp.dwebp(tempWebpPath, tempPngPath, "-o");

        avatarBuffer = fs.readFileSync(tempPngPath);
        fs.unlinkSync(tempWebpPath);
        fs.unlinkSync(tempPngPath);
      }

      avatar = new Image();
      avatar.src = avatarBuffer;

      await new Promise((resolve, reject) => {
        avatar.onload = resolve;
        avatar.onerror = reject;
      });

      const avatarSize = 128;
      const avatarX = canvas.width / 2 - avatarSize / 2;
      const avatarY = canvas.height / 2 - avatarSize / 2;

      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2,
        true
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), {
        name: "welcome-image.png",
      });

      const embed = new EmbedBuilder()
        .setTitle(`Welcome to the server, ${member.user.username}!`)
        .setDescription("We're glad to have you here!")
        .setImage("attachment://welcome-image.png")
        .setColor("#00FF00");

      const welcomeChannel = member.guild.channels.cache.get(
        process.env.WELCOME_CHANNEL_ID
      );

      if (welcomeChannel) {
        await welcomeChannel.send({
          embeds: [embed],
          files: [attachment],
        });
      } else {
        console.error("Welcome channel not found");
      }
    } catch (error) {
      console.error("Error loading avatar image:", error);
    }
  } catch (error) {
    console.error("Error creating welcome image:", error);
  }
}
