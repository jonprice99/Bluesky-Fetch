import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("hello")
  .setDescription("Have Bluesky Fetch greet the world");

export async function execute(interaction: ChatInputCommandInteraction) {
  return interaction.reply("Hello, world!");
}