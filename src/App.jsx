import React, { useState } from "react";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [value, setValue] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const surpriseOptions = [
    "Is it cute?",
    "How is it adorable?",
    "How is it funny?",
    "Is it beautiful to you?",
    "Is it cool to the touch?",
    "Does it act silly?",
    "Does it taste sweet?",
  ];

  const surprise = () => {
    const randomIndex = Math.floor(Math.random() * surpriseOptions.length);
    const randomOption = surpriseOptions[randomIndex];
    setValue(randomOption);
  };

  const uplaodImage = async (event) => {
    const formData = new FormData();
    formData.append("file", event.target.files[0]);
    setImage(event.target.files[0]);
    event.target.value = null;
    try {
      const options = {
        method: "POST",
        body: formData,
      };
      const response = await fetch("http://localhost:8000/upload", options);
      const data = response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
      setError("Error uploading image: " + error + ". Please try again!");
    }
  };

  const analyzeImage = async () => {
    setResponse("");
    setError("");
    if (!image) {
      setError("Please upload an image first");
      setValue("");
      return;
    }
    try {
      setIsAnalyzing(true);
      const options = {
        method: "POST",
        body: JSON.stringify({
          message: value,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await fetch("http://localhost:8000/analyze", options);
      const text = await response.text();
      console.log(text);
      setResponse(text);
    } catch (error) {
      console.log(error);
      setError(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clear = () => {
    setImage(null);
    setValue("");
    setResponse("");
    setError("");
    setIsAnalyzing(false);
  };

  return (
    <div className="app">
      <section className="search-section">
        <div className={`image-container ${image ? "has-image" : ""}`}>
          {image ? (
            <img src={URL.createObjectURL(image)} alt="file preview" />
          ) : (
            <div className="placeholder">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5Z"
                  stroke="#94A3B8"
                  strokeWidth="2"
                />
                <path
                  d="M4 16L8 12L12 16L20 8"
                  stroke="#94A3B8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="9" r="2" stroke="#94A3B8" strokeWidth="2" />
              </svg>
              <p>Click or drag image here</p>
            </div>
          )}
        </div>
      </section>
      <section className="info-section">
        <p className="extra-info">
          <span>Ask The A.I Your Question, Please</span>
        </p>
        <p>
          <span>
            <label htmlFor="files">Upload Image</label>
            <input
              onChange={uplaodImage}
              id="files"
              accept="image/*"
              type="file"
            />
          </span>
        </p>
        <p>
          About This Image
          <button className="surprise" onClick={surprise}>
            I Feel Lucky
          </button>
        </p>
        <div className="question">
          <input
            value={value}
            placeholder="Type Your Question"
            onChange={(event) => setValue(event.target.value)}
            type="text"
          />
          {!response && !error && !isAnalyzing && (
            <button onClick={analyzeImage}>Ask The A.I.</button>
          )}
          {(response || error) && !isAnalyzing && (
            <button onClick={clear}>Clear</button>
          )}
        </div>
        {isAnalyzing && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-bar-inner"></div>
            </div>
            <p className="analyzing-text">Analyzing image...</p>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        {response && <p className="response">{response}</p>}
      </section>
    </div>
  );
}

export default App;
