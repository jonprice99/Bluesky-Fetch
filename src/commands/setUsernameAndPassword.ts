import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { setUsernameEntered, setPasswordEntered, errorChannelId } from '../settings';

export const data = new SlashCommandBuilder()
    .setName('setusernameandpassword')
    .setDescription('Set your Bluesky account username/handle and app password')
    .addStringOption(option => option.setName('username').setDescription('Your Bluesky username/handle').setRequired(true))
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

    const envUsernameKey = "BLUESKY_USERNAME";
    const usernameValue = interaction.options.getString('username');
    const envPasswordKey = "BLUESKY_APP_PASSWORD";
    const passwordValue = interaction.options.getString('password');

    if (!usernameValue) {
        await interaction.reply('Please provide your username/handle.');
        return;
    }
    if (!passwordValue) {
        await interaction.reply('Please provide your app password.');
        return;
    }

    const envPath = path.resolve(__dirname, '../.env');
    const envVars = dotenv.parse(fs.readFileSync(envPath));
    envVars[envUsernameKey] = usernameValue;

    const newEnvUsernameString = Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join('\n');
    fs.writeFileSync(envPath, newEnvUsernameString);
    setUsernameEntered(true);

    envVars[envPasswordKey] = passwordValue;

    const newEnvPasswordString = Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join('\n');
    fs.writeFileSync(envPath, newEnvPasswordString);
    setPasswordEntered(true);

    dotenv.config(); // Reload environment variables from the updated .env file

    await interaction.reply(`${envUsernameKey} set to ${usernameValue}; ${envPasswordKey} successfully set.`);
}