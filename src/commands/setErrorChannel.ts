import { ChatInputCommandInteraction, SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { setErrorChannelId } from '../settings';

export const data = new SlashCommandBuilder()
    .setName('seterrorchannel')
    .setDescription('Set the channel for the bot to send errors to')
    .addChannelOption(option => option.setName('channel').setDescription('The channel to send errors to').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply("You do not have permission to use this command.");
    }

    const channel = interaction.options.get('channel');

    if (channel?.channel && channel.channel.type === ChannelType.GuildText) {
        setErrorChannelId(channel.channel.id);
        await interaction.reply(`Error channel set to <#${channel.channel.id}>`);
    } else {
        await interaction.reply('Please select a valid text channel.');
    }
}