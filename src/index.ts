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
  joinEventByCode,
  updateEvent,
} from "./services/eventService";
import { createMedia, getMedia } from "./services/mediaService";
import {
  checkTokenStatus,
  currentUser,
  deleteUser,
  getUser,
  getUsers,
  registerUserFromToken,
  updateMyPhoto,
  updateUser,
  listFriends,
  addFriend,
} from "./services/userService";
import { handler } from "./utils/handler";
import swagger from "./utils/swagger";
import { getFeed } from "./services/feedService";
import { startCronJobs } from "./scheduler";

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

// Start cron jobs
startCronJobs();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// User API
app.get("/user/me", handler(currentUser));
app.get("/user/token/check", checkTokenStatus);
app.get("/user/friends", handler(listFriends));
app.post("/user/friend/add/:id", handler(addFriend));
app.post("/user/register", registerUserFromToken);
app.post("/user/me/photo", handler(updateMyPhoto));
app.post("/user/delete", handler(deleteUser));
app.get("/user/:id", handler(getUser));
app.get("/users", handler(getUsers));
app.post("/user/update", handler(updateUser));

// Event API
app.get("/events", handler(getEventsForCurrentUser));
app.get("/event/:id", handler(getEvent));
app.get("/event/:id/metadata", handler(getEventMetaData));
app.post("/event", handler(createEvent));
app.post("/event/:id/update", handler(updateEvent));
app.post("/event/:id/expense", handler(addEventExpense));
app.post("/event/:id/payment", handler(addEventPayment));
app.post("/event/:id/message", handler(addEventMessage));
app.post("/event/:id/participants", handler(addEventParticipants));
app.post("/event/:id/join", handler(joinEvent));
app.get("/events/join", handler(getEventsToJoin));
app.get("/event/join/code", handler(joinEventByCode));

// Media API
app.post("/media", handler(createMedia));
app.get("/media/:id", handler(getMedia));

// Feed API
app.get("/feed", handler(getFeed));

swagger(app);

app.get("*", (req, res) => {
  res.redirect(301, "https://deporter.lets.lol" + req.url);
});

/* Start the Express app and listen
 for incoming requests on the specified port */
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
