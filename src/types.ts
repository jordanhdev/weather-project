export type GeoData = {
    results: LocData[];
}

export type LocData = {
    longitude: number;
    latitude: number;
    timezone: string
}