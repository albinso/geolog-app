import { createElement } from "react-native-web";

export default function DateTimePicker({ value, onChange }) {

    return createElement('input', {
        type: 'date',
        value: value,
        onInput: onChange,
    })
}