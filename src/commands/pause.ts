import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { waitTime, setIsPaused, setWaitTime } from '../settings';

let pauseConfirmation: Message | null = null; // In-memory variable to store the confirmation message

export async function deletePauseConfirmation() {
    if (pauseConfirmation) {
        await pauseConfirmation.delete();
        pauseConfirmation = null;
    }
}

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
    pauseConfirmation = await interaction.reply({ content: `Pause set to ${seconds} seconds. Bluesky Fetch will wait for this duration before fetching posts again. 
    (If you wish to end the pause early, use the **/unpause** command.)`, fetchReply: true });

    setTimeout(async () => {
        setIsPaused(false); // Unlock the bot logic after the wait time
        setWaitTime(0);
        console.log('Pause is over. The bot can continue fetching.');
        deletePauseConfirmation();
    }, waitTime * 1000);
}