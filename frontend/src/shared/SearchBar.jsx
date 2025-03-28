import React, { useState, useEffect, useRef } from 'react';

// Keep your original component name
const Searchbar = ({ onLocationSelected }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibG9raS1tYXBib3giLCJhIjoiY204ZmEyZ3k5MGN0MzJqc2JlazN6NGVleSJ9.F90IKJ-WDfA1AamPufUGRQ'; // Replace with your token

  // Handle clicks outside the component to hide suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions from Mapbox Geocoding API
  const fetchSuggestions = async (inputValue) => {
    if (!inputValue || inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Using Mapbox Geocoding API for city/place suggestions
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(inputValue)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place&limit=5`
      );

      if (!response.ok) throw new Error('Failed to fetch suggestions');

      const data = await response.json();
      
      // Transform the response into a format compatible with your existing code
      const locations = data.features.map(feature => ({
        id: feature.id,
        name: feature.text,
        fullName: feature.place_name,
        coordinates: {
          lat: feature.center[1],
          lng: feature.center[0]
        },
        // Add any other properties your existing code expects
        placeId: feature.id // Mapbox doesn't have Google's placeId, so using feature.id as fallback
      }));

      setSuggestions(locations);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce function to limit API calls while typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.fullName);
    setShowSuggestions(false);
    onLocationSelected(suggestion);
  };

  // Keep your original JSX structure as much as possible
  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a city or tourist destination"
          className="search-input"
          onFocus={() => setShowSuggestions(true)}
        />
        {isLoading && <div className="search-loader">Loading...</div>}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              {suggestion.fullName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Searchbar;