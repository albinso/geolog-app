import { shouldUse, getDistanceFromLatLonInM } from "../services/location/storage";

describe("shouldUse", () => {

    it("should return true if distance is greater than 10m", () => {
        let location = {
            latitude: 0,
            longitude: 0
        };
        let lastLocationPosted = {
            latitude: 0.0001,
            longitude: 0
        };
        expect(shouldUse(location, lastLocationPosted)[0]).toBe(true);
    });

    it("should return false if distance is less than 10m", () => {
        let location = {
            coords: {
                latitude: 0,
                longitude: 0
            },
            timestamp: 1300000000000
        };
        let lastLocationPosted = {
            coords: {
                latitude: 0.00001,
                longitude: 0
            },
            timestamp: 1300000000005
        };
        const [pred, cause] = shouldUse(location, lastLocationPosted);
        console.log("Cause: " + cause);
        expect(pred).toBe(false);
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

