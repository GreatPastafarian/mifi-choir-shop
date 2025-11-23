// src/services/dadataService.js
import axios from 'axios';

const API_KEY = process.env.REACT_APP_DADATA_API_KEY;

const dadata = axios.create({
    baseURL: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${API_KEY}`
    }
});

export const getZipCodeByAddress = async (city, street, building) => {
    if (!API_KEY) {
        console.warn('DaData API Key is missing');
        return null;
    }

    try {
        const query = `${city} ${street} ${building}`;
        const response = await dadata.post('/suggest/address', { query, count: 1 });

        if (response.data.suggestions && response.data.suggestions.length > 0) {
            const data = response.data.suggestions[0].data;
            return data.postal_code;
        }
        return null;
    } catch (error) {
        console.error('Ошибка DaData:', error);
        throw error;
    }
};
