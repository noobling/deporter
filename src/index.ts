// src/index.ts
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Express } from "express";
import {
  addEventExpense,
  addEventMessage,
  addEventParticipants,
  createEvent,
  getEvent,
} from "./services/eventService";
import { createUser, getUser } from "./services/userService";
import { handler } from "./utils/handler";
import swagger from "./utils/swagger";
import { createMedia, getMedia } from "./services/mediaService";

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
app.get("/user/:id", handler(getUser));
app.post("/user", createUser);

// Event API
app.get("/event/:id", handler(getEvent));
app.post("/event", handler(createEvent));
app.post("/event/:id/expense", handler(addEventExpense));
app.post("/event/:id/message", handler(addEventMessage));
app.post("/event/:id/participants", handler(addEventParticipants));

// Media API
app.post("/media", handler(createMedia));
app.get("/media/:id", handler(getMedia));

swagger(app);
/* Start the Express app and listen
 for incoming requests on the specified port */
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
