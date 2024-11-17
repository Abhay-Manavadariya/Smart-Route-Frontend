import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { baseUrl } from "../../../api/baseUrl";
import { DATA_COLLECTION } from "../../../api/constApi";
import { getAuthHeader } from "../../../api/helper";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const DataCollection = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [error, setError] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    // Cleanup the interval when the component unmounts
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const haversineDistance = (loc1, loc2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
    const dLon = (loc2.longitude - loc1.longitude) * (Math.PI / 180);
    const lat1 = loc1.latitude * (Math.PI / 180);
    const lat2 = loc2.latitude * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const calculateTotalDistance = (newLocation) => {
    if (locationHistory.length > 0) {
      const lastLocation = locationHistory[locationHistory.length - 1];
      const distance = haversineDistance(lastLocation, newLocation);
      setTotalDistance((prevDistance) => prevDistance + distance);
    }
  };

  const startWatchingLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, speed } = position.coords;
          const timestamp = position.timestamp;
          const newLocation = {
            latitude,
            longitude,
            timestamp,
            speed: speed === null ? 0 : speed,
          };

          setUserLocation(newLocation);
          setLocationHistory((prevHistory) => [...prevHistory, newLocation]);
          calculateTotalDistance(newLocation);
          setError(null);

          // Start collecting data every 1000 milliseconds
          const id = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude, speed } = position.coords;
                const timestamp = position.timestamp;
                const updatedLocation = {
                  latitude,
                  longitude,
                  timestamp,
                  speed: speed === null ? 0 : speed,
                };
                setUserLocation(updatedLocation);
                setLocationHistory((prevHistory) => [
                  ...prevHistory,
                  updatedLocation,
                ]);
                calculateTotalDistance(updatedLocation);
              },
              (error) => {
                console.error("Error updating location:", error);
                setError("Failed to update user location. Please try again.");
              },
              { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
            );
          }, 1000);

          setIntervalId(id);
        },
        (error) => {
          console.error("Error getting initial location:", error);
          setError("Failed to get initial location. Please try again.");
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setError("Geolocation is not supported by this browser.");
    }
  };

  const stopWatchingLocation = async () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);

      try {
        const data = {
          locationHistory: locationHistory,
          pathId: localStorage.getItem("pathId"),
          userId: localStorage.getItem("user_id"),
          vehicleId: localStorage.getItem("vehicleId"),
          totalDistance: totalDistance,
        };

        const header = getAuthHeader();
        const response = await axios.post(
          `${baseUrl}${DATA_COLLECTION}`,
          data,
          {
            headers: header,
          }
        );

        toast.success(response.data.message);
        localStorage.removeItem("pathId");
        localStorage.removeItem("vehicleId");
        navigate("/");
      } catch (error) {
        toast.error(error["response"].data.message);
      }
    }
  };

  return (
    <>
      <div className="flex justify-evenly border">
        <div className="flex flex-col p-6 col-start-6">
          <div className="mb-3">
            <h3 className="text-base sm:text-xl md:text-2xl font-medium text-center">
              GPS Data
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3">
            <button
              size="lg"
              onClick={startWatchingLocation}
              className="bg-black text-white px-6 py-2 rounded-lg duration-200"
            >
              Start Collecting Data
            </button>
            {intervalId !== null && (
              <button
                size="lg"
                onClick={stopWatchingLocation}
                className="bg-black text-white px-6 py-2 rounded-lg duration-200"
              >
                Stop Collecting Data
              </button>
            )}
          </div>

          <div className="flex flex-col justify-center space-y-4">
            {userLocation ? (
              <div className="text-sm sm:text-base">
                <h2 className="font-bold">Current User Location</h2>
                <p>
                  <span className="font-bold">Latitude:</span>{" "}
                  {userLocation.latitude}
                </p>
                <p>
                  <span className="font-bold">Longitude:</span>{" "}
                  {userLocation.longitude}
                </p>
                <p>
                  <span className="font-bold">Timestamp:</span>{" "}
                  {new Date(userLocation.timestamp).toLocaleString()}
                </p>
                <p>
                  <span className="font-bold">Speed:</span>{" "}
                  {userLocation.speed !== null
                    ? (userLocation.speed * 3.6).toFixed(2)
                    : "Speed not available"}{" "}
                  km/h
                </p>
              </div>
            ) : (
              error && <p className="text-red-500">{error}</p>
            )}

            <h3 className="text-base sm:text-xl md:text-2xl font-medium mt-4">
              Location History
            </h3>

            <div className="overflow-x-auto">
              {/* Set fixed height and enable scrolling */}
              <div className="overflow-y-auto max-h-64">
                <table className="table-auto border-collapse border border-gray-400 mt-2 w-full text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">
                        Latitude
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Longitude
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Timestamp
                      </th>
                      <th className="border border-gray-300 px-4 py-2">
                        Speed (km/h)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationHistory.map((location, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">
                          {location.latitude}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {location.longitude}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {new Date(location.timestamp).toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {location.speed !== null
                            ? (location.speed * 3.6).toFixed(2)
                            : "0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-base sm:text-xl md:text-2xl font-medium">
                Total Distance
              </h3>
              <p className="text-sm sm:text-base">
                {totalDistance.toFixed(2)} km
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
