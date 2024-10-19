import React, { useCallback } from "react";
import * as Yup from "yup";
import { baseUrl } from "../../api/baseUrl";
import { SIGNUP } from "../../api/constApi";
import { toast } from "sonner";
import { useFormik } from "formik";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Signup = () => {
  const navigate = useNavigate();

  const signUpInitialState = {
    name: "",
    email: "",
    password: "",
  };

  const signUpValidationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "Name must be atLeast 6 character long!")
      .max(40, "Too Long!")
      .required("Name is required*"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email address is required*"),
    password: Yup.string()
      .min(6, "Password must be atLeast 6 character long!")
      .required("Password is required*"),
  });

  const handleSignUp = async (values) => {
    try {
      const payload = { ...values };
      const response = await axios.post(`${baseUrl}${SIGNUP}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data?.success) {
        toast.success(response.data.message);
        formikSignUp.resetForm();
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        toast.error(response.data.message + " ❌");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const formikSignUp = useFormik({
    initialValues: signUpInitialState,
    validationSchema: signUpValidationSchema,
    onSubmit: handleSignUp,
  });

  const setSignUpInputValue = useCallback(
    (key, value) =>
      formikSignUp.setValues({
        ...formikSignUp.values,
        [key]: value,
      }),
    [formikSignUp]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-2">
          Sign Up into SmartRoute
        </h2>
        <p className="text-gray-600 text-center mb-6">Welcome! Please Signup</p>

        <form onSubmit={formikSignUp.handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
              onChange={(e) => setSignUpInputValue("email", e.target.value)}
              value={formikSignUp.values.email}
              required
            />
            {formikSignUp.errors.email && (
              <small className="text-red-500 text-xs">
                {formikSignUp.errors.email}
              </small>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your name"
              onChange={(e) => setSignUpInputValue("name", e.target.value)}
              value={formikSignUp.values.name}
              required
            />
            {formikSignUp.errors.name && (
              <small className="text-red-500 text-xs">
                {formikSignUp.errors.name}
              </small>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
              onChange={(e) => setSignUpInputValue("password", e.target.value)}
              value={formikSignUp.values.password}
              required
            />
            {formikSignUp.errors.password && (
              <small className="text-red-500 text-xs">
                {formikSignUp.errors.password}
              </small>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};
