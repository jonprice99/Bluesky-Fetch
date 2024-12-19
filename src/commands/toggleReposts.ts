import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { toggleReposts, fetchReposts, errorChannelId, usernameEntered, passwordEntered } from '../settings'

export const data = new SlashCommandBuilder()
    .setName('togglereposts')
    .setDescription('Toggle whether reposts are fetched from your profile')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply("You do not have permission to use this command.");
    }

    // Enforce bot setup flow
    if (!errorChannelId) {
        return interaction.reply("You have not yet set a channel to send bot errors to. Please use **/seterrorchannel**, then try again.");
    }
    if (!usernameEntered) {
        return interaction.reply("You have not yet set your Bluesky username. Please use **/setusername** or **/setusernameandpassword**, then try again.")
    }
    if (!passwordEntered) {
        return interaction.reply("You have not yet set your Bluesky app password. Please use **/setpassword** or **/setusernameandpassword**, then try again.")
    }

    toggleReposts();
    await interaction.reply(`Repost fetching is now ${fetchReposts ? 'enabled' : 'disabled'}.`);
}