// src/index.ts
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Express } from "express";
import {
  addEventExpense,
  addEventMessage,
  addEventParticipants,
  addEventPayment,
  createEvent,
  getEvent,
  getEventMetaData,
  getEventsForCurrentUser,
  getEventsToJoin,
  joinEvent,
} from "./services/eventService";
import {
  currentUser,
  getUser,
  getUsers,
  updateMyPhoto,
  updateUser,
} from "./services/userService";
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
app.get("/user/me", currentUser);
app.post("/user/me/photo", handler(updateMyPhoto));
app.get("/user/:id", handler(getUser));
app.get("/users", handler(getUsers));
app.post("/user/update", handler(updateUser));

// Event API
app.get("/events", handler(getEventsForCurrentUser));
app.get("/event/:id", handler(getEvent));
app.get("/event/:id/metadata", handler(getEventMetaData));
app.post("/event", handler(createEvent));
app.post("/event/:id/expense", handler(addEventExpense));
app.post("/event/:id/payment", handler(addEventPayment));
app.post("/event/:id/message", handler(addEventMessage));
app.post("/event/:id/participants", handler(addEventParticipants));
app.post("/event/:id/join", handler(joinEvent));
app.get("/events/join", handler(getEventsToJoin));

// Media API
app.post("/media", handler(createMedia));
app.get("/media/:id", handler(getMedia));

swagger(app);
/* Start the Express app and listen
 for incoming requests on the specified port */
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
