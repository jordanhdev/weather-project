import { useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { GeoData, LocData } from './types'

enum AppStateEnum {
  WAITING,
  COMPLETE,
  ERROR
}

function App() {
  const [appState, setAppState] = useState(AppStateEnum.WAITING);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const errorText = useRef("");
  
  async function handleSubmit() {
    if(searchRef.current && searchRef.current.value != "") {
      setAppState(AppStateEnum.WAITING);
      
      const locData = await getGeoData(searchRef.current.value)

      if(locData != null) {
        await getWeatherData(locData);
      }

      setAppState(AppStateEnum.COMPLETE);
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

  async function getWeatherData(lData: LocData) {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" + lData.latitude + "&longitude=" + lData.longitude + "&timezone=" + lData.timezone + "&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&forecast_days=6"); 
  
    if(!res.ok || res.status == 401) 
    {
      setAPIError("api_error");
      return;
    }

    const rData = await res.json();
    console.log(rData); 
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

  function WeatherTable(){
    return (
      <div className='weatherTableCont'>
        <WeatherDayForecast/>
        <WeatherDayForecast/>
      </div>
    )
  }

  function WeatherDayForecast(){
    return (
      <div className='weatherDayCont'>
        <span className='weatherDate'>24/02</span>
        <img src={reactLogo} className="logo react" alt="React logo" />
        <span className='weatherDesc'>It's hot</span>
        <span className='weatherTemp'>32</span>
        <span className='weatherWindSpeed'>4mph</span>
      </div>
    )

  }

  return (
    <>
      <h1>Weather Checker</h1>
      <input ref={searchRef} className="searchBar" type="search"/>
      <button className="button" onClick={()=> handleSubmit()}></button>
      {appState == AppStateEnum.ERROR && <span className="errorText">{errorText.current}</span>}
      {appState == AppStateEnum.COMPLETE && <WeatherTable/>}
    </>
  )
}

export default App
