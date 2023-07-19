import CryptoES from "crypto-es";
import { LocationObject } from "expo-location";
import { getEncryptionKey } from "./keyservice";

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

export async function encryptLocation(oldLocation: LocationObject): Promise<EncryptedLocation> {
    let secretKey = await getEncryptionKey();

    console.log("[storage] secret key: " + secretKey);
    var iv = CryptoES.lib.WordArray.random(16);

    function encryptValue(value: number, iv: CryptoES.lib.WordArray): string {
        let cipherParams = CryptoES.AES.encrypt(value.toString(), secretKey, { iv: iv, padding: CryptoES.pad.Pkcs7 });
        console.log("Encrypted cipherparams: " + JSON.stringify(cipherParams));
        return cipherParams.ciphertext.toString(CryptoES.enc.Base64);
    }

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
    let secretKey: CryptoES.lib.WordArray = await getEncryptionKey();


    const decryptPoint = (valueB64: string, iv: CryptoES.lib.WordArray): string => {
        console.log("===========================================");
        let cipherParams: CryptoES.lib.CipherParams = {
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

        let s: CryptoES.lib.WordArray = CryptoES.AES.decrypt(cipherParams, secretKey, { iv: iv });
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