export let notificationChannelId: string | null = null;
export let fetchReposts = false;
export let waitTime = 0;    // Wait time counter for fetch pause
export let isPaused = false;

export function setNotificationChannelId(notificationChannel: string) {
    notificationChannelId = notificationChannel;
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