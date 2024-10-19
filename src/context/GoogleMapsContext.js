import React, { createContext, useState, useEffect, useContext } from "react";

// Create the context
const GoogleMapsContext = createContext();

// Helper function to load the Google Maps API script
const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve(); // If script is already loaded, resolve immediately
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API}&libraries=places`;
      script.async = true;
      script.defer = true; // Add defer to optimize script loading

      script.onload = () => {
        resolve(); // Resolve the promise when the script loads
      };

      script.onerror = () => {
        reject("Google Maps API failed to load"); // Reject the promise on error
      };

      document.head.appendChild(script);
    }
  });
};

// Google Maps Provider component
export const GoogleMapsProvider = ({ children }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const loadScript = async () => {
      try {
        await loadGoogleMapsScript(); // Await script loading
        setIsScriptLoaded(true); // Set state to true once the script is loaded
      } catch (error) {
        console.error(error); // Log error if script fails to load
      }
    };

    loadScript(); // Invoke the async function

    return () => {
      if (window.google) {
        const scripts = document.querySelectorAll(
          'script[src*="maps.googleapis"]'
        );
        scripts.forEach((script) => {
          script.remove(); // Clean up script from DOM if needed
        });
      }
    };
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isScriptLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

// Custom hook to use Google Maps Context
export const useGoogleMaps = () => useContext(GoogleMapsContext);
