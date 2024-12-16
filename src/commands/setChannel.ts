import { CommandInteraction, SlashCommandBuilder, ChannelType } from 'discord.js';
import { setNotificationChannelId } from '../settings';

export const data = new SlashCommandBuilder()
  .setName('setchannel')
  .setDescription('Set the channel for the bot to put your posts in')
  .addChannelOption(option => option.setName('channel').setDescription('The channel to send notifications to').setRequired(true));

export async function execute(interaction: CommandInteraction) {
    const channel = interaction.options.get('channel');
    
    if (channel?.channel && channel.channel.type === ChannelType.GuildText) {
        setNotificationChannelId(channel.channel.id);
        await interaction.reply(`Notification channel set to <#${channel.channel.id}>`);
    } else {
        await interaction.reply('Please select a valid text channel.');
    }
}