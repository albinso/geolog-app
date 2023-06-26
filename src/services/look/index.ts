import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';


export function useNightmode() {
    const [nightmode, setNightmode] = useState<boolean>(false);
  
    const toggleNightmode = () => {
      setNightmode(!nightmode);
    };

    const getStyles = () => {
        return nightmode ? styles.red : styles.bigBlue;
    }
  
    return {
      nightmode, toggleNightmode, getStyles
    };
}

const styles = StyleSheet.create({
    container: {
      marginTop: 50,
    },
    bigBlue: {
      color: 'blue',
      fontWeight: 'bold',
      fontSize: 30,
    },
    red: {
      color: 'red',
    },
});