import React from "react";
import Plot from "react-plotly.js";

export const Map = ({ data }) => {
  const latitudes = data.map((item) => item.latitude);
  const longitudes = data.map((item) => item.longitude);
  const kineticEnergies = data.map((item) => item.kineticEnergy);

  return (
    <>
      <div className="flex p-6">
        <Plot
          data={[
            {
              x: longitudes,
              y: latitudes,
              z: kineticEnergies,
              mode: "markers+lines",
              marker: {
                size: 8,
                color: "blue",
              },
              line: {
                color: "blue",
                width: 3,
              },
              type: "scatter3d",
              name: "Trajectory",
            },
          ]}
          style={{
            border: "2px solid black",
          }}
          layout={{
            title: "Kinetic Energy Data Visualization",
            scene: {
              xaxis: { title: "Longitude" },
              yaxis: { title: "Latitude" },
              zaxis: { title: "Kinetic Energy (J)" },
              aspectmode: "auto",
            },
            width: 750,
            height: 600,
            legend: {
              x: 1,
              y: 1,
            },
          }}
        />
      </div>
    </>
  );
};
