import { LocationObject } from "expo-location";

async function postLocation(locations : LocationObject[]): Promise<any> {
    //POST json
    var dataToSend = JSON.stringify(locations.map(location => {
        return { ...location.coords, timestamp: location.timestamp };
    }));
    console.log("[api] Posting: " + dataToSend);

    //POST request
    return fetch('https://geolog.azurewebsites.net/api/ClientTrigger?code='+process.env.REACT_APP_AZ_FUNC_CODE, {
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

export default postLocation;