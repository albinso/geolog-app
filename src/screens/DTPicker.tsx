import { createElement } from "react-native-web";
import { Platform } from 'react-native';
import DateTimePickerMobile from '@react-native-community/datetimepicker';

export default function DateTimePicker({ value, onChange }) {

    if (Platform.OS === 'web') {
        return createElement('input', {
            type: 'date',
            value: value,
            onInput: onChange,
        })
    } else {
        return (
            <DateTimePickerMobile testID="dateTimePicker" value={value} onChange={onChange} mode='date' is24Hour={true}></DateTimePickerMobile>
        )
    }
}