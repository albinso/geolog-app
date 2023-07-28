import { StackScreenProps } from '@react-navigation/stack';
import { useCallback, useEffect } from 'react';

import { StackParamList } from '../providers/navigation';
import { Box, Button, Spinner, Title, Paragraph } from '../providers/theme';
import { setEncryptionKey, useEncryptionKey } from '../services/keyservice';
import { TextInput } from 'react-native';


type OnboardingKeyScreenProps = StackScreenProps<StackParamList, 'OnboardingKey'>;

export function OnboardingKeyScreen({ navigation }: OnboardingKeyScreenProps) {

    const [key, err] = useEncryptionKey();


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
        // Only redirect on first render or permission change,
        // not when users go back to this screen.
        if (!key && err) {
            alert(err);
            return;
        }
        if (key) {
            onContinue();
        }
    }, [onContinue, key, err, navigation]);

    if (key) {
        return (
            <Box variant='page'>
                <Box>
                    <Title>Found Encryption Key</Title>
                    <Paragraph>All set!</Paragraph>
                </Box>
                <Button onPress={onContinue}>Let's start!</Button>
            </Box>
        );
    }

    return (
        <Box variant='page'>
            <Box>
                <Title>Encryption key required</Title>
                <Paragraph>To encrypt location data a key is required</Paragraph>
            </Box>
            <TextInput onSubmitEditing={saveKey}></TextInput>
        </Box>
    );
};
