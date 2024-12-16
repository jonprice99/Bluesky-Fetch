import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { toggleReposts, fetchReposts } from '../settings'

export const data = new SlashCommandBuilder()
    .setName('togglereposts')
    .setDescription('Toggle whether reposts are fetched from your profile');
    
export async function execute(interaction: CommandInteraction) {
    toggleReposts();
    await interaction.reply(`Setting is now ${fetchReposts ? 'enabled' : 'disabled'}.`);
}