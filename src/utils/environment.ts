import dotenv from "dotenv";

dotenv.config();

const environment = {
  port: process.env.PORT || 3000,
  mongodb_uri: process.env.MONGODB_URI!!,
  aws_secret: process.env.AWS_SECRET!!,
  aws_key: process.env.AWS_KEY!!,
  aws_bucket: process.env.AWS_BUCKET!!,
  bypass_auth_user_id: process.env.BYPASS_AUTH_USER_ID, // Only for testing should this exist
  mongo_db_name: process.env.MONGO_DB_NAME!!,
  redis_url: process.env.REDIS_URL!!,
  admins: process.env.ADMINS!!?.split(",") ?? [],
  google_api_key: process.env.GOOGLE_API_KEY!!,
  supabase_url: process.env.SUPABASE_URL!!,
  supabase_key: process.env.SUPABASE_KEY!!,
};

Object.keys(environment).forEach((key) => {
  // @ts-ignore
  if (!environment[key] && key !== "bypass_auth_user_id") {
    console.error(`No ${key}. Set ${key} environment variable.`);
    process.exit(1);
  }
});

export default environment;
