import { MongoClient, ServerApiVersion } from "mongodb";
import environment from "../utils/environment";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(environment.mongodb_uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const DB_NAME = environment.mongo_db_name;
const ANALYTICS_DB_NAME = "analytics";

const db = client.db(DB_NAME);
const analyticsDb = client.db(ANALYTICS_DB_NAME);

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db(DB_NAME).command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch {
    // Ensures that the client will pclose when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

export default db;

export { analyticsDb };
