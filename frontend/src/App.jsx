import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setFile(selected || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus("error");
      setMessage("Please select a CSV file.");
      return;
    }

    if (!email) {
      setStatus("error");
      setMessage("Please enter a recipient email.");
      return;
    }

    setStatus("loading");
    setMessage("");
    setSummary("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", email);

      const apiBase = import.meta.env.VITE_API_BASE_URL || "";
      const apiKey = import.meta.env.VITE_API_KEY || "";
      const response = await axios.post(`${apiBase}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-api-key": apiKey
        }
      });

      setStatus("success");
      setMessage(response.data.message || "Summary generated and email sent.");
      setSummary(response.data.summary || "");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(
        err.response?.data?.error ||
          "Something went wrong while generating the summary."
      );
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Sales Insight Automator</h1>
        <p>
          Upload your quarterly sales file and get an AI-generated executive
          summary sent directly to your inbox.
        </p>
      </header>

      <main className="card">
        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Sales data file (.csv)</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={status === "loading"}
            />
          </label>

          <label className="field">
            <span>Recipient email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={status === "loading"}
              required
            />
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Generating summary..." : "Send summary"}
          </button>
        </form>

        {status === "loading" && (
          <div className="status loading">Processing your file...</div>
        )}
        {status === "success" && (
          <div className="status success">
            {message}
            {summary && (
              <div className="summary-preview">
                <h2>Summary preview</h2>
                <p>{summary}</p>
              </div>
            )}
          </div>
        )}
        {status === "error" && <div className="status error">{message}</div>}
      </main>

      <footer className="app-footer">
        <a href="/docs" target="_blank" rel="noreferrer">
          View API docs (Swagger)
        </a>
      </footer>
    </div>
  );
};

export default App;

