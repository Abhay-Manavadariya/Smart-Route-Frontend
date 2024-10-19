import { useEffect } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import "./App.css";
import { Login } from "./components/Authentication/login";
import { Logout } from "./components/Authentication/logout";
import { Signup } from "./components/Authentication/signup";
import RefreshHandler from "./RefreshHandler";
import { Home } from "./components/Home/Home";
import { Main } from "./components/Main/Main";
import { useState } from "react";
import { Navbar2 } from "./common/Navbar2";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
      {isAuthenticated && <Navbar2 />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/DataCollection" element={<Main />} />
      </Routes>
    </div>
  );
}

export default App;
