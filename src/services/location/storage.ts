import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationObject } from 'expo-location';
import postLocation from '../../api/api';

/**
 * The unique key of the location storage.
 */
export const locationStorageName = 'locations';

/**
 * Get all stored locations from storage.
 * This is a wrapper around AsyncStorage to parse stored JSON.
 */
export async function getLocations(): Promise<LocationObject[]> {
  const data = await AsyncStorage.getItem(locationStorageName);
  return data ? JSON.parse(data) : [];
}

/**
 * Update the locations in storage.
 * This is a wrapper around AsyncStorage to stringify the JSON.
 */
export async function setLocations(locations: LocationObject[]): Promise<void> {
  await AsyncStorage.setItem(locationStorageName, JSON.stringify(locations));
}

export function getDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);  // deg2rad below
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d*1000.0;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

export const shouldUse = (location, lastLocationPosted) => {
  let x1 = parseFloat(location.latitude);
  let y1 = parseFloat(location.longitude);
  let x2 = parseFloat(lastLocationPosted.latitude);
  let y2 = parseFloat(lastLocationPosted.longitude);


  if (getDistanceFromLatLonInM(x1, y1, x2, y2) < 10) { // should be equivalent to ~10m
    return false;
  }
  return true;

}

/**
 * Add a new location to the storage.
 * This is a helper to append a new location to the storage.
 */
export async function addLocation(location: LocationObject): Promise<LocationObject[]> {
  const existing = await getLocations();
  const locations = [...existing, location];
  const lastLocationPosted = locations[0];
  if (!shouldUse(location, existing[-1])) {
    console.log("[storage] skipped location due to distance to previous point");
    return;
  }
  

  await setLocations(locations);
  console.log('[storage]', 'added location -', locations.length, 'stored locations');
  

  if (locations.length >= 20 || locations.length >= 1 && location.timestamp - locations[0].timestamp >= 60 * 1000 * 5) {
    postLocation(locations).then(() => {
      clearLocations();
    });
  }
  return locations;
}



/**
 * Reset all stored locations.
 */
export async function clearLocations(): Promise<void> {
  await AsyncStorage.removeItem(locationStorageName);
  console.log('[storage]', 'cleared locations');
}
