# GeoLog

## Upload API

The upload API is a HTTP POST request. The request body should be a single or multiple JSON object with the following format:

```json
{
    "crypto": {
        "iv": "base64-encoded-string",
        "algorithm": "AES",
        "keySize": 256
    },
    "location": {
        "latitude": "base64-encoded-string",
        "longitude": "base64-encoded-string",
        "timestamp": "plaintext-string",
        "accuracy": "base64-encoded-string",
        "altitude": "base64-encoded-string",
        "altitudeAccuracy": "base64-encoded-string",
        "heading": "base64-encoded-string",
        "speed": "base64-encoded-string"
    }
}
```

| EncryptedLocation |  |
| ----------- | ----------- |
| crypto   | EncryptionMetadata |
| location   | EncryptedCoords |

| EncryptionMetadata | Format | Notes|
| ----------- | ----------- | ----------- |
| iv   | String (Base64) | Initialization vector |
| algorithm   | String | 'AES' is the only supported value |
| keySize   | Number | Keysize in bits |

| EncryptedCoords      | Format | Encrypted |
| ----------- | ----------- | ----------- |
| latitude      | String (Base64)      | :heavy_check_mark:
| longitude   | String (Base64)       | :heavy_check_mark:
| timestamp   | String (plaintext)       | :x:
| accuracy   | String (Base64)      | :heavy_check_mark:
| altitude   | String (Base64)       | :heavy_check_mark:
| altitudeAccuracy   | String (Base64)       | :heavy_check_mark:
| heading   | String (Base64)       | :heavy_check_mark:
| speed   | String (Base64)       | :heavy_check_mark:


## Encryption scheme

All fields in EncryptedCoords are encrypted except for the timestamp field. The encryption uses the same IV and key for all fields but the IV is randomly generated for each data point. 

## Key generation

The key is generated from a seedphrase provided by the user using the PBKDF2 algorithm. This process is duplicated in all clients that require access to the data. In order to be repeatable on all clients no salt is used. The seedphrase and key are never sent to the server.

If no seedphrase is provided by the user a random seedphrase is generated and used to create the key.
