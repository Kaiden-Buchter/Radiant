import fetch from 'node-fetch';
import chalk from "chalk";

async function sendDataToWebsite(data) {
  try {
      const response = await fetch('http://localhost:3000/bot', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' },
      });

      if (response.headers.get("content-type")?.includes("application/json")) {
          const responseData = await response.json();
          console.log(`${chalk.bold(chalk.greenBright(`[API Manager]`))} ${JSON.stringify(responseData, null, 2)}`);
      } else {
          // If the response is not JSON, log the status and statusText
          console.log("Non-JSON response received", response.status, response.statusText);
          console.log(await response.text());
      }
  } catch (error) {
      console.error("Error sending data to website:", error);
  }
}

export { sendDataToWebsite }; 