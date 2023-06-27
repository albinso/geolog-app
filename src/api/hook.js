import { useState, useEffect, useRef } from 'react';
import { fetchLocations } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'react-native-reanimated';
import { Platform } from 'react-native';

export function useLocations({ timeRange, latitudeRange, longitudeRange, num }) {
    const cache = useRef({});
    const [status, setStatus] = useState('idle');
    const [data, setData] = useState([]);
    const initializing = useRef(true);
    const [limit, setLimit] = useState(3);
    const [allowUpdate, setAllowUpdate] = useState(true);
    const [useCache, setUseCache] = useState(true);

    const updateFunc = () => {
        setAllowUpdate(true);
        setLimit(3);
    }

    const updateNoCache = () => {
        setAllowUpdate(true);
        setUseCache(false);
        setLimit(3);
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!allowUpdate) {
                console.log("Update not allowed!");
                return;
            }
            if (status === 'loading') {
                console.log("Already loading!");
                return;
            }
            while (initializing.current) {
                console.log("Waiting for initialization");
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log("Update location with " + timeRange + " " + latitudeRange + " " + longitudeRange + " " + num);
            console.log("Cache: " + JSON.stringify(cache));
            setStatus('loading');
            const cacheKey = JSON.stringify({ timeRange, latitudeRange, longitudeRange, num });
            if (cache.current[cacheKey] && useCache) {
                setData(cache.current[cacheKey]);
                setAllowUpdate(false);
                setStatus('fetched');
                return;
            }
            setUseCache(true);
            if (limit <= 0) {
                console.log("Limit reached!");
                return;
            }
            setLimit(limit - 1);
            console.log("Cache miss with key: ", cacheKey);
            fetchLocations({ timeRange, latitudeRange, longitudeRange, num }).then((locations) => {
                console.log("Fetch data: " + JSON.stringify(locations));
                setData(locations);
                setStatus('fetched');
                cache.current[cacheKey] = locations;
                saveCache(cache);
                setAllowUpdate(false);
            });
        };
        fetchData();
    }, [timeRange, latitudeRange, longitudeRange]);

    useEffect(() => {
        if (!initializing.current) {
            return;
        }
        initializing.current = false;
        loadCache().then(loadedCache => {
            if (loadedCache) {
                console.log("Loaded cache: " + JSON.stringify(loadedCache));
                cache.current = JSON.parse(loadedCache);
            }
        });
    }, []);

    return { status, data, updateFunc, updateNoCache };

}
async function loadCache() {
    if (Platform.OS === 'web') {
        return Promise.resolve(localStorage.getItem('locationsCache'));
    } else {
        return await AsyncStorage.getItem('locationsCache');
    }
}

async function saveCache(cache) {
    if (Platform.OS === 'web') {
        localStorage.setItem('locationsCache', JSON.stringify(cache.current));
    } else {
        await AsyncStorage.setItem('locationsCache', JSON.stringify(cache.current));
    }
}

