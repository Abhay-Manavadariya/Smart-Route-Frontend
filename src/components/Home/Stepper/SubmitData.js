import { toast } from "sonner";
import { baseUrl } from "../../../api/baseUrl";
import { SUBMIT_INFORMATION } from "../../../api/constApi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuthHeader } from "../../../api/helper";

const SubmitData = ({ allData, setAllData }) => {
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setAllData((prevData) => ({
      ...prevData,
      isSubmit: true,
    }));

    const missingFields = [];

    if (!allData.vehicleType) missingFields.push("Vehicle Type");
    if (!allData.vehicleNumber) missingFields.push("Vehicle Number");
    if (!allData.vehicleMass) missingFields.push("Vehicle Mass");
    if (
      !allData.currentLocation ||
      Object.keys(allData.currentLocation).length === 0
    )
      missingFields.push("Current Location");
    if (
      !allData.destinationLocation ||
      Object.keys(allData.destinationLocation).length === 0
    )
      missingFields.push("Destination Location");

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in the following fields: ${missingFields.join(", ")}`
      );
      setAllData((prevData) => ({
        ...prevData,
        isSubmit: false,
      }));
      return;
    }

    try {
      const header = getAuthHeader();
      const response = await axios.post(
        `${baseUrl}${SUBMIT_INFORMATION}`,
        allData,
        { headers: header }
      );

      const { pathId, vehicleId } = response.data;

      toast.success("All data submitted successfully!");
      localStorage.setItem("pathId", pathId);
      localStorage.setItem("vehicleId", vehicleId);
      localStorage.removeItem("allData");
      localStorage.removeItem("currentStep");

      navigate("/DataCollection");
    } catch (error) {
      toast.error(error["response"].data.message);
    } finally {
      // Reset isSubmit only if the submission process (API call) was attempted
      setAllData((prevData) => ({
        ...prevData,
        isSubmit: false,
      }));
    }
  };

  const handleCancel = () => {
    toast.info("Submission canceled");
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-6">
      <h2 className="text-2xl font-bold mb-4">Submit All Information</h2>
      <p className="text-gray-600 mb-8 text-center text-2xl">
        Are you sure you want to submit all the data?
      </p>

      <div className="flex space-x-4">
        <button
          className="font-semibold text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
          style={{ backgroundColor: "rgb(58, 99, 108)" }}
          onClick={handleCancel}
        >
          No
        </button>
        <button
          className="font-semibold text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
          style={{ backgroundColor: "rgb(36 125 198)" }}
          onClick={handleSubmit}
        >
          Yes
        </button>
      </div>
    </div>
  );
};

export default SubmitData;
