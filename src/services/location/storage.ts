import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationObject } from 'expo-location';
import { postLocation } from '../../api/api';
import CryptoES from "crypto-es";
import { getEncryptionKey } from '../keyservice';

/**
 * The unique key of the location storage.
 */
export const locationStorageName = 'locations';


export type EncryptionMetadata = {
  iv: string,
  algorithm: string,
  keySize: number,
}

export type EncryptedCoords = {
  latitude: string,
  longitude: string,
  accuracy: string,
  altitude: string,
  altitudeAccuracy: string,
  heading: string,
  speed: string,
  timestamp: number,
}

export type EncryptedLocation = {
  crypto: EncryptionMetadata,
  location: EncryptedCoords,
}

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

export async function encryptLocation(oldLocation: LocationObject): Promise<EncryptedLocation> {
  let secretKey = await getEncryptionKey();

  

  console.log("[storage] secret key: " + secretKey);
  var iv = CryptoES.lib.WordArray.random(16);

  function encryptValue(value : number, iv : CryptoES.lib.WordArray): string {
    let cipherParams = CryptoES.AES.encrypt(value.toString(), secretKey, { iv: iv, padding: CryptoES.pad.Pkcs7 });
    console.log("Encrypted cipherparams: " + JSON.stringify(cipherParams));
    return cipherParams.ciphertext.toString(CryptoES.enc.Base64);
  }

  CryptoES.lib.CipherParams

  var newLoc: EncryptedLocation = {
    crypto: {
      iv: iv.toString(CryptoES.enc.Base64),
      algorithm: 'AES',
      keySize: secretKey.sigBytes * 8,
    },
    location: {
      latitude: encryptValue(oldLocation.coords.latitude, iv),
      longitude: encryptValue(oldLocation.coords.longitude, iv),
      altitude: encryptValue(oldLocation.coords.altitude, iv),
      accuracy: encryptValue(oldLocation.coords.accuracy, iv),
      altitudeAccuracy: encryptValue(oldLocation.coords.altitudeAccuracy, iv),
      heading: encryptValue(oldLocation.coords.heading, iv),
      speed: encryptValue(oldLocation.coords.speed, iv),
      timestamp: oldLocation.timestamp,
    }
  };

  return newLoc;

  
}

export async function decryptLocation(oldLocation: EncryptedLocation): Promise<LocationObject> {
  let secretKey : CryptoES.lib.WordArray = await getEncryptionKey();
  
  
  const decryptPoint = (valueB64 : string, iv : CryptoES.lib.WordArray): string => {
    console.log("===========================================");
    let cipherParams : CryptoES.lib.CipherParams= {
      ciphertext: CryptoES.enc.Base64.parse(valueB64),
      key: secretKey,
      iv: iv,
      padding: CryptoES.pad.Pkcs7,
      blockSize: 4,
      formatter: null,
      salt: null,
      mode: null,
      algorithm: null,
      mixIn: null,
      clone: null,
    };
    console.log("decrypting: " + JSON.stringify(cipherParams));
    console.log("decrypting: " + valueB64);
    console.log("decrypting: " + CryptoES.enc.Base64.parse(valueB64).sigBytes);
    console.log("decrypting with key: " + secretKey.toString(CryptoES.enc.Hex));
    
    let s : CryptoES.lib.WordArray = CryptoES.AES.decrypt(cipherParams, secretKey, { iv: iv });
    console.log("decrypted: " + s.sigBytes);
    console.log("decrypted: " + s);
    console.log("decrypted: " + s.toString(CryptoES.enc.Utf8));
    return s.toString(CryptoES.enc.Utf8);
  }


  console.log("[storage] secret key: " + secretKey);
  var iv = CryptoES.enc.Base64.parse(oldLocation.crypto.iv);
  var newLoc: LocationObject = {
    coords: {
      latitude: parseFloat(decryptPoint(oldLocation.location.latitude, iv)),
      longitude: parseFloat(decryptPoint(oldLocation.location.longitude, iv)),
      altitude: parseFloat(decryptPoint(oldLocation.location.altitude, iv)),
      accuracy: parseFloat(decryptPoint(oldLocation.location.accuracy, iv)),
      altitudeAccuracy: parseFloat(decryptPoint(oldLocation.location.altitudeAccuracy, iv)),
      heading: parseFloat(decryptPoint(oldLocation.location.heading, iv)),
      speed: parseFloat(decryptPoint(oldLocation.location.speed, iv)),
    },
    timestamp: oldLocation.location.timestamp,
  };

return newLoc;
}


/**
 * Reset all stored locations.
 */
export async function clearLocations(): Promise<void> {
  await AsyncStorage.removeItem(locationStorageName);
  console.log('[storage]', 'cleared locations');
}
