import { useState } from "react";

function App() {
  const [image, setImage] = useState(null);
  const [value, setValue] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

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
    if (!image) {
      setError("Please upload an image first");
      setValue("");
      return;
    }
    try {
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
    }
  };

  const clear = () => {
    setImage(null);
    setValue("");
    setResponse("");
    setError("");
  };

  return (
    <div className="app">
      <section className="search-section">
        <div className="image-container">
          {image && <img src={URL.createObjectURL(image)} alt="file preview" />}
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
          {!response && !error && (
            <button onClick={analyzeImage}>Ask The A.I.</button>
          )}
          {(response || error) && <button onClick={clear}>Clear</button>}
        </div>
        {error && <p className="error">{error}</p>}
        {response && <p className="response">{response}</p>}
      </section>
    </div>
  );
}

export default App;
