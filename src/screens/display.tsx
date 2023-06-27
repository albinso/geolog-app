import { LocationObject } from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';

import { Box, Button, Paragraph, Title } from '../providers/theme';
import { StackScreenProps } from '@react-navigation/stack';
import { StackParamList } from '../providers/navigation';
import { useLocations } from '../api/hook';
import DateTimePicker from './DTPicker';
import { TextInput } from 'react-native-gesture-handler';

type DisplayScreenProps = StackScreenProps<StackParamList, 'Onboarding'>;

export function DisplayScreen({ navigation }: DisplayScreenProps) {


  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(1987737244916);
  const [num, setNum] = useState(5);

  const { status, data, updateFunc, updateNoCache } = useLocations({ timeRange: [start, end], latitudeRange: [-90, 90], longitudeRange: [-180, 180], num: num });


  useEffect(() => {
  }, [status, data]);
  return (
    <Box variant='page'>
      <Box>
        <Title>Your office marathon</Title>
        <Title>{status}</Title>
        <TextInput value={num.toString()} onChangeText={e => {
          console.log("num: " + e);
          if (e == "") {
            setNum(0);
            return;
          }
          setNum(parseInt(e));
        }} />
        <Button variant='primary' onPress={() => updateFunc()}>Update</Button>
        <Button variant='primary' onPress={() => updateNoCache()}>Update No Cache</Button>
        <Button variant='primary' onPress={() => navigation.navigate("Distance")}>Back to Distance</Button>
        {
          data && <FlatList
            data={data}
            renderItem={({ item }) => <Paragraph>{item.latitude},{item.longitude} -- {new Date(item.timestamp).toString()}</Paragraph>}
            keyExtractor={item => item.id}
          />
        }

      </Box>
      <Box variant='row'>
      </Box>
    </Box>
  );
}
