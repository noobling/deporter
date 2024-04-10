const amqp = require('amqplib');
const RABBITMQ_LINK = process.env.RABBITMQ_LINK;

if (!RABBITMQ_LINK) {
    console.error('RabbitMQ not configured');
    process.exit(1); // Exit if RabbitMQ is not configured
}

let amqpConnection: any = null;
let connectionPromise: any = null;

async function initRabbitMQ() {
    if (!RABBITMQ_LINK) return;

    if (amqpConnection) return amqpConnection; // Return existing connection if available

    if (connectionPromise) return await connectionPromise; // Wait for the existing connection attempt to complete

    // Start a new connection attempt
    connectionPromise = (async () => {
        try {
            const amqpServer = RABBITMQ_LINK;
            amqpConnection = await amqp.connect(amqpServer);
            amqpConnection.on('error', (err: any) => {
                console.info('connection closed', err);
                amqpConnection = null; // Reset the connection on error
                connectionPromise = null; // Allow new connection attempts after an error
            });
            console.info('Connected to RabbitMQ');
            return amqpConnection;
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            connectionPromise = null; // Reset promise to allow new attempts
            throw error; // Re-throw error to reject the promise
        }
    })();

    return await connectionPromise;
}

async function sendToQueue(queue: string, message: string) {
    if (!RABBITMQ_LINK) {
        console.error('RabbitMQ not configured')
        return
    }
    if (!amqpConnection) {
        amqpConnection = await initRabbitMQ()
        if (!amqpConnection) {
            console.error('RabbitMQ channel not initialized.')
            return
        }
    }
    try {
        const amqpChannel = await amqpConnection.createChannel()
        await amqpChannel.assertQueue(queue, {
            durable: true
        })
        amqpChannel.sendToQueue(queue, Buffer.from(message))
    } catch (error) {
        console.error(`Failed to send message to queue ${queue}:`, error)
    }
}

export enum WebsocketEventType {
    ROUTING_NOTIFICATION = 'ROUTING_NOTIFICATION',
    ROUTING_PUSH_NOTIFICATION = 'ROUTING_PUSH_NOTIFICATION',
}

type Action =
    | {
        type: WebsocketEventType.ROUTING_NOTIFICATION
        payload: {
            goTo: string // route to go to
            title: string // title of the notification
            description: string // description of the notification
        }
    }
    | {
        type: WebsocketEventType.ROUTING_PUSH_NOTIFICATION
        payload: {
            goTo: string
            title: string // title of the notification
            description: string // description of the notification
        }
    }

function getUserQueue(userId: string) {
    return `queue_${userId}`
}

/** The user must be in the app for these ones */
export async function sendWebsocketNotification(
    userId: string,
    action: Action
) {
    sendToQueue(getUserQueue(userId), JSON.stringify(action))
}

/** These are sent if the user has notifications on and registered their token*/
export async function sendPushNotification(userId: string, action: Action) {
    const payload = {
        userId: userId,
        data: action,
    }
    sendToQueue('queue_push_notifications', JSON.stringify(payload))
}

