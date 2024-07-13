import express from "express";
import { S3 } from "aws-sdk";
import dotenv from "dotenv";
import session from "express-session";

const app = express();
app.use(express.json());

// Extend the session data type
declare module 'express-session' {
    interface SessionData {
      id_cookie: string;
    }
  }

dotenv.config();

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Configure session middleware
app.use(
  session({
    secret: "SAVE-ID",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.get("/*", async (req, res) => {
  const host = req.path;

  if (host !== "/favicon.ico") {
    
    let id = req.session.id_cookie;
    var filePath = host.slice(1);

    if (!id) {
      const segments = host.split("/");
      id = segments[1];
      req.session.id_cookie = id;
      var filePath = host.slice(id.length + 2);
    }

    console.log(`dist/${id}/${filePath}`);

    const contents = await s3
      .getObject({
        Bucket: "vercel-code-project",
        Key: `dist/${id}/${filePath}`,
      })
      .promise();

    const type = host.endsWith("html") ? "text/html" : host.endsWith("css") ? "text/css" : "application/javascript";
    res.set("Content-Type", type);

    res.send(contents.Body);

    // Removing the ID from session
    setTimeout(() => {
        req.session.destroy(() => {
            console.log("Session Destroyed");
        });
      }, 15 * 1000);
  }
});

app.listen(3001, () => {
  console.log("App is listening on PORT 3001");
});
