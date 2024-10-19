import React, { useState } from "react";

const VehicleInfo = ({ allData, setAllData }) => {
  const massMap = {
    car: 1500,
    bike: 200,
  };

  const handleVehicleTypeChange = (e) => {
    const selectedType = e.target.value;
    setAllData((prev) => ({
      ...prev,
      vehicleType: selectedType,
      vehicleMass: massMap[selectedType] || "",
    }));
  };

  const handleVehicleNumberChange = (e) => {
    const vehicleNumber = e.target.value;
    setAllData((prev) => ({
      ...prev,
      vehicleNumber,
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Vehicle Info</h2>
      <p className="text-gray-600 mb-8">
        Please provide your vehicle type and vehicle number.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700">Vehicle Type</label>
          <select
            value={allData.vehicleType}
            onChange={handleVehicleTypeChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="">Select a vehicle type</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700">Vehicle Number</label>
          <input
            type="text"
            value={allData.vehicleNumber}
            onChange={handleVehicleNumberChange}
            placeholder="e.g. XX88 XY8888"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">Mass</label>
          <input
            type="text"
            value={allData.vehicleMass}
            readOnly
            placeholder="e.g. 1500 kg"
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleInfo;
