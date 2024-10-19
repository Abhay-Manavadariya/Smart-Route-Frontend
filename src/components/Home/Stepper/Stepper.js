import React, { useState, useEffect } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import VehicleInfo from "./VehicleInfo";
import LocationDataInfo from "./LocationData";
import SubmitData from "./SubmitData";
import { GoogleMapsProvider } from "../../../context/GoogleMapsContext";

const Stepper = () => {
  const steps = [
    { label: "Vehicle Info" },
    { label: "Location" },
    { label: "Submit" },
  ];

  // Initialize state from localStorage
  const initialStep = Number(localStorage.getItem("currentStep")) || 1;
  const initialData = JSON.parse(localStorage.getItem("allData")) || {
    vehicleType: "",
    vehicleNumber: "",
    vehicleMass: "",
    currentLocation: null,
    destinationLocation: null,
  };

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [allData, setAllData] = useState(initialData);

  // Save currentStep and allData to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("currentStep", currentStep);
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem("allData", JSON.stringify(allData));
  }, [allData]);

  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        return <VehicleInfo allData={allData} setAllData={setAllData} />;
      case 2:
        return <LocationDataInfo allData={allData} setAllData={setAllData} />;
      case 3:
        return <SubmitData allData={allData} />;
      default:
        return null;
    }
  };

  const handleNext = () => {
    setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
  };

  const handleBack = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col md:flex-row bg-gray-100 mt-10">
        <div className="md:w-1/4 bg-blue-500 p-8 text-white">
          <ul className="flex justify-between md:flex-col md:space-y-6 space-y-0 space-x-4 md:space-x-0 relative w-full">
            {steps.map((step, index) => (
              <li
                key={index}
                className="flex items-center md:space-x-2 space-x-4 relative w-full"
              >
                <div className="flex items-center relative w-full">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep > index + 1
                        ? "bg-blue-300"
                        : currentStep === index + 1
                        ? "bg-blue-800"
                        : "bg-blue-300"
                    }`}
                  >
                    {currentStep > index + 1 ? (
                      <CheckIcon className="w-5 h-5 text-white" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  {index < steps.length - 1 && (
                    <div className="block md:hidden flex-grow h-0.5 bg-white mx-2"></div>
                  )}
                </div>

                <div className="md:block hidden text-left">
                  <p
                    className={`${
                      currentStep === index + 1
                        ? "font-bold text-white"
                        : "text-blue-200"
                    }`}
                    style={{ minWidth: "150px" }}
                  >
                    {step.label}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:w-3/4 w-full bg-white p-6 md:p-10 rounded-lg border border-gray-200 shadow-lg m-4 md:m-8">
          <GoogleMapsProvider>
            {renderStepContent(currentStep)}
          </GoogleMapsProvider>

          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`${
                currentStep === 1 ? "bg-gray-300" : "bg-blue-500"
              } text-white px-4 py-2 rounded`}
            >
              Go back
            </button>

            <button
              onClick={handleNext}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {currentStep === steps.length ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stepper;
