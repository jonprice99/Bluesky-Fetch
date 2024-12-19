import { ChatInputCommandInteraction, SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { setNotificationChannelId, errorChannelId, usernameEntered, passwordEntered, fetchReposts } from '../settings';

export const data = new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Set the channel for the bot to put your posts in')
    .addChannelOption(option => option.setName('channel').setDescription('The channel to send notifications to').setRequired(true))
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

    // Get the channel and try to set it
    const channel = interaction.options.get('channel');
    if (channel?.channel && channel.channel.type === ChannelType.GuildText) {
        setNotificationChannelId(channel.channel.id);
        await interaction.reply(`Notification channel set to <#${channel.channel.id}>`);
    } else {
        await interaction.reply('Please select a valid text channel.');
    }
}