import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

const keystorageName = 'encryptionKey';

export const useEncryptionKey = () => {
    const [key, setKey] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        SecureStore.getItemAsync(keystorageName).then((key) => {
            if (key) {
                setKey(key);
            } else {
                setErr("No key found in storage named " + keystorageName);
            }
        });
    }, []);

    return [key, err];
}

export const setEncryptionKey = async (key: string): Promise<void> => {
    return SecureStore.setItemAsync(keystorageName, key);
}

export const getEncryptionKey = async (): Promise<string | null> => {
    return SecureStore.getItemAsync(keystorageName);
}

