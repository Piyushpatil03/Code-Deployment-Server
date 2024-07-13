import { S3 } from "aws-sdk";
import fs from "fs";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

const s3 = new S3({
    accessKeyId : process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY
})

export const uploadFile = async (fileName : string, localFilePath : string) => {
    const fileContent = fs.readFileSync(localFilePath);

    const response = await s3.upload({
        Body : fileContent,
        Bucket : "vercel-code-project",
        Key: fileName
    }).promise();

    console.log(response);
}

// uploadFile('output/9idv5', path.join(__dirname, 'output/9idv5'))