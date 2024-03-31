// src/index.ts
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import {
  addEventExpense,
  addEventMessage,
  addEventParticipants,
  createEvent,
  createUser,
  getEvent,
  getUser,
} from "./api";
import swagger from "./utils/swagger";
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

// User API
app.get("/user/:id", getUser);
app.post("/user", createUser);

// Event API
app.get("/event/:id", getEvent);
app.post("/event", createEvent);
app.post("/event/:id/expense", addEventExpense);
app.post("/event/:id/message", addEventMessage);
app.post("/event/:id/participants", addEventParticipants);

swagger(app);
/* Start the Express app and listen
 for incoming requests on the specified port */
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
