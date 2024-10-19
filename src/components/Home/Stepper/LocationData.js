import React, { useState, useEffect, useCallback } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGoogleMaps } from "../../../context/GoogleMapsContext";

// Memoized PlacesAutocomplete to avoid re-renders
const PlacesAutocomplete = React.memo(({ setLocation, initialLocation }) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  useEffect(() => {
    if (initialLocation) {
      const fetchAddress = async () => {
        try {
          const results = await getGeocode({ location: initialLocation });
          const address = results[0].formatted_address;
          setValue(address);
        } catch (error) {
          console.error("Error fetching address:", error);
        }
      };
      fetchAddress();
    }
  }, [initialLocation, setValue]);

  const handleSelect = useCallback(
    async (address) => {
      setValue(address, false);
      clearSuggestions();

      try {
        const results = await getGeocode({ address });
        const { lat, lng } = await getLatLng(results[0]);
        setLocation({ lat, lng });
      } catch (error) {
        console.error("Error fetching geocode:", error);
      }
    },
    [setValue, clearSuggestions, setLocation]
  );

  return (
    <Combobox onSelect={handleSelect}>
      <ComboboxInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        className="w-full px-4 py-2 border rounded-lg"
        placeholder="Search an address"
      />
      <ComboboxPopover className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto z-10">
        <ComboboxList>
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
});

const LocationDataInfo = ({ allData, setAllData }) => {
  const { isScriptLoaded } = useGoogleMaps(); // Get script loaded status from context

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setAllData((prevData) => ({
            ...prevData,
            currentLocation: { lat: latitude, lng: longitude },
          }));
        },
        (error) => console.error("Error getting current position: ", error)
      );
    }
  }, [setAllData]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Location Info</h2>
      <p className="text-gray-600 mb-8">
        Please provide your starting and ending location points.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700">Current Location</label>
          {isScriptLoaded && allData.currentLocation ? (
            <PlacesAutocomplete
              setLocation={(location) =>
                setAllData((prevData) => ({
                  ...prevData,
                  currentLocation: location,
                }))
              }
              initialLocation={allData.currentLocation}
            />
          ) : (
            <Skeleton height={30} />
          )}
        </div>

        <div>
          <label className="block text-gray-700">Choose Destination</label>
          {isScriptLoaded ? (
            <PlacesAutocomplete
              setLocation={(location) =>
                setAllData((prevData) => ({
                  ...prevData,
                  destinationLocation: location,
                }))
              }
              initialLocation={allData.destinationLocation}
            />
          ) : (
            <Skeleton />
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDataInfo;
