import notifSound from "../assets/notification.mp3";

export function unlockAudio() {}

export function playNotificationSound() {
  try {
    const audio = new Audio(notifSound);
    audio.volume = 0.5;
    audio.play();
  } catch (e) {
    console.warn("Audio notification failed:", e);
  }
}
