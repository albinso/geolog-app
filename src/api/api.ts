import { EncryptedLocation } from "@src/services/location/storage";
import { LocationObject } from "expo-location";

//const url = 'https://geolog.azurewebsites.net/api/GetLogs';
const url = 'http://localhost:7071/api/GetLogs';


export async function postLocation(locations : EncryptedLocation[]): Promise<any> {
    //POST json
    var dataToSend = JSON.stringify(locations.map(location => {
        return { ...location.location.coords, timestamp: location.location.timestamp, crypto: location.crypto };
    }));
    console.log("[api] Posting: " + dataToSend);

    //POST request
    return fetch(url + '?code='+process.env.REACT_APP_AZ_FUNC_CODE, {
        method: 'POST', //Request Type
        body: dataToSend, //post body
        headers: {
            //Header Defination
            'Content-Type': 'application/json;charset=UTF-8',
        },
    })
        .then((response) => {
            console.log("Reponse: " + JSON.stringify(response));
            return response.json()
        })
        //If response is in json then in success
        .then((responseJson) => {
            console.log(responseJson);
            
        })
        //If response is not in json then in error
        .catch((error) => {
            console.error("Got error");
            console.error(error);
            
        });
};

export async function fetchLocations( { timeRange, latitudeRange, longitudeRange, num }) {
    return fetch(url + '?code='+process.env.REACT_APP_AZ_FUNC_CODE + '&' + new URLSearchParams({
        minTimestamp: timeRange[0] || 0,
        maxTimestamp: timeRange[1] || Date.now(),
        minLatitude: latitudeRange[0] || -90,
        maxLatitude: latitudeRange[1] || 90,
        minLongitude: longitudeRange[0] || -180,
        maxLongitude: longitudeRange[1] ||  180,
        num: num || 10,
    }), {
        method: 'GET', //Request Type
        headers: {
            //Header Defination
            'Content-Type': 'application/json;charset=UTF-8',
        },
    })
        .then((response) => {
            console.log("Reponse: " + response);
            console.log("Reponse: " + JSON.stringify(response));
            return response.json()
        })
        //If response is not in json then in error
        .catch((error) => {
            console.error("Got error");
            console.error(error);
            
        });
}