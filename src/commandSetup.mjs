import { readdir } from "fs/promises";
import { join } from "path";
import { pathToFileURL } from "url";

async function loadCommands(dir, client) {
  const folders = await readdir(dir, { withFileTypes: true });
  const commandsByFolder = {};

  for (const folder of folders) {
    if (folder.isDirectory()) {
      const folderPath = join(dir, folder.name);
      const files = await readdir(folderPath, { withFileTypes: true });

      for (const file of files) {
        if (file.isFile() && file.name.endsWith(".mjs")) {
          const filePath = join(folderPath, file.name);
          const fileURL = pathToFileURL(filePath).href;
          const { default: command } = await import(
            `${fileURL}?update=${Date.now()}`
          );

          if (!commandsByFolder[folder.name]) {
            commandsByFolder[folder.name] = [];
          }
          commandsByFolder[folder.name].push({
            name: command.data.name,
            loaded: command.load !== false,
          });
          if (command.load !== false) {
            client.commands.set(command.data.name, command);
          }
        }
      }
    }
  }

  return commandsByFolder;
}

export default loadCommands;
