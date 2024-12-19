import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { errorChannelId, setPasswordEntered } from '../settings';

export const data = new SlashCommandBuilder()
  .setName('setpassword')
  .setDescription('Set your Bluesky account app password')
  .addStringOption(option => option.setName('password').setDescription('Your Bluesky app password').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply("You do not have permission to use this command.");
  }

  // Enforce bot setup flow
  if (!errorChannelId) {
    return interaction.reply("You have not yet set a channel to send bot errors to. Please use **/seterrorchannel**, then try again.");
  }

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
  setPasswordEntered(true);

  dotenv.config(); // Reload environment variables from the updated .env file

  await interaction.reply(`${envKey} set.`);
}