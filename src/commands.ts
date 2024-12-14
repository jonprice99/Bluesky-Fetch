export const HELLO_COMMAND = {
    name: 'hello',
    description: 'Have Bluesky Fetch greet the world',
};

export const TOGGLE_REPOSTS_COMMAND = {
    name: 'togglereposts',
    description: 'Toggle whether reposts are fetched from your profile',
};

export const SET_BSKY_USERNAME_COMMAND = {
    name: 'setusername',
    description: 'Set your Bluesky username so the bot can fetch posts',
};

export const SET_BSKY_PASSWORD_COMMAND = {
    name: 'setpassword',
    description: 'Set your Bluesky app password so the bot can fetch posts',
};

export const SET_CHANNEL_COMMAND = {
    name: 'setchannel',
    description: 'Set the channel for the bot to put your posts in',
};

export default { HELLO_COMMAND, TOGGLE_REPOSTS_COMMAND, SET_BSKY_USERNAME_COMMAND, SET_BSKY_PASSWORD_COMMAND, SET_CHANNEL_COMMAND };