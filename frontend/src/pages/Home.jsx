import React, { useState } from 'react';
import Searchbar from '../shared/SearchBar';
import TouristPlacesCard from '../shared/Tourist-places';
import WeatherInfo from './../shared/weather';

const Home = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelected = (location) => {
    setSelectedLocation(location);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <Searchbar onLocationSelected={handleLocationSelected} />
        
        {selectedLocation && (
          <>
            <div className="bg-white rounded-lg shadow-md my-6">
              <h2 className="text-2xl font-bold p-4">Tourist Places in {selectedLocation.name}</h2>
              <TouristPlacesCard location={selectedLocation} />
            </div>
            
            <div className="bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-bold p-4">Weather Information</h2>
              <WeatherInfo location={selectedLocation} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;