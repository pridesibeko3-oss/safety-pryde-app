import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { updateLocation } from "../lib/session";

export const LOCATION_TASK_NAME = "safety-pryde-background-location";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Location task error:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations?.[0];
    const code = global.__safetyPrydeSessionCode;
    if (location && code) {
      try {
        await updateLocation(code, location.coords);
      } catch (e) {
        console.error("Failed to push location update:", e);
      }
    }
  }
});

export async function startBackgroundLocation(code) {
  global.__safetyPrydeSessionCode = code;

  const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
  if (fgStatus !== "granted") throw new Error("Foreground location permission denied");

  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== "granted") throw new Error("Background location permission denied");

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 15000,
    distanceInterval: 20,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Safety Pryde is active",
      notificationBody: "Sharing your location with your trusted contact.",
    },
  });
}

export async function stopBackgroundLocation() {
  const started = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (started) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
  global.__safetyPrydeSessionCode = null;
}