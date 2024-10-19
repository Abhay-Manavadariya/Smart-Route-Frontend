import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
  const navigate = useNavigate();

  localStorage.clear();
  toast.success("User logged out ");
  setTimeout(() => {
    navigate("/login");
  }, 1000);
};
