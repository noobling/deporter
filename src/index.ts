// src/index.ts
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import {
  addEventExpense,
  createEvent,
  createUser,
  getEvent,
  getUser,
} from "./api";
import swagger from "./swagger";
import bodyParser from "body-parser";

/*
 * Load up and parse configuration details from
 * the `.env` file to the `process.env`
 * object of Node.js
 */
dotenv.config();

/*
 * Create an Express application and get the
 * value of the PORT environment variable
 * from the `process.env`
 */
const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Public healthcheck endpoint
app.get("/", async (req: Request, res: Response) => {
  res.send("Deport them back 🚢");
});

// User API
app.get("/user/:id", getUser);
app.post("/user", createUser);

// Event API
app.get("/event/:id", getEvent);
app.post("/event", createEvent);
app.post("/event/:id/expense", addEventExpense);
app.post("/event/:id/message");
app.post("/event/:id/participant");

swagger(app);
/* Start the Express app and listen
 for incoming requests on the specified port */
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
