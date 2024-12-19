import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isPaused, setIsPaused, setWaitTime } from '../settings';
import { deletePauseConfirmation } from './pause';

export const data = new SlashCommandBuilder()
    .setName('unpause')
    .setDescription('Unpause Bluesky Fetch to resume getting new posts')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply("You do not have permission to use this command.");
    }

    if (isPaused) {
        setIsPaused(false);
        setWaitTime(0);
        await interaction.reply(`Bluesky Fetch has been unpaused. It will now resume fetching posts from Bluesky.`);
        deletePauseConfirmation();
    } else {
        await interaction.reply(`Bluesky Fetch is currently unpaused.`);
    }
}