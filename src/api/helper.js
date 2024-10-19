export const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No token found in localStorage");
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};
