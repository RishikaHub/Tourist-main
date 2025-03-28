import React, { useState, useEffect } from 'react';
import { MapPin, Calendar } from 'lucide-react';

const TouristPlacesCard = ({ location }) => {
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTouristPlaces = async () => {
      if (!location) return;

      setIsLoading(true);
      try {
        // Simulated Gemini API call - replace with actual API endpoint
        const response = await fetch(`/api/tourist-places?location=${encodeURIComponent(location.name)}`);
        const data = await response.json();
        setTouristPlaces(data.places);
      } catch (error) {
        console.error('Error fetching tourist places:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTouristPlaces();
  }, [location]);

  if (isLoading) {
    return <div className="text-center py-4">Loading tourist places...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {touristPlaces.map((place) => (
        <div 
          key={place.id} 
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">{place.name}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="mr-2 w-5 h-5" />
            <span>{place.type}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="mr-2 w-5 h-5" />
            <span>Best time: {place.bestTimeToVisit}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TouristPlacesCard;