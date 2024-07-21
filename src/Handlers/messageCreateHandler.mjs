export default async function messageCreateHandler(message, client) {
  client.messageTimestamps = client.messageTimestamps || new Map();
  client.spamMessages = client.spamMessages || new Map();
  client.muteTimestamps = client.muteTimestamps || new Map();

  const MESSAGE_COOLDOWN = 3000; // 3 seconds
  const MAX_MESSAGES = 5;
  const MUTE_DURATION = 60000; // 1 minute

  if (message.author.bot) return;

  const now = Date.now();

  const timestamps = client.messageTimestamps.get(message.author.id) || [];
  const messages = client.spamMessages.get(message.author.id) || [];

  timestamps.push(now);
  messages.push(message);

  const recentTimestamps = timestamps.filter(
    (timestamp) => now - timestamp < MESSAGE_COOLDOWN
  );
  const recentMessages = messages.filter(
    (msg) => now - msg.createdTimestamp < MESSAGE_COOLDOWN
  );

  client.messageTimestamps.set(message.author.id, recentTimestamps);
  client.spamMessages.set(message.author.id, recentMessages);

  if (recentTimestamps.length > MAX_MESSAGES) {
    let muteRole = message.guild.roles.cache.find(
      (role) => role.name === "Muted"
    );
    if (!muteRole) {
      muteRole = await message.guild.roles.create({
        name: "Muted",
        permissions: [],
        color: "#000001",
      });
    }

    await message.member.roles.add(muteRole);
    client.muteTimestamps.set(message.author.id, now + MUTE_DURATION);

    setTimeout(async () => {
      if (now + MUTE_DURATION <= client.muteTimestamps.get(message.author.id)) {
        await message.member.roles.remove(muteRole);
      }
    }, MUTE_DURATION);
    recentMessages.forEach((msg) => {
      if (msg.deletable) {
        msg.delete().catch((error) => {
          if (error.code !== 10008) {
            console.error(error);
          }
        });
      }
    });
  }
}
