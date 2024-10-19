import React, { useEffect, useState } from "react";
import {
  BookOpenIcon,
  Bars3BottomRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  let Links = [
    { name: "Home", link: "/" },
    { name: "About", link: "/" },
  ];

  let [open, setOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("allData");
    localStorage.removeItem("currentStep");
    toast.success("User logged out ");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="shadow-md w-full fixed top-0 left-0">
      <div className="md:flex items-center justify-between bg-white py-4 md:px-10 px-7">
        <div className="font-bold text-2xl cursor-pointer flex items-center gap-1">
          <BookOpenIcon className="w-7 h-7 text-blue-600" />
          <span>Smart Route</span>
        </div>

        <div
          onClick={() => setOpen(!open)}
          className="absolute right-8 top-6 cursor-pointer md:hidden w-7 h-7"
        >
          {open ? <XMarkIcon /> : <Bars3BottomRightIcon />}
        </div>

        <ul
          className={`md:flex md:items-center md:pb-0 pb-12 absolute md:static bg-white md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all duration-500 ease-in ${
            open ? "top-12" : "top-[-490px]"
          }`}
        >
          {Links.map((link) => (
            <li className="md:ml-8 md:my-0 my-7 font-semibold">
              <a
                href={link.link}
                className="text-gray-800 hover:text-blue-400 duration-500"
              >
                {link.name}
              </a>
            </li>
          ))}
          <li className="md:ml-8 md:my-0 my-7 font-semibold">
            <span className="text-gray-800 hover:text-blue-400 duration-500">
              Welcome! {loggedInUser}
            </span>
          </li>
          <button
            className="btn bg-blue-600 text-white md:ml-8 font-semibold px-3 py-1 rounded duration-500 md:static"
            onClick={handleLogout}
          >
            Logout
          </button>
        </ul>
      </div>
    </div>
  );
};