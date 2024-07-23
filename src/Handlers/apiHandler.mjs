import fetch from "node-fetch";
import chalk from "chalk";

export default async function sendDataToWebsite(data) {
  try {
    const response = await fetch("http://localhost:3000/bot", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (response.headers.get("content-type")?.includes("application/json")) {
      const responseData = await response.json();
      console.log(
        `${chalk.bold(chalk.greenBright(`[API Manager]`))} ${JSON.stringify(
          responseData,
          null,
          2
        )}`
      );
    } else {
      console.log(
        "Non-JSON response received",
        response.status,
        response.statusText
      );
      const responseData = await response.json();
      console.log(
        `${chalk.bold(chalk.greenBright(`[API Manager]`))} ${JSON.stringify(
          responseData,
          null,
          2
        )}`
      );
    }
  } catch (error) {
    console.log(`${chalk.bold(chalk.greenBright(`[API Manager]`))} Could not connect to API`);
  }
}
