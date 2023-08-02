import { LocationObject } from "expo-location";
import { shouldUse, getDistanceFromLatLonInM } from "../services/location/storage";

describe("shouldUse", () => {

    it("should return true if distance is greater than 10m", () => {
        let location: LocationObject = {
            coords: {
                latitude: 0,
                longitude: 0,
                altitude: 0,
                accuracy: 0,
                altitudeAccuracy: 0,
                heading: 0,
                speed: 0
            },
            timestamp: 1300000000000 + 1000 * 15

        };
        let lastLocationPosted = {
            coords: {
                latitude: 0.0001,
                longitude: 0,
                altitude: 0,
                accuracy: 0,
                altitudeAccuracy: 0,
                heading: 0,
                speed: 0
            },
            timestamp: 1300000000000
        };
        let [pred, cause] = shouldUse(location, lastLocationPosted);
        expect(cause).toBe("No conditions met to skip point")
        expect(pred).toBe(true);
    });

    it("should return false if distance is less than 10m", () => {
        let location: LocationObject = {
            coords: {
                latitude: 0,
                longitude: 0,
                altitude: 0,
                accuracy: 0,
                altitudeAccuracy: 0,
                heading: 0,
                speed: 0
            },
            timestamp: 1300000000000 + 15*1000
        };
        let lastLocationPosted = {
            coords: {
                latitude: 0.00001,
                longitude: 0,
                altitude: 0,
                accuracy: 0,
                altitudeAccuracy: 0,
                heading: 0,
                speed: 0
            },
            timestamp: 1300000000000
        };
        const [pred, cause] = shouldUse(location, lastLocationPosted);
        expect(pred).toBe(false);
        expect(cause).toBe("Distance to last point less than 10 meters and time less than 1 hour");
    });

    it("should calc distance to be less than 10m", () => {
        let location = {
            latitude: 0,
            longitude: 0
        };
        let lastLocationPosted = {
            latitude: 0.00001,
            longitude: 0
        };
        let dist = getDistanceFromLatLonInM(location.latitude, location.longitude, lastLocationPosted.latitude, lastLocationPosted.longitude);
        console.log("Distance: " + dist);
        expect(dist).toBeLessThan(10);
    });

    it("should calc distance to be less than 10m", () => {
        let location = {
            latitude: 0,
            longitude: 0
        };
        let lastLocationPosted = {
            latitude: 0.0001,
            longitude: 0
        };
        let dist = getDistanceFromLatLonInM(location.latitude, location.longitude, lastLocationPosted.latitude, lastLocationPosted.longitude);
        console.log("Distance: " + dist);
        expect(dist).toBeGreaterThan(10);
    });

});

