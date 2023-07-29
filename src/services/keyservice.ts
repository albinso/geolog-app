import CryptoES from 'crypto-es';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

const keystorageName = 'encryptionKey';

export const useEncryptionKey = () => {
    const [key, setKey] = useState<CryptoES.lib.WordArray | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        SecureStore.getItemAsync(keystorageName).then((key) => {
            if (key) {
                setKey(CryptoES.enc.Base64.parse(key));
            } else {
                setErr("No key found in storage named " + keystorageName);
            }
        });
    }, []);

    return [key, err];
}

export const setEncryptionKey = async (key: CryptoES.lib.WordArray): Promise<void> => {
    if(!key) {
        return SecureStore.deleteItemAsync(keystorageName);
    }
    return SecureStore.setItemAsync(keystorageName, key.toString(CryptoES.enc.Base64));
}

export const getEncryptionKey = async (): Promise<CryptoES.lib.WordArray | null> => {
    const keystring = await SecureStore.getItemAsync(keystorageName);
    return CryptoES.enc.Base64.parse(keystring);
}

export const generateEncryptionKey = async () => {
    var seedphrase = CryptoES.lib.WordArray.random(128 / 8).toString(CryptoES.enc.Hex);
    var key : CryptoES.lib.WordArray = CryptoES.PBKDF2(seedphrase, "", {
        keySize: 512 / 32
    });
    return { seedphrase, key };
}
