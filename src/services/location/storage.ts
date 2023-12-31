import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationObject } from 'expo-location';
import { postLocation } from '../../api/api';
import { EncryptedLocation, encryptLocation } from '../encryptservice';

/**
 * The unique key of the location storage.
 */
export const locationStorageName = 'locations';

type StoredLocation = {
  encrypted: EncryptedLocation,
  plaintext: LocationObject,
}
/**
 * Get all stored locations from storage.
 * This is a wrapper around AsyncStorage to parse stored JSON.
 */
export async function getLocations(): Promise<StoredLocation[]> {
  const data = await AsyncStorage.getItem(locationStorageName);
  return data ? JSON.parse(data) : [];
}

/**
 * Update the locations in storage.
 * This is a wrapper around AsyncStorage to stringify the JSON.
 */
export async function setLocations(locations: StoredLocation[]): Promise<void> {
  await AsyncStorage.setItem(locationStorageName, JSON.stringify(locations));
}

export function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 1000.0;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

export const shouldUse = (location: LocationObject, lastLocationPosted: LocationObject) => {
  if (!lastLocationPosted) {
    return [true, 'No last location'];
  }
  if (!lastLocationPosted.coords || !lastLocationPosted.timestamp) {
    return [true, 'Last location has no coords or timestamp'];
  }

  let x1 = location.coords.latitude;
  let y1 = location.coords.longitude;
  let x2 = lastLocationPosted.coords.latitude;
  let y2 = lastLocationPosted.coords.longitude;

  let ts1 = location.timestamp;
  let ts2 = lastLocationPosted.timestamp;

  let d = getDistanceFromLatLonInM(x1, y1, x2, y2);
  console.log('[storage]', 'distance to last point ', d, ' meters');

  let t = (ts1 - ts2) / 1000.0;
  console.log('[storage]', 'time to last point ', t, ' s');

  if (t < 10) {
    return [false, 'Time since last point less than 10 seconds'];
  }

  if (d < 10 && t < 3600) { // should be equivalent to ~10m
    return [false, 'Distance to last point less than 10 meters and time less than 1 hour'];
  }

  if (t < 300 && d < 10 + location.coords.accuracy) {
    return [false, 'Time less than 5 minutes and distance less than 10 meters + one standard deviation'];
  }
  return [true, 'No conditions met to skip point'];

}

/**
 * Add a new location to the storage.
 * This is a helper to append a new location to the storage.
 */
export async function addLocation(location: LocationObject): Promise<EncryptedLocation[]> {
  const existing: StoredLocation[] = await getLocations();
  const locations: LocationObject[] = [...existing.map(sl => sl?.plaintext), location];
  console.log('[storage] encrypted locations', existing.map(sl => JSON.stringify(sl?.encrypted)));
  const lastLocationPosted: LocationObject = existing[existing.length - 1]?.plaintext;
  console.log('[storage]', 'last location posted', lastLocationPosted);
  console.log('[storage]', 'current location', location);
  const [shouldUsePoint, cause] = shouldUse(location, lastLocationPosted);
  if (existing.length > 0 && !shouldUsePoint) {
    console.log("[storage] skipped location because: " + cause);
    return;
  }
  console.log("[storage] added location because: " + cause);

  const encryptedLocation: EncryptedLocation = await encryptLocation(location);
  const encryptedLocations: EncryptedLocation[] = [...existing.map(sl => sl.encrypted), encryptedLocation];
  const storage = locations.map((location, index) => ({
    encrypted: encryptedLocations[index],
    plaintext: location,
  }));
  await setLocations(storage);
  console.log('[storage]', 'added location -', encryptedLocations.length, 'stored locations');

  if (locations.length >= 20 || locations.length >= 1 && encryptedLocation.location.timestamp - encryptedLocations[0].location.timestamp >= 60 * 1000 * 60) {

    postLocation(encryptedLocations).then(() => {
      clearLocations();
    });
  }
  return encryptedLocations;
}

/**
 * Reset all stored locations.
 */
export async function clearLocations(): Promise<void> {
  await AsyncStorage.removeItem(locationStorageName);
  console.log('[storage]', 'cleared locations');
}
