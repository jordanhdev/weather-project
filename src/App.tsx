import { useRef, useState } from 'react'
import search from '/search.svg'
import './weather-icons.css'
import './App.css'
import { GeoData, LocData, TransposedWeatherData, WeatherData } from './types'
import { JSX } from 'react/jsx-runtime'
import { getWeatherDesc, getWeatherImg } from './weatherCodeUtil'

enum AppStateEnum {
  WAITING,
  COMPLETE,
  ERROR
}

function App() {
  const [appState, setAppState] = useState(AppStateEnum.WAITING);
  const [locName, setLocName] = useState("");
  const [weatherData, setWeatherData] = useState<TransposedWeatherData[]>([]);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const errorText = useRef("");

  const forecastDays = 5;
  
  async function handleSubmit() {
    if(searchRef.current && searchRef.current.value != "") {
      setAppState(AppStateEnum.WAITING);
      errorText.current = "";
      
      const locData = await getGeoData(searchRef.current.value)

      if(locData != null) {
        const nWeatherData = await getWeatherData(locData);

        if(nWeatherData != null && nWeatherData.length != 0){
          setWeatherData(nWeatherData)
          setLocName(getLocName(locData))
          setAppState(AppStateEnum.COMPLETE);
        }
      }
    }
    else {
      setAPIError("no_loc");
    }
  }

  async function getGeoData(locName: string): Promise<LocData | null> {
    const res = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + locName + "&count=1&language=en&format=json");
  
    if(!res.ok || res.status == 401) 
    {
      setAPIError("api_error");
      return null;
    }

    const rData = await res.json() as GeoData;
    
    if(rData.results == undefined || rData.results.length == 0) {
      setAPIError("no_results");
      return null;
    }
    else {
      const gData = {...rData.results[0]}
      return gData;
    }
  }

  async function getWeatherData(lData: LocData): Promise<TransposedWeatherData[] | null> {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" + lData.latitude + "&longitude=" + lData.longitude + "&timezone=" + lData.timezone + "&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&forecast_days=" + forecastDays); 
  
    if(!res.ok || res.status == 401) 
    {
      setAPIError("api_error");
      return null;
    }

    const rData = await res.json() as WeatherData;

    if(rData.daily == undefined) {
      setAPIError("api_error");
      return null;
    }

    //requirement is to get the next 5 days of weather, unsure if this included the current day as well or the next 5 days. have included the current day 
    const weatherData: TransposedWeatherData[] = [];

    for (let i = 0; i < forecastDays; i++) {
      let newWeatherData: TransposedWeatherData = {
        tempMax: rData.daily.temperature_2m_max[i],
        tempMin: rData.daily.temperature_2m_min[i],
        time: rData.daily.time[i],
        weatherCode: rData.daily.weather_code[i],
        windSpeed: rData.daily.wind_speed_10m_max[i]
      };

      weatherData.push(newWeatherData);
    }

    return weatherData;
  }

  function setAPIError(errType: string) {
    setAppState(AppStateEnum.ERROR);
    switch (errType) {
      case "no_loc":
        errorText.current = "Please input a location."
        break;
      case "no_results":
        errorText.current = "No results found for that location."
        break;
      case "api_error":
        errorText.current = "An unexpected error occured. Please try again."
        break;      
    }
  }

  function getLocName(lData: LocData) {
    let lName = "";

    if (lData.admin2) { lName += lData.admin2 + ", "; }
    if (lData.admin1) { lName += lData.admin1 + ", "; }
    if (lData.admin3) { lName += lData.admin3 + ", "; }
    if (lData.country) { lName += lData.country; }

    return lName;
  }

  function WeatherTable(){
    let weatherElems: JSX.Element[] = [];

    for (let i = 0; i < weatherData.length; i++) {
      weatherElems.push(
        <WeatherDayForecast weatherInfo={weatherData[i]} key={i}/>
      )
    }

    return (
      <div className='weatherTableCont'>
        {weatherElems}
      </div>
    )
  }

  function WeatherDayForecast({weatherInfo}: {weatherInfo: TransposedWeatherData}){
    const date = new Date(weatherInfo.time);

    return (
      <div className='weatherDayCont'>
        <span className='weatherDate'>{date.toDateString()}</span>
        <i className={"weatherIcon wi " + getWeatherImg(weatherInfo.weatherCode)}></i>
        <span className='weatherDesc'>{getWeatherDesc(weatherInfo.weatherCode)}</span>
        <span className='weatherTemp'>{weatherInfo.tempMin + "°C/" + weatherInfo.tempMax + "°C"}</span>
        <span className='weatherWindSpeed'>{"Wind: " + weatherInfo.windSpeed + "km/h"}</span>
      </div>
    )

  }

  return (
    <>
      <h1 className="header">Weather Checker</h1>
      <div className="locSearchCont">
        <input ref={searchRef} className="searchBar" type="search"/>
        <button className="searchButton" onClick={()=> handleSubmit()}>
          <img className='searchIcon' src={search}></img>
        </button>
      </div>
      {appState == AppStateEnum.ERROR && <span className="errorText">{errorText.current}</span>}
      {appState == AppStateEnum.COMPLETE &&
      <>
        <h2 className="weatherLocation">{"Weather data for " + locName }</h2>
        <WeatherTable/> 
      </>}
    </>
  )
}

export default App
