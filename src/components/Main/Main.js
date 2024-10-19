import { Navbar } from "../../common/Navbar";
import { DataCollection } from "./DataCollection/DataCollection";
import { Map } from "./Maps/Map";

export const Main = () => {
  return (
    <>
      <div className="flex flex-col lg:flex-row items-center justify-evenly mt-10 space-y-6 lg:space-y-0 lg:space-x-6 p-4 lg:p-8">
        <div className="border-2 rounded-lg w-full lg:w-auto p-4">
          <DataCollection />
        </div>
        <div className="border-2 rounded-lg w-full lg:w-auto p-4">
          <Map />
        </div>
      </div>
    </>
  );
};
