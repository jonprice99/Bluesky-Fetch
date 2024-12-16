import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export const data = new SlashCommandBuilder()
  .setName('setusername')
  .setDescription('Set your Bluesky account username/handle')
  .addStringOption(option => option.setName('username').setDescription('Your Bluesky username/handle').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
    const envKey = "BLUESKY_USERNAME";
    const value = interaction.options.getString('username');

    if (!value) {
        await interaction.reply('Please provide your username/handle.');
        return;
    }

    const envPath = path.resolve(__dirname, '../.env');
    const envVars = dotenv.parse(fs.readFileSync(envPath));
    envVars[envKey] = value;

    const newEnvString = Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join('\n');
    fs.writeFileSync(envPath, newEnvString);
    
    dotenv.config(); // Reload environment variables from the updated .env file

    await interaction.reply(`${envKey} set to ${value}.`);
}