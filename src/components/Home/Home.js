import React from "react";
import { Navbar2 } from "../../common/Navbar2";
import Stepper from "./Stepper/Stepper";

export const Home = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col m-auto">
        <Stepper />
      </div>
    </>
  );
};
