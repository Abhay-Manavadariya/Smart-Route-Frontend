import React, { useState, useEffect, useCallback } from "react";
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
  const [speeds, setSpeeds] = useState([]);

  // Constants
  const EARTH_RADIUS = 6371000; // Earth's radius in meters
  const MIN_DISTANCE_THRESHOLD = 0.5; // 2 meters
  const MAX_SPEED_THRESHOLD = 139; // 139 m/s ≈ 500 km/h
  const UPDATE_INTERVAL = 1000; // 1 second
  const SPEED_BUFFER_SIZE = 5; // Number of speed readings to average

  useEffect(() => {
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const handleLocationError = (error) => {
    const errorMessages = {
      1: "Location permission denied",
      2: "Location information unavailable",
      3: "Location request timed out",
      default: "Unknown location error",
    };
    const message = errorMessages[error.code] || errorMessages.default;
    console.error(`Location error: ${message}`, error);
    setError(message);
    return message;
  };

  const smoothSpeed = useCallback(
    (newSpeed) => {
      // Ensure speed is in m/s
      const speedInMetersPerSecond = newSpeed || 0;

      setSpeeds((prevSpeeds) => {
        const updatedSpeeds = [...prevSpeeds, speedInMetersPerSecond].slice(
          -SPEED_BUFFER_SIZE
        );
        return updatedSpeeds;
      });

      return speeds.length > 0
        ? speeds.reduce((a, b) => a + b, 0) / speeds.length
        : speedInMetersPerSecond;
    },
    [speeds]
  );

  const haversineDistance = useCallback((loc1, loc2) => {
    // Input validation
    if (
      !loc1?.latitude ||
      !loc1?.longitude ||
      !loc2?.latitude ||
      !loc2?.longitude
    ) {
      console.error("Invalid location data provided");
      return 0;
    }

    // Check for identical coordinates
    if (loc1.latitude === loc2.latitude && loc1.longitude === loc2.longitude) {
      return 0;
    }

    // Convert latitude and longitude to radians
    const lat1Rad = loc1.latitude * (Math.PI / 180);
    const lat2Rad = loc2.latitude * (Math.PI / 180);
    const dLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
    const dLon = (loc2.longitude - loc1.longitude) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS * c;

    // Handle potential floating-point errors and minimum threshold
    if (distance < MIN_DISTANCE_THRESHOLD) {
      return 0;
    }

    return Number((distance / 1000).toFixed(6)); // Convert to kilometers
  }, []);

  const calculateTotalDistance = useCallback(
    (newLocation) => {
      if (locationHistory.length === 0) return;

      const lastLocation = locationHistory[locationHistory.length - 1];
      const distance = haversineDistance(lastLocation, newLocation);

      if (distance === 0) {
        console.warn(
          "Distance too small or coordinates identical; skipping update."
        );
        return;
      }

      // Validate speed to detect potential GPS jumps
      const timeElapsed =
        (newLocation.timestamp - lastLocation.timestamp) / 1000; // seconds

      if (timeElapsed <= 0) {
        console.warn("Invalid time difference; skipping speed calculation.");
        return;
      }

      const speedBetweenPoints = (distance * 1000) / timeElapsed; // meters per second

      if (speedBetweenPoints > MAX_SPEED_THRESHOLD) {
        console.warn("Unrealistic movement detected, skipping distance update");
        return;
      }

      setTotalDistance((prevDistance) => prevDistance + distance);
    },
    [locationHistory, haversineDistance]
  );

  const processLocation = useCallback(
    (position) => {
      const { latitude, longitude, speed } = position.coords;
      const timestamp = position.timestamp;

      const smoothedSpeed = smoothSpeed(speed === null ? 0 : speed);

      const newLocation = {
        latitude,
        longitude,
        timestamp,
        speed: smoothedSpeed,
      };

      setUserLocation(newLocation);
      setLocationHistory((prevHistory) => [...prevHistory, newLocation]);
      calculateTotalDistance(newLocation);
      setError(null);
    },
    [calculateTotalDistance, smoothSpeed]
  );

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    };

    navigator.geolocation.getCurrentPosition(
      processLocation,
      handleLocationError,
      options
    );

    const id = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        processLocation,
        handleLocationError,
        options
      );
    }, UPDATE_INTERVAL);

    setIntervalId(id);
  }, [processLocation]);

  const stopWatchingLocation = async () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);

      try {
        const data = {
          locationHistory: locationHistory.map((loc) => ({
            ...loc,
            speed: (loc.speed * 3.6).toFixed(2),
          })),
          pathId: localStorage.getItem("pathId"),
          userId: localStorage.getItem("user_id"),
          vehicleId: localStorage.getItem("vehicleId"),
          totalDistance: totalDistance.toFixed(2),
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
        toast.error(
          error.response?.data?.message || "An error occurred while saving data"
        );
      }
    }
  };

  return (
    <div className="flex justify-evenly border">
      <div className="flex flex-col p-6 col-start-6 w-full max-w-4xl">
        <div className="mb-3">
          <h3 className="text-base sm:text-xl md:text-2xl font-medium text-center">
            GPS Data Collection
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3">
          <button
            onClick={startWatchingLocation}
            disabled={intervalId !== null}
            className={`px-6 py-2 rounded-lg duration-200 ${
              intervalId !== null
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            Start Collecting Data
          </button>

          {intervalId !== null && (
            <button
              onClick={stopWatchingLocation}
              className="bg-red-600 text-white px-6 py-2 rounded-lg duration-200 hover:bg-red-700"
            >
              Stop Collecting Data
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col justify-center space-y-4">
          {userLocation && (
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="font-bold text-lg mb-2">Current Location</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold">Latitude:</span>
                  <span className="ml-2">
                    {userLocation.latitude.toFixed(6)}°
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Longitude:</span>
                  <span className="ml-2">
                    {userLocation.longitude.toFixed(6)}°
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Speed:</span>
                  <span className="ml-2">
                    {(userLocation.speed * 3.6).toFixed(1)} km/h
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Time:</span>
                  <span className="ml-2">
                    {new Date(userLocation.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-bold mb-2">Total Distance</h3>
            <p className="text-2xl font-semibold">
              {totalDistance.toFixed(2)} km
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-bold mb-2">Location History</h3>
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-64">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Latitude
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Longitude
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Speed (km/h)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {locationHistory.map((location, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {new Date(location.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {location.latitude.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {location.longitude.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {(location.speed * 3.6).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
