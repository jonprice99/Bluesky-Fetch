import { AtpAgent } from '@atproto/api'
import { HELLO_COMMAND, TOGGLE_REPOSTS_COMMAND, SET_BSKY_USERNAME_COMMAND, SET_BSKY_PASSWORD_COMMAND, SET_CHANNEL_COMMAND } from './commands';
import { ChannelType, Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, TextChannel } from 'discord.js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token) {
  throw new Error('The DISCORD_TOKEN environment variable is required.');
}
if (!applicationId) {
  throw new Error('The DISCORD_APPLICATION_ID environment variable is required.');
}

async function setupBlueskyAgent(): Promise<AtpAgent> {
  const username = process.env.BLUESKY_USERNAME;
  const appPassword = process.env.BLUESKY_APP_PASSWORD;

  if (!username || !appPassword) {
    throw new Error('Bluesky username or password not set in .env file');
  }

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

  const { data } = await agent.getProfile({ actor: username })
  return data.did;
}

async function fetchPosts(agent: AtpAgent): Promise<any[]> {
  const blueskyDID = await getBlueskyDID(agent);
  const timeline = await agent.getAuthorFeed({ actor: blueskyDID, filter: "posts_no_replies", limit: 1 });
  //console.log('Timeline data:', timeline);
  return timeline.data.feed;
}

function constructPostUrl(post: any): string {
  const postId = post.post.uri.split('/').pop(); // This gets the last segment after the last slash

  return `https://bsky.app/profile/${post.post.author.handle}/post/${postId}`;
}

function updateEnv(key: string, value: string): void {
  const envPath = path.resolve(__dirname, '.env');
  const envVars = dotenv.parse(fs.readFileSync(envPath));

  envVars[key] = value;

  const newEnvString = Object.entries(envVars).map(([k, v]) => `${k}=${v}`).join('\n');
  fs.writeFileSync(envPath, newEnvString); dotenv.config(); // Reload environment variables from the updated .env file
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

  // Set Bluesky username command
  if (message.content.startsWith('!setBlueskyUsername')) {
    const args = message.content.split(' ');
    const username = args[1];

    if (!username) {
      message.channel.send('Please provide a valid Bluesky username.');
    } else {
      updateEnv('BLUESKY_USERNAME', username);
      message.channel.send(`Bluesky username set to ${username}.`);
    }
  }

  // Set Bluesky password command
  if (message.content.startsWith('!setBlueskyPassword')) {
    const args = message.content.split(' ');
    const password = args[1];

    if (!password) {
      message.channel.send('Please provide your Bluesky app password.');
    } else {
      updateEnv('BLUESKY_APP_PASSWORD', password);
      message.channel.send(`Bluesky app password set.`);
    }
  }
});

client.login(token);