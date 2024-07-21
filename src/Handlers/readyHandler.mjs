import chalk from "chalk";
import figlet from "figlet";

export default async function readyHandler(client) {
  if (client.user) {
    figlet.text(
      `H U S K Y`,
      { font: "Standard", width: 700 },
      function (err, data) {
        if (err) throw err;
        console.log(
          `${chalk.bold(chalk.blueBright(`[Bot Manager]`))} Logged in as ${
            client.user.tag
          }`
        );
        console.log(
          chalk.bold(
            chalk.whiteBright(
              `----------------------------------------\n${data}\n----------------------------------------`
            )
          )
        );
      }
    );

    client.user.setPresence({
      activities: [{ name: `${client.guilds.cache.size} Servers`, type: 3 }],
      status: "dnd",
    });

    const commands = client.commands.map(({ data }) => data);
    await client.application.commands.set(commands);
  } else {
    console.log("Bot is not logged in.");
  }
}
