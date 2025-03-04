export type GeoData = {
    results: LocData[];
}

export type LocData = {
    longitude: number;
    latitude: number;
    timezone: string;
    admin1?: string;
    admin2?: string;
    admin3?: string;
    country?: string;
}
export type TransposedWeatherData = {
    time: string;
    weatherCode: number;
    windSpeed: number;
    tempMin: number;
    tempMax: number;
}

export type WeatherCodeData = {
    desc: string;
    imgUrl: string;
}

export interface WeatherData {
    daily: {
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        time: string[];
        weather_code: number[];
        wind_speed_10m_max: number[];
    }
}