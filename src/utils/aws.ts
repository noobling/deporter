import AWS from "aws-sdk";
import environment from "./environment";
import axios from "axios";

// Set AWS credentials
AWS.config.update({
  accessKeyId: environment.aws_key,
  secretAccessKey: environment.aws_secret,
  region: "ap-southeast-2",
});

const s3 = new AWS.S3();

export function getSignedUrl(key: string) {
  return s3.getSignedUrl("putObject", {
    Bucket: environment.aws_bucket,
    Key: key,
  });
}

export function getDownloadUrl(key: string) {
  return s3.getSignedUrl("getObject", {
    Bucket: environment.aws_bucket,
    Key: key,
  });
}

export async function uploadToS3(url: string, key: string) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "arraybuffer",
  });

  const params = {
    Bucket: environment.aws_bucket,
    Key: key,
    Body: Buffer.from(response.data, "binary"),
    ContentType: response.headers["content-type"],
  };

  return s3.upload(params).promise();
}
