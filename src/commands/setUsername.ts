import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { setUsernameEntered } from '../settings';

export const data = new SlashCommandBuilder()
  .setName('setusername')
  .setDescription('Set your Bluesky account username/handle')
  .addStringOption(option => option.setName('username').setDescription('Your Bluesky username/handle').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply("You do not have permission to use this command.");
  }

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
  setUsernameEntered(true);

  dotenv.config(); // Reload environment variables from the updated .env file

  await interaction.reply(`${envKey} set to ${value}.`);
}