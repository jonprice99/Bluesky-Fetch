import { REST, Routes } from "discord.js";
import { commands } from "./commands";
import * as dotenv from 'dotenv';

dotenv.config()

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token) {
    throw new Error('The DISCORD_TOKEN environment variable is required.');
}

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(token);

export async function deployCommands() {
  try {
    console.log("Started refreshing application (/) commands.");

    if (!applicationId) {
        throw new Error('The DISCORD_APPLICATION_ID environment variable is required.');
    }
    if (!guildId) {
        throw new Error('The DISCORD_GUILD_ID environment variable is required.');
    }

    await rest.put(
      Routes.applicationGuildCommands(applicationId, guildId),
      {
        body: commandsData,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}