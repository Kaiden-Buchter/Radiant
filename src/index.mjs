// Importing modules
import { connect, close } from "./db.mjs";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { join } from "path";
import Table from "cli-table3";
import chalk from "chalk";

// Importing handlers and setup functions
import messageCreateHandler from "./Handlers/messageCreateHandler.mjs";
import commandHandler from "./Handlers/commandHandler.mjs";
import readyHandler from "./Handlers/readyHandler.mjs"; 
import { sendDataToWebsite } from './Handlers/apiHandler.mjs';
import commandSetup from "./commandSetup.mjs";

// Load environment variables
dotenv.config();

// Client setup with intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
  ],
});
client.commands = new Collection();

// Define directories
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const commandsDir = join(__dirname, "../", "commands");

// Setup commands
const commandsByFolder = await commandSetup(commandsDir, client);

// Setup and populate table for command overview
const table = new Table({
  head: ["Folder", "Command", "Enabled"],
  chars: {
    top: "═",
    "top-mid": "╦",
    "top-left": "╔",
    "top-right": "╗",
    bottom: "═",
    "bottom-mid": "╩",
    "bottom-left": "╚",
    "bottom-right": "╝",
    left: "║",
    "left-mid": "╠",
    mid: "═",
    "mid-mid": "╬",
    right: "║",
    "right-mid": "╣",
    middle: "║",
  },
  style: {
    head: ["green"],
    border: ["bold", "white"],
    compact: false,
  },
  colWidths: [20, 30, 10],
});

// Populate table with command data
for (const [folder, commands] of Object.entries(commandsByFolder)) {
  for (const command of commands) {
    const statusEmoji = command.loaded ? chalk.green("✅") : chalk.red("❌");
    const row = [
      chalk.whiteBright(folder),
      chalk.cyan(command.name),
      statusEmoji,
    ];
    table.push(row);
  }
}

// Logging
console.log(table.toString());
console.log(
  chalk.blueBright(`Total number of commands loaded: ${client.commands.size}`)
);

// Event listeners
client.on("ready", () => readyHandler(client));
client.on("messageCreate", (message) => messageCreateHandler(message, client));
client.on("interactionCreate", (interaction) =>
  commandHandler(client, interaction)
);
client.on("error", console.error);

// Database connection & Bot Login
connect().then(() => {
  client.login(process.env.TOKEN);
});

sendDataToWebsite({ key: 'value' });

// Listen for termination signals
process.on("SIGINT", function () {
  close();
});
process.on("SIGTERM", function () {
  close();
});
