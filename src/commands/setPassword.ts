import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export const data = new SlashCommandBuilder()
  .setName('setpassword')
  .setDescription('Set your Bluesky account app password')
  .addStringOption(option => option.setName('password').setDescription('Your Bluesky app password').setRequired(true))

export async function execute(interaction: ChatInputCommandInteraction) {
    const envKey = "BLUESKY_APP_PASSWORD";
    const value = interaction.options.getString('password');

    if (!value) {
        await interaction.reply('Please provide your app password.');
        return;
    }

    const envPath = path.resolve(__dirname, '../.env');
    const envVars = dotenv.parse(fs.readFileSync(envPath));
    envVars[envKey] = value;

    const newEnvString = Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join('\n');
    fs.writeFileSync(envPath, newEnvString);
    
    dotenv.config(); // Reload environment variables from the updated .env file

    await interaction.reply(`${envKey} set.`);
}