import { LocationObject } from "expo-location";
import { shouldUse, getDistanceFromLatLonInM } from "../services/location/storage";
import { decryptLocation, encryptLocation } from "../services/location/storage";
import * as keyservice from "../services/keyservice";
import CryptoES from "crypto-es";

var spy;

describe("shouldUse", () => {

    beforeEach(async () => {
        spy = jest.spyOn(keyservice, "getEncryptionKey").mockImplementation(async () => CryptoES.enc.Hex.parse("fdb3c9f81c75b2cc70c769bc49cdf9cd9a107abdaf86a2aaf3d72cbc9c16e22813f1f345927425e79af85bd6ee84a3aab045269c43d2b8c2952d2df4e141e80f"));
    });

    afterEach(() => {
        spy.mockRestore();
    });

    it("reversing encryption should return input", () => {




        let location: LocationObject = {
            coords: {
                latitude: 5,
                longitude: 0,
                altitude: 0,
                accuracy: 0,
                altitudeAccuracy: 0,
                heading: 0,
                speed: 0
            },
            timestamp: 1300000000000 + 15 * 1000
        };
        encryptLocation(location).then((encrypted) => {
            console.log("Encrypted: " + JSON.stringify(encrypted));
            decryptLocation(encrypted).then((decrypted) => {
                expect(decrypted).toEqual(location);
                console.log("Decrypted: " + JSON.stringify(decrypted));
            });
        }
        );
    });

    it("testencryptdecrypt", async () => {
        return;
        let secretKey = await keyservice.getEncryptionKey();
        let iv = CryptoES.lib.WordArray.random(16);
        let prevalue = 55;
        let value = prevalue.toString();
        console.log("secret key: " + secretKey);
        let encrypted = CryptoES.AES.encrypt(value, secretKey, { iv: iv });
        let decrypted = CryptoES.AES.decrypt(encrypted, secretKey, { iv: iv });
        expect(decrypted.toString(CryptoES.enc.Utf8)).toBe(value);
        console.log("encrypted: " + JSON.stringify(encrypted));
        console.log("decrypted: " + decrypted.toString(CryptoES.enc.Utf8));

    });

});

