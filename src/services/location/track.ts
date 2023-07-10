import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

import { postLocation } from '../../api/api';

import { addLocation } from './storage';

/**
 * The unique name of the background location task.
 */
export const locationTaskName = 'geolog';

/**
 * Check if the background location is started and running.
 * This is a wrapper around `Location.hasStartedLocationUpdatesAsync` with the task name prefilled.
 */
export async function isTracking(): Promise<boolean> {
  return await Location.hasStartedLocationUpdatesAsync(locationTaskName);
}

export async function requestForegroundPermissions(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
}

export async function requestBackgroundPermissions(): Promise<boolean> {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
}

/**
 * Start the background location monitoring and add new locations to the storage.
 * This is a wrapper around `Location.startLocationUpdatesAsync` with the task name prefilled.
 */
export async function startTracking() {
  await Location.startLocationUpdatesAsync(locationTaskName, {
    accuracy: Location.Accuracy.BestForNavigation,
    timeInterval: 15 * 1000,
    // android behavior
    foregroundService: {
      notificationTitle: 'GeoLog is active',
      notificationBody: 'Monitoring your location',
      notificationColor: '#333333',
    },
    // ios behavior
    activityType: Location.ActivityType.Fitness,

    showsBackgroundLocationIndicator: true,
  });
  console.log('[tracking]', 'started background location task');
}

/**
 * Stop the background location monitoring.
 * This is a wrapper around `Location.stopLocationUpdatesAsync` with the task name prefilled.
 */
export async function stopTracking() {
  await Location.stopLocationUpdatesAsync(locationTaskName);
  console.log('[tracking]', 'stopped background location task');
}

/**
 * Define the background task that's adding locations to the storage.
 * This method isn't "directly" connected to React, that's why we store the data locally.
 */
TaskManager.defineTask(locationTaskName, async (event) => {
  if (event.error) {
    return console.error('[tracking]', 'Something went wrong within the background location task...', event.error);
  }

  const locations = (event.data as any).locations as Location.LocationObject[];
  locations.forEach((location) => {
    console.log('[tracking]', 'Storing new location', location);
  });
  console.log('[tracking]', 'Received new locations', locations);

  try {
    // have to add it sequentially, parses/serializes existing JSON
    for (const location of locations) {
      await addLocation(location);
    }
  } catch (error) {
    console.log('[tracking]', 'Something went wrong when saving a new location...', error);
  }
});
