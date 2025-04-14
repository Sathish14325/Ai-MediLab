import { useEffect, useState } from "react";
// import { token } from "../config.js";

const useFetchData = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  //console.log("Token in useFetchData:", token);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("No token found");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Something went wrong 🤢");
        }

        setData(result.data || result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, token]);

  return { data, loading, error };
};

export default useFetchData;
