import { StackScreenProps } from '@react-navigation/stack';
import { useCallback, useEffect, useState } from 'react';

import { StackParamList } from '../providers/navigation';
import { Box, Button, Spinner, Title, Paragraph } from '../providers/theme';
import { generateEncryptionKey, setEncryptionKey, useEncryptionKey } from '../services/keyservice';
import CryptoES from 'crypto-es';
import { TextInput } from 'react-native';


type OnboardingKeyScreenProps = StackScreenProps<StackParamList, 'OnboardingKey'>;

export function OnboardingKeyScreen({ navigation }: OnboardingKeyScreenProps) {

    const [key, err] = useEncryptionKey();
    const [seedphrase, setSeedphrase] = useState(null);
    const [update, setUpdate] = useState(false);


    const onContinue = useCallback(() => {
        navigation.navigate('Distance');
    }, [navigation]);

    const saveKey = useCallback((event) => {
        let seen = [];
        console.log(Object.keys(event.target))
        console.log(event.nativeEvent)
        console.log("Submitting key: " + event.nativeEvent.text);
        setEncryptionKey(event.nativeEvent.text).then(() => {
            onContinue();
        }).catch((err) => {
            console.log(err);
        });
    }, [onContinue, key, err, navigation])

    useEffect(() => {
        if (!key && err) {
            alert(err);
            return;
        }
        if (key) {
            onContinue();
        }
    }, [onContinue, key, err, navigation]);

    if (update) {
        return (
            <Box variant='page'>
                <Box>
                    <Title>Found Encryption Key</Title>
                    <Paragraph>All set!</Paragraph>
                </Box>
                <Button onPress={onContinue}>Let's start!</Button>
                {seedphrase && <Paragraph selectable={true}>
                    Seedphrase: {seedphrase}
                </Paragraph>}
            </Box>
        );
    }

    const generateKey = (event) => {
        setUpdate(true);
        if (seedphrase) {
            generateEncryptionKey(seedphrase).then(( a ) => {
                setEncryptionKey(a.key);
                setSeedphrase(a.seed);
                console.log(a.seed);
                console.log(a.key);
            });
            return;
        }
        generateEncryptionKey().then(( a ) => {
            setEncryptionKey(a.key);
            setSeedphrase(a.seed);
            console.log(a.seed);
            console.log(a.key);
        });
    }

    return (
        <Box variant='page'>
            <Box>
                <Title>Encryption key required</Title>
                <Paragraph>To encrypt location data a key is required</Paragraph>
            </Box>
            <Button onPress={generateKey}>Generate key</Button>
            <TextInput onChangeText={e => setSeedphrase(e)}></TextInput>
            {seedphrase && <Paragraph>
                    Seedphrase: {seedphrase}
                </Paragraph>}
        </Box>
    );
};
