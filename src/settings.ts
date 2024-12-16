export let notificationChannelId: string | null = null;
export let fetchReposts = false;

export function setNotificationChannelId(notificationChannel: string) {
    notificationChannelId = notificationChannel;
}

export function toggleReposts() {
    fetchReposts = !fetchReposts;
}