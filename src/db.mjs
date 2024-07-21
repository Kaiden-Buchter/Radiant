import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function connect() {
  console.log(
    `${chalk.bold(chalk.yellow(`[MDB Manager]`))} MongoDB connecting...`
  );
  try {
    await client.connect();
    console.log(
      `${chalk.bold(
        chalk.yellow(`[MDB Manager]`)
      )} MongoDB successfully connected.`
    );
    console.log(
      `${chalk.bold(
        chalk.blueBright(`[Bot Manager]`)
      )} Discord Bot logging in...`
    );
  } catch (err) {
    console.log(
      `${chalk.bold(
        chalk.redBright(`[MDB Manager]`)
      )} MongoDB connection failed:`,
      err
    );
  }
}

export async function close() {
  try {
    await client.close();
    console.log(
      `${chalk.bold(
        chalk.yellow(`[MDB Manager]`)
      )} MongoDB successfully disconnected`
    );
  } catch (err) {
    console.error(
      `${chalk.bold(
        chalk.redBright(`[MDB Manager]`)
      )} Failed to close MongoDB connection:`,
      err
    );
  }
}

export { client };
