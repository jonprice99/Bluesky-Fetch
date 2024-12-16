import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("hello")
  .setDescription("Have Bluesky Fetch greet the world");

export async function execute(interaction: CommandInteraction) {
  return interaction.reply("Hello, world!");
}