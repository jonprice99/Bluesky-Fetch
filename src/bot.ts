import { AtpAgent } from '@atproto/api'
import { ChannelType, Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, TextChannel } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function setupBlueskyAgent(): Promise<AtpAgent> {
  const username = process.env.BLUESKY_USERNAME;
  const appPassword = process.env.BLUESKY_APP_PASSWORD; 
  
  if (!username || !appPassword) { throw new Error('Bluesky username or password not set in .env file'); }
  
  const agent = new AtpAgent({
    service: 'https://bsky.social'
  });
  await agent.login({
    identifier: username,
    password: appPassword
  });
  
  return agent;
}

async function getBlueskyDID(agent: AtpAgent): Promise<string> {
  const username = process.env.BLUESKY_USERNAME

  if (!username) { throw new Error('Bluesky username not set in .env file'); }

  const { data } = await agent.getProfile({actor: username})
  return data.did;
}

async function fetchPosts(agent: AtpAgent): Promise<any[]> {
  const blueskyDID = await getBlueskyDID(agent);
  const timeline = await agent.getAuthorFeed({actor: blueskyDID, filter: "posts_no_replies", limit: 1});
  //console.log('Timeline data:', timeline);
  return timeline.data.feed;
}

function constructPostUrl(post: any): string {
  const postId = post.post.uri.split('/').pop(); // This gets the last segment after the last slash

  return `https://bsky.app/profile/${post.post.author.handle}/post/${postId}`;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Temporary in-memory storage for notification channel ID and settings
let notificationChannelId: string | null = null;
const settings = {
  fetchReposts: false,
}

// Create the slash commands for the app
/*const commands = [
  // set_channel command
  new SlashCommandBuilder()
    .setName('set_channel')
    .setDescription('Set the channel for the Bluesky posts to go')
    .addChannelOption(option => option.setName('channel').setDescription("The channel to send posts to").setRequired(true))
].map(command => command.toJSON());*/

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`);

  const agent = await setupBlueskyAgent();
  let lastPostId = '';  // Store the ID of the last post fetched

  setInterval(async () => {
    if (notificationChannelId) {
      const channel = client.channels.cache.get(notificationChannelId) as TextChannel;

      if (!channel) {
        console.error("Notification channel not found");
        return;
      }

      try {
        const posts = await fetchPosts(agent);
        //console.log('Fetched posts:', posts);

        if (posts.length > 0 && lastPostId !== posts[0].post.uri) {
          //const newPosts = posts.filter(post => post.post.uri !== lastPostId);
          lastPostId = posts[0].post.uri;  // Update last post ID

          //console.log("lastPostID", lastPostId);
          //console.log("posts[0].post.uri", posts[0].post.uri)

          for (const post of posts.reverse()) {
            //console.log("post:", post)
            const postURL = constructPostUrl(post);

            // Check for repost or original post
            if (post.post.author.handle !== process.env.BLUESKY_USERNAME && settings.fetchReposts == true) {
              // Send the repost
              await channel.send(`**Reposted** from ${post.post.author.handle} - ${postURL}`)
            } else {
              // Send the post
              await channel.send(`${postURL}`)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
  }, 30000);  // Check for new posts every 30 seconds
});

// Handle ! commands
client.on('messageCreate', message => {
  // Hello world command
  if (message.content === '!hello') {
    message.channel.send('Hello, world!');
  }

  // Toggle reposts command
  if (message.content === '!toggleReposts') {
    settings.fetchReposts = !settings.fetchReposts; 
    message.channel.send(`Fetch reposts is now ${settings.fetchReposts ? 'enabled' : 'disabled'}.`);
  }

  // Set channel command
  if (message.content.startsWith('!setChannel')) {
    //const args = message.content.slice(12).trim();
    const channel = message.mentions.channels.first();

    if (channel && channel.type === ChannelType.GuildText) {
      notificationChannelId = channel.id;
      message.channel.send(`Bluesky notification channel set to <#${channel.id}>`);
    } else {
      message.channel.send('Please mention a valid text channel.');
    }
  }
});

client.login(process.env.TOKEN);