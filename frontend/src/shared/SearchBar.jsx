import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Searchbar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const searchRef = useRef(null);

  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibG9raS1tYXBib3giLCJhIjoiY204ZmEyZ3k5MGN0MzJqc2JlazN6NGVleSJ9.F90IKJ-WDfA1AamPufUGRQ';
  const GEMINI_API_KEY = 'AIzaSyCivR3wFPyrYUIRpDirES8LV-x6xdgVMc4';
  const WEATHER_API_KEY = 'c8e395423ca0693b54537b361428e876';

  // Fetch suggestions from Mapbox Geocoding API
  const fetchSuggestions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(inputValue)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place&limit=5`
      );

      if (!response.ok) throw new Error('Failed to fetch suggestions');

      const data = await response.json();
      
      const locations = data.features.map(feature => ({
        id: feature.id,
        name: feature.text,
        fullName: feature.place_name,
        coordinates: {
          lat: feature.center[1],
          lng: feature.center[0]
        },
        placeId: feature.id
      }));

      setSuggestions(locations);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse tourist places content
  const parseTouristPlacesContent = (content) => {
    const places = [];
    const lines = content.split('\n');
    
    let currentPlace = null;
    lines.forEach(line => {
      line = line.trim();
      
      // Detect a new place entry
      if (line.match(/^\d+\./)) {
        if (currentPlace) {
          places.push(currentPlace);
        }
        currentPlace = { 
          name: line.replace(/^\d+\.\s*/, ''),
          description: '',
          type: ''
        };
      } else if (currentPlace) {
        // Accumulate description and type
        if (!currentPlace.description) {
          currentPlace.description = line;
        } else if (!currentPlace.type && line.toLowerCase().includes('type:')) {
          currentPlace.type = line.replace(/type:\s*/i, '');
        }
      }
    });

    // Add the last place
    if (currentPlace) {
      places.push(currentPlace);
    }

    return places;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.fullName);
    setShowSuggestions(false);
  };

  // Fetch weather data
  const fetchWeatherData = async (location) => {
    if (!location) return;
    const API_KEY = 'c8e395423ca0693b54537b361428e876';
  
    try {
      // Step 1: Get latitude & longitude for the location
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`
      );
  
      const geoData = await geoResponse.json();
      if (!geoData || geoData.length === 0) {
        console.error('Location not found');
        return;
      }
  
      const { lat, lon, name, country } = geoData[0];
  
      // Step 2: Get weather data using latitude & longitude
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
  
      const weatherData = await weatherResponse.json();
  
      if (!weatherData || !weatherData.main) {
        console.error('Weather data not available');
        return;
      }
  
      // Step 3: Set the weather data in state
      setWeatherData({
        placeName: name,
        country: country,
        temperature: weatherData.main.temp,
        condition: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        precipitation: weatherData.rain ? weatherData.rain['1h'] : 0,
        icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
      });
  
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(null);
    }
  };
  

  // Fetch tourist places using Gemini
  const fetchTouristPlaces = async () => {
    if (!query) return;

    setIsLoading(true);
    setTouristPlaces([]);
    setWeatherData(null);

    try {
      // Fetch tourist places 
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `List top 10 tourist places to visit in ${query}. For each place, provide:
      - Name of the place
      - Brief description
      - Type of attraction (historical, natural, cultural, etc.)
      Format the response as a structured list with each entry containing these details.`;

      const result = await model.generateContent(prompt);
      const content = await result.response.text();
      
      // Parse the content
      const parsedPlaces = parseTouristPlacesContent(content);
      setTouristPlaces(parsedPlaces);

      // Fetch weather data for the location
      await fetchWeatherData(query);
    } catch (error) {
      console.error('Error generating tourist places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Render the component
  return (
    <div className="container mx-auto p-4">
      <div className="search-container" ref={searchRef}>
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search for a city or tourist destination"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {suggestion.fullName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button 
            onClick={fetchTouristPlaces}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center mt-4">
          <p>Loading information...</p>
        </div>
      )}

      {touristPlaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tourist Places Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Top Tourist Places in {query}</h2>
            <div className="grid grid-cols-1 gap-4">
              {touristPlaces.map((place, index) => (
                <div 
                  key={index} 
                  className="bg-gray-100 rounded-lg p-4 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold mb-2">{place.name}</h3>
                  <p className="text-gray-600 mb-2">{place.description}</p>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {place.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Section */}
          {weatherData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Weather in {query}</h2>
              <div className="flex items-center justify-between">
                <div>
                  <img 
                    src={`https:${weatherData.icon}`} 
                    alt="Weather icon" 
                    className="w-20 h-20"
                  />
                  <h3 className="text-xl font-semibold">{weatherData.placeName}, {weatherData.country}</h3>
                  <p className="text-gray-600">{weatherData.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold">{weatherData.temperature}°C</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="font-medium">Humidity</p>
                  <p>{weatherData.humidity}%</p>
                </div>
                <div>
                  <p className="font-medium">Pressure</p>
                  <p>{weatherData.pressure} mb</p>
                </div>
                <div>
                  <p className="font-medium">Precipitation</p>
                  <p>{weatherData.precipitation} mm</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Searchbar;