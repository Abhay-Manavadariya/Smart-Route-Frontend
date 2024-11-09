import React from "react";
import Plot from "react-plotly.js";

export const Map = ({ data }) => {
  const latitudes = data.map((item) => item.latitude);
  const longitudes = data.map((item) => item.longitude);
  const kineticEnergies = data.map((item) => item.kineticEnergy);

  return (
    <>
      <div className="flex p-6">
        {/* <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3667.49726418951!2d72.62634057505684!3d23.188541910114694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c2a3c9618d2c5%3A0xc54de484f986b1fa!2sDA-IICT!5e0!3m2!1sen!2sin!4v1728931664051!5m2!1sen!2sin"
          width="600"
          height="450"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe> */}
        <Plot
          data={[
            {
              x: longitudes, // Your longitude data array
              y: latitudes, // Your latitude data array
              z: kineticEnergies, // Your kinetic energy data array
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
          layout={{
            title: "Kinetic Energy Data Visualization",
            scene: {
              xaxis: { title: "Longitude" },
              yaxis: { title: "Latitude" },
              zaxis: { title: "Kinetic Energy (J)" },
              aspectmode: "auto",
             
            },
            width: 650, // Adjust the width of the graph
            height: 500, // Adjust the height of the graph
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
