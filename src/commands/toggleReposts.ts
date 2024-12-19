import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { toggleReposts, fetchReposts } from '../settings'

export const data = new SlashCommandBuilder()
    .setName('togglereposts')
    .setDescription('Toggle whether reposts are fetched from your profile')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply("You do not have permission to use this command.");
    }

    toggleReposts();
    await interaction.reply(`Repost fetching is now ${fetchReposts ? 'enabled' : 'disabled'}.`);
}