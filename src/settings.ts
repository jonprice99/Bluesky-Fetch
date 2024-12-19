export let notificationChannelId: string | null = null;
export let errorChannelId: string | null = null;
export let fetchReposts = false;
export let waitTime = 0;    // Wait time counter for fetch pause
export let isPaused = false;
export let usernameEntered = false; // Flag for checking if user has entered a username
export let passwordEntered = false; // Flag for checking if user has entered a password

export function setNotificationChannelId(notificationChannel: string) {
    notificationChannelId = notificationChannel;
}

export function setErrorChannelId(errorChannel: string) {
    errorChannelId = errorChannel;
}

export function toggleReposts() {
    fetchReposts = !fetchReposts;
}

export function setWaitTime(wait: number) {
    waitTime = wait;
}

export function setIsPaused(paused: boolean) {
    isPaused = paused;
}

export function setUsernameEntered(entered: boolean) {
    usernameEntered = entered;
}

export function setPasswordEntered(entered: boolean) {
    passwordEntered = entered;
}