import "./App.css";
import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deployed, setDeployed] = useState(true);

  const BACKEND_UPLOAD_URL = "http://localhost:8080";

  const uploadGithub = async () => {
    console.log(url);

    setUploading(true);
    const res = await fetch(`${BACKEND_UPLOAD_URL}/deploy`, {
      method : "POST",
      headers : {
        "Content-Type" : "application/json"
      },
      body : JSON.stringify({
        "repoURL": url
      })
    });

    const data = await res.json();

    setUploadId(data?.id);
    setUploading(false);

    // polling to get the status of the request
    const interval = setInterval(async () => {
      const response = await fetch(
        `${BACKEND_UPLOAD_URL}/status?id=${data?.id}`
      );

      const res_data = await response.json();

      if (res_data?.status === "deployed") {
        clearInterval(interval);
        setDeployed(true);
      }
    }, 3000);
  };
  return (
    <div className="App">
      <div className="container">
        <div className="title-info">
          <p className="title">Deploy your Github Repository</p>
          <p className="info">
            Enter the URL of your Github Repository to deploy it
          </p>
        </div>

        <div className="form">
          <div>
            <label className="label">Github Repository URL</label>
          </div>
          <div>
            <input
              className="input"
              type="text"
              placeholder="https://github.com/username/repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            className="upload"
            onClick={() => uploadGithub()}
            disabled={uploadId !== "" || uploading}
          >
            {uploadId ? `Deploying` : uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      {deployed && (
        <div className="container">
          <div className="title-info">
            <p className="title">Deployment Status</p>
            <p className="info">Your Website is successfully deployed!</p>
          </div>

          <div className="form">
            <div>
              <label className="label">Deployed URL</label>
            </div>
            <div>
              <input
                className="input"
                type="text"
                value={`https://localhost:3001/${uploadId}/index.html`}
              />
            </div>
            <button className="visit">
              <a
                href={`https://localhost:3001/${uploadId}/index.html`}
                target="_blank"
                className="link"
              >
                Visit Website
              </a>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
