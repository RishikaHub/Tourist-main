import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Droplet, 
  Wind, 
  Thermometer, 
  CloudRain, 
  Sun 
} from 'lucide-react';

const WeatherInfo = ({ location }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return;

      setIsLoading(true);
      try {
        // Simulated Weather API call - replace with actual API endpoint
        const response = await fetch(`/api/weather?lat=${location.coordinates.lat}&lon=${location.coordinates.lng}`);
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [location]);

  if (isLoading) {
    return <div className="text-center py-4">Loading weather information...</div>;
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
        <Thermometer className="w-10 h-10 text-blue-500 mb-2" />
        <h3 className="text-lg font-semibold">Temperature</h3>
        <p>{weatherData.temperature}°C</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
        <Droplet className="w-10 h-10 text-blue-500 mb-2" />
        <h3 className="text-lg font-semibold">Humidity</h3>
        <p>{weatherData.humidity}%</p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
        <CloudRain className="w-10 h-10 text-blue-500 mb-2" />
        <h3 className="text-lg font-semibold">Precipitation</h3>
        <p>{weatherData.precipitation} mm</p>
      </div>
    </div>
  );
};

export default WeatherInfo;