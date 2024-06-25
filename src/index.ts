// src/index.ts
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Express } from "express";
import { startCronJobs } from "./scheduler";
import {
  addEventExpense,
  addEventMessage,
  addEventMessageReaction,
  addEventMessageReadReceipt,
  addEventParticipants,
  addEventPayment,
  createEvent,
  createExpenseAdjustment,
  deleteExpense,
  getEvent,
  getEventMetaData,
  getEventsForCurrentUser,
  getEventsToJoin,
  joinEvent,
  joinEventByCode,
  pinEventMessage,
  updateEvent,
} from "./services/eventService";
import { getFeed } from "./services/feedService";
import { createMedia, getMedia } from "./services/mediaService";
import {
  createPlace,
  deletePlace,
  getEventPlaces,
  getGooglePlace,
  getGooglePlaces,
  searchForPlaces,
  updatePlace,
} from "./services/placeService";
import {
  createPlan,
  deletePlan,
  findPlan,
  listPlans,
  listPlansForUser,
  planUpdateChecklist,
  updatePlan,
} from "./services/planService";
import { publicGetEventById, sharePlan } from "./services/publicService";
import {
  addFriend,
  checkTokenStatus,
  currentUser,
  deleteUser,
  getUser,
  getUsers,
  listFriends,
  registerUserFromToken,
  updateMyPhoto,
  updateUser,
} from "./services/userService";
import { handler, publicHander } from "./utils/handler";
import swagger from "./utils/swagger";
import expenseService from "./services/expenseService";
import { storyCreate, storyGet } from "./services/storyService";
import { getDailyAffirmation } from "./services/addictionService";

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

// Set the view engine to ejs
app.set("view engine", "ejs");

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

// Story API
app.post('/story/create', handler(storyCreate));
app.post('/story/get', handler(storyGet));

// Addiction Recovery API
app.get('/daily-affirmation', publicHander(getDailyAffirmation));

// Event API
app.get("/events", handler(getEventsForCurrentUser));
app.get("/event/by-id", publicHander(publicGetEventById));
app.get("/event/:id", handler(getEvent));
app.get("/event/:id/metadata", handler(getEventMetaData));
app.post("/event", handler(createEvent));
app.post("/event/:id/update", handler(updateEvent));
app.post("/event/:id/expense", handler(addEventExpense));
app.post("/event/:id/expense-adjustment", handler(createExpenseAdjustment));

app.delete("/event/:id/expense", handler(deleteExpense));
app.post("/event/:id/payment", handler(addEventPayment));

app.post("/event/:id/message", handler(addEventMessage));
app.post("/event/:id/message-read", handler(addEventMessageReadReceipt));
app.post("/event/:id/message-react", handler(addEventMessageReaction));
app.post("/event/:id/message/pin", handler(pinEventMessage));

app.post("/event/:id/participants", handler(addEventParticipants));
app.post("/event/:id/join", handler(joinEvent));
app.get("/events/join", handler(getEventsToJoin));
app.get("/event/join/code", handler(joinEventByCode));

// Media API
app.post("/media", handler(createMedia));
app.get("/media/:id", handler(getMedia));

// Feed API
app.get("/feed", handler(getFeed));

// Plan API
app.get("/plans", handler(listPlansForUser));
app.post("/event/:id/plan", handler(createPlan));
app.get("/event/:id/plans", handler(listPlans));
app.post("/plan/:id", handler(updatePlan));
app.delete("/plan/:id", handler(deletePlan));
app.get("/plan/:id", handler(findPlan));
app.post("/plan/:id/checklist", handler(planUpdateChecklist));

// Public shared
app.get("/share/plan/:id", sharePlan);

// Place API
app.get("/event/:id/places", handler(getEventPlaces));
app.get("/places/google", handler(getGooglePlaces));
app.post("/place", handler(createPlace));
app.put("/place/:id", handler(updatePlace));
app.delete("/place/:id", handler(deletePlace));
app.post("/places/search", handler(searchForPlaces));
app.get("/place/google/:id", handler(getGooglePlace));

// Expense API
app.post("/expense/reminder/add", handler(expenseService.addReminder));
app.post("/expense/reminder/remove", handler(expenseService.removeReminder));

swagger(app);

app.get("*", (req, res) => {
  res.redirect(301, "https://deporter.lets.lol" + req.url);
});

/* Start the Express app and listen
 for incoming requests on the specified port */
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
