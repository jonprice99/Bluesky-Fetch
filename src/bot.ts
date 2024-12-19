import { AtpAgent } from '@atproto/api'
import { commands } from './commands';
import { deployCommands } from './deploy-commands';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import * as dotenv from 'dotenv';
import { fetchReposts, notificationChannelId, isPaused, errorChannelId, usernameEntered, setUsernameEntered, setPasswordEntered } from './settings'

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

if (!token) {
  throw new Error('The DISCORD_TOKEN environment variable is required.');
}
if (!applicationId) {
  throw new Error('The DISCORD_APPLICATION_ID environment variable is required.');
}
if (!guildId) {
  throw new Error('The DISCORD_GUILD_ID environment variable is required.');
}

async function setupBlueskyAgent(): Promise<AtpAgent> {
  const username = process.env.BLUESKY_USERNAME;
  const appPassword = process.env.BLUESKY_APP_PASSWORD;

  if (!username || !appPassword) {
    throw new Error('Bluesky username or password not set in .env file');
  }

  if (username && appPassword) {
    setUsernameEntered(true);
    setPasswordEntered(true);
  }

  const agent = new AtpAgent({
    service: 'https://bsky.social'
  });
  await agent.login({
    identifier: username,
    password: appPassword
  });

  if (!agent) {
    throw new Error('Bluesky username or password is invalid.');
  }

  return agent;
}

let cachedBlueskyDID: string | null = null; // Cache the Bluesky DID to avoid multiple fetches

async function getBlueskyDID(agent: AtpAgent): Promise<string> {
  if (cachedBlueskyDID) {
    return cachedBlueskyDID; // Return cached DID if available
  }

  const username = process.env.BLUESKY_USERNAME

  if (!username) { throw new Error('Bluesky username not set in .env file'); }

  const { data } = await agent.getProfile({ actor: username })
  cachedBlueskyDID = data.did; // Cache the did for future use
  return data.did;
}

async function fetchPosts(agent: AtpAgent): Promise<any[]> {
  const blueskyDID = await getBlueskyDID(agent);
  const timeline = await agent.getAuthorFeed({ actor: blueskyDID, filter: "posts_no_replies", limit: 1 });
  //console.log('Timeline data:', timeline);
  return timeline.data.feed;
}

function constructPostUrl(post: any): string {
  const postUriSegments = post.post.uri.split('/');
  const postId = postUriSegments[postUriSegments.length - 1]; // Get the last segment after the last slash

  return `https://bsky.app/profile/${post.post.author.handle}/post/${postId}`;
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user?.tag}!`);

  console.log("deploying commands...")
  await deployCommands();

  try {
    // try to set up Bluesky agent
    const agent = await setupBlueskyAgent();
    console.log('Bluesky agent setup successful.');

    let lastPostId = '';  // Store the ID of the last post fetched

    setInterval(async () => {
      if (isPaused || !notificationChannelId || !errorChannelId) return;

      const errorChannel = client.channels.cache.get(errorChannelId) as TextChannel;

      const channel = client.channels.cache.get(notificationChannelId) as TextChannel;
      if (!channel) {
        console.error("Notification channel not found");
        errorChannel.send("There was an error when trying to find your notification channel. Please use **/setchannel** to make sure the Bluesky notification channel set.");
        return;
      }

      try {
        // try to fetch posts
        const posts = await fetchPosts(agent);

        if (posts.length === 0 || lastPostId === posts[0].post.uri) return;
        lastPostId = posts[0].post.uri;  // Update last post ID

        for (let i = posts.length - 1; i >= 0; i--) {
          const post = posts[i];
          const postURL = constructPostUrl(post);

          // Check for repost or original post
          if (fetchReposts && post.post.author.handle !== process.env.BLUESKY_USERNAME) {
            // Send the repost
            await channel.send(`**Reposted** from ${post.post.author.handle} - ${postURL}`);
          } else if (!fetchReposts && post.post.author.handle === process.env.BLUESKY_USERNAME) {
            // Send the post
            await channel.send(postURL);
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        errorChannel.send(`There was an error fetching posts from Bluesky. Please contact Bluesky Fetch developer and provide the following console error: ${error}`);
      }
    }, 30000);  // Check for new posts every 30 seconds
  } catch (error) {
    // Error setting up Bluesky agent
    console.error('Error setting up Bluesky agent:', error);

    if (!errorChannelId) {
      console.error('errorChannelId is null and must be set');
      return;
    }

    const errorChannel = client.channels.cache.get(errorChannelId) as TextChannel;
    if (!errorChannel) {
      console.error('Error channel not found');
      return;
    } else {
      errorChannel.send("There was an error setting up the Bluesky agent. Please check your username and/or app password for Bluesky and try again.")
    }
  }
});

// Handle slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(interaction);
    }
  }
});

client.login(token);