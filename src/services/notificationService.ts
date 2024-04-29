import { cacheDelete, cacheGetByPrefix, cacheSet } from "../utils/redis";

const amqp = require("amqplib");
const RABBITMQ_LINK = process.env.RABBITMQ_LINK;

if (!RABBITMQ_LINK) {
  console.error("RabbitMQ not configured");
  process.exit(1); // Exit if RabbitMQ is not configured
}

let amqpConnection: any = null;
let connectionPromise: any = null;

initRabbitMQ().then((connection) => (amqpConnection = connection));

async function initRabbitMQ() {
  if (!RABBITMQ_LINK) return;

  if (amqpConnection) return amqpConnection; // Return existing connection if available

  if (connectionPromise) return await connectionPromise; // Wait for the existing connection attempt to complete

  // Start a new connection attempt
  connectionPromise = (async () => {
    try {
      const amqpServer = RABBITMQ_LINK;
      amqpConnection = await amqp.connect(amqpServer);
      amqpConnection.on("error", (err: any) => {
        console.info("connection closed", err);
        amqpConnection = null; // Reset the connection on error
        connectionPromise = null; // Allow new connection attempts after an error
      });
      console.info("Connected to RabbitMQ");
      return amqpConnection;
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      connectionPromise = null; // Reset promise to allow new attempts
      throw error; // Re-throw error to reject the promise
    }
  })();

  return await connectionPromise;
}

async function sendToQueue(queue: string, message: string) {
  if (!RABBITMQ_LINK) {
    console.error("RabbitMQ not configured");
    return;
  }
  if (!amqpConnection) {
    amqpConnection = await initRabbitMQ();
    if (!amqpConnection) {
      console.error("RabbitMQ channel not initialized.");
      return;
    }
  }
  try {
    const amqpChannel = await amqpConnection.createChannel();
    await amqpChannel.assertQueue(queue, {
      durable: true,
    });
    amqpChannel.sendToQueue(queue, Buffer.from(message));
  } catch (error) {
    console.error(`Failed to send message to queue ${queue}:`, error);
  }
}

export enum WebsocketEventType {
  ROUTING_NOTIFICATION = "ROUTING_NOTIFICATION",
  ROUTING_PUSH_NOTIFICATION = "ROUTING_PUSH_NOTIFICATION",
  MESSAGE_NOTIFICATION = "MESSAGE_NOTIFICATION", // websocket notification
}

export type NotificationAction =
  | {
      type: WebsocketEventType.ROUTING_NOTIFICATION;
      payload: {
        goTo: string; // route to go to
        title: string; // title of the notification
        description: string; // description of the notification
      };
    }
  | {
      type: WebsocketEventType.ROUTING_PUSH_NOTIFICATION;
      payload: {
        goTo: string;
        title: string; // title of the notification
        description: string; // description of the notification
      };
    }
  | {
      type: WebsocketEventType.MESSAGE_NOTIFICATION;
      payload: {
        eventId: string;
      };
    };

interface NotificationCached {
  messageId: string;
  userId: string;
  action: NotificationAction;
}

function getUserQueue(userId: string) {
  return `queue_${userId}`;
}

/** The user must be in the app for these ones */
export async function sendWebsocketNotification(
  userId: string,
  action: NotificationAction
) {
  return sendToQueue(getUserQueue(userId), JSON.stringify(action));
}

/** These are sent if the user has notifications on and registered their token*/
export async function sendPushNotification(
  userId: string,
  action: NotificationAction
) {
  const payload = {
    userId: userId,
    data: action,
  };
  return sendToQueue("queue_push_notifications", JSON.stringify(payload));
}

// Scheduled task
export async function processNotificationsFromCache() {
  console.log("Processing notifications from cache");
  const toSend: NotificationCached[] = await cacheGetByPrefix("notifications-");
  console.log("Sending notifications:", toSend.length);
  const promises = toSend.flatMap(async (notification) => {
    await Promise.all([
      sendWebsocketNotification(notification.userId, notification.action),
      sendPushNotification(notification.userId, notification.action),
    ]);

    await cacheDelete("notifications-" + notification.messageId);
  });

  await Promise.all(promises);

  console.log("Successfully sent notifications");
}

export async function cacheNotificationToProcess(
  userId: string,
  action: NotificationAction
) {
  const notification: NotificationCached = {
    messageId: Math.random().toString(36).substring(7),
    userId,
    action,
  };

  await cacheSet("notifications-" + notification.messageId, notification);
}
