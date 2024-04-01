import AWS from "aws-sdk";
import environment from "./environment";

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
