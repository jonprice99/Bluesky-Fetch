import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { isPaused, setIsPaused, setWaitTime } from '../settings';

export const data = new SlashCommandBuilder()
    .setName('unpause')
    .setDescription('Unpause Bluesky Fetch to resume getting new posts');

export async function execute(interaction: ChatInputCommandInteraction) {
    if (isPaused) {
        setIsPaused(false);
        setWaitTime(0);
        await interaction.reply(`Bluesky Fetch has been unpaused. It will now resume fetching posts from Bluesky.`);
    } else {
        await interaction.reply(`Bluesky Fetch is currently unpaused.`);
    }
}