import React, { useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "sonner";
import { baseUrl } from "../../api/baseUrl";
import { LOGIN } from "../../api/constApi";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();

  const loginInitialState = {
    email: "",
    password: "",
  };

  const loginValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email address is required*"),
    password: Yup.string().required("Password is required*"),
  });

  const handleLogin = async (values) => {
    try {
      const payload = { ...values };
      const response = await axios.post(`${baseUrl}${LOGIN}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { success, message, jwtToken, name, id } = response.data;
      if (success) {
        toast.success(message);
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("user_name", name);
        localStorage.setItem("user_id", id);
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        toast.error(message + " ❌");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const formikLogin = useFormik({
    initialValues: loginInitialState,
    validationSchema: loginValidationSchema,
    onSubmit: handleLogin,
  });

  const setLoginInputValue = useCallback(
    (key, value) =>
      formikLogin.setValues({
        ...formikLogin.values,
        [key]: value,
      }),
    [formikLogin]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-2">
          Sign In into SmartRoute
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Welcome back! Please sign in to continue
        </p>

        <form onSubmit={formikLogin.handleSubmit}>
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
              onChange={(e) => setLoginInputValue("email", e.target.value)}
              value={formikLogin.values.email}
              required
            />
            {formikLogin.errors.email && (
              <small className="text-red-500 text-xs">
                {formikLogin.errors.email}
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
              onChange={(e) => setLoginInputValue("password", e.target.value)}
              value={formikLogin.values.password}
              required
            />
            {formikLogin.errors.password && (
              <small className="text-red-500 text-xs">
                {formikLogin.errors.password}
              </small>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};
