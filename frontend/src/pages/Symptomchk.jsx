import React, { useState } from "react";
import axios from "axios";

const Symptomchk = () => {
  const BASE_URL = "http://localhost:5000/api/v1";

  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [description, setDescription] = useState("");
  const [precaution, setPrecaution] = useState([]);
  const [medications, setMedications] = useState([]);
  const [workout, setWorkout] = useState([]);
  const [diets, setDiets] = useState([]);
  const [disease, setDisease] = useState("");

  const [visibility, setVisibility] = useState({
    description: false,
    precaution: false,
    medications: false,
    workout: false,
    diets: false,
    disease: false,
  });

  const toggleVisibility = (key) => {
    setVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const parseStringifiedArray = (arr) => {
    try {
      if (Array.isArray(arr) && arr.length > 0) {
        return JSON.parse(arr[0].replace(/'/g, '"')); // Convert to valid JSON and parse
      }
      return [];
    } catch {
      return [];
    }
  };

  const handlePrediction = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    console.log(symptoms);

    const symptomsArray = symptoms
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s);

    console.log(symptomsArray);

    if (symptomsArray.length === 0) {
      setErrorMessage("Please enter at least one symptom.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/predict`, {
        symptoms: symptomsArray,
      });

      const data = response.data;
      console.log(data);
      console.log(data.disease);
      console.log(data.precautions);

      setDescription(data.description);
      setPrecaution((data.precautions || []).filter((p) => p && p !== "NaN"));
      setMedications(parseStringifiedArray(data.medications));
      setWorkout(data.workout || []);
      setDiets(parseStringifiedArray(data.diet));
      setDisease(data.disease);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to fetch prediction. Please try again later.");
    }

    setIsLoading(false);
  };

  const renderList = (items) => (
    <ul className="list-disc pl-6 text-gray-700">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );

  return (
    <section>
      <div className="px-4 mx-auto max-w-screen-md">
        <h2 className="heading text-center">Health Care Center</h2>
      </div>

      <div
        className="container my-4 w-[70%] mt-4"
        style={{
          background: "#18263b2b",
          color: "black",
          borderRadius: "15px",
          padding: "20px",
        }}
      >
        <form onSubmit={handlePrediction}>
          <div className="form-group">
            <label
              htmlFor="symptoms"
              className="font-bold text-3xl mr-2"
              style={{ color: "black" }}
            >
              Enter Symptoms (comma-separated):
            </label>
            <input
              type="text"
              className="p-3 rounded-2xl w-[60%] text-2xl font-semibold form-control"
              id="symptoms"
              name="symptoms"
              placeholder="e.g. headache, chest pain, nausea"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-primaryColor m-10 font-semibold text-2xl text-white p-2 w-[40%] align-middle ml-80 rounded-2xl"
            disabled={isLoading}
          >
            {isLoading ? "Predicting..." : "Predict"}
          </button>
        </form>
      </div>

      {errorMessage && (
        <p className="text-red-600 text-center">{errorMessage}</p>
      )}

      {description && (
        <div>
          <h1 className="text-center my-4 mt-4">Our AI System Results</h1>
          <div className="container">
            <div className="result-container">
              {[
                {
                  label: "Disease",
                  value: disease,
                  key: "disease",
                  bg: "#F39334",
                  isList: false,
                },
                {
                  label: "Description",
                  value: description,
                  key: "description",
                  bg: "#268AF3",
                  isList: false,
                },
                {
                  label: "Precautions",
                  value: precaution,
                  key: "precaution",
                  bg: "#F371F9",
                  isList: true,
                },
                {
                  label: "Medications",
                  value: medications,
                  key: "medications",
                  bg: "#F8576F",
                  isList: true,
                },
                {
                  label: "Workouts",
                  value: workout,
                  key: "workout",
                  bg: "#99F741",
                  isList: true,
                },
                {
                  label: "Diets",
                  value: diets,
                  key: "diets",
                  bg: "#E5E23D",
                  isList: true,
                },
              ].map(({ label, value, key, bg, isList }) => (
                <div key={key}>
                  <button
                    onClick={() => toggleVisibility(key)}
                    style={{
                      padding: "4px",
                      margin: "5px 40px 5px 0",
                      fontSize: "20px",
                      fontWeight: "bold",
                      width: "140px",
                      borderRadius: "5px",
                      background: bg,
                      color: "black",
                    }}
                  >
                    {label}
                  </button>
                  {visibility[key] &&
                    (isList ? (
                      renderList(value)
                    ) : (
                      <p className="mt-2">{value}</p>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Symptomchk;
