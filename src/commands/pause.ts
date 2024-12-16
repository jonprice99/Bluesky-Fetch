import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { waitTime, setIsPaused, setWaitTime } from '../settings';

export const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause Bluesky Fetch from getting new posts for a bit')
    .addIntegerOption(option => option.setName('duration').setDescription('Duration (in seconds) of the pause').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
    const seconds = interaction.options.getInteger('duration');
    if (!seconds || seconds <= 0) {
        await interaction.reply('Please provide a duration for the pause.');
        return;
    }

    setWaitTime(seconds);
    setIsPaused(true);
    await interaction.reply(`Pause set to ${seconds} seconds. Bluesky Fetch will wait for this duration before fetching posts again. 
    (If you wish to end the pause early, use the **/unpause** command.)`);

    setTimeout(() => {
        setIsPaused(false); // Unlock the bot logic after the wait time
        setWaitTime(0);
        console.log('Pause is over. The bot can continue fetching.');
    }, waitTime * 1000);
}