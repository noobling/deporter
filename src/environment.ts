import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error(
    "No mongo connection string. Set MONGODB_URI environment variable."
  );
  process.exit(1);
}

export default {
  port: process.env.PORT || 3000,
  mongodb_uri: process.env.MONGODB_URI,
};
