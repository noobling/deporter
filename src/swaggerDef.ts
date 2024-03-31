export default {
  swagger: "2.0",
  info: {
    version: "1.0.0",
    title: "Event API",
    description: "API for managing events",
  },
  basePath: "/",
  schemes: ["http"],
  paths: {
    "/events/{id}": {
      get: {
        summary: "Get event by ID",
        description: "Returns an event by its ID",
        produces: ["application/json"],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "ID of the event to retrieve",
            required: true,
            type: "string",
          },
        ],
        responses: {
          "200": {
            description: "Successful operation",
            schema: {
              $ref: "#/definitions/Event",
            },
          },
          "404": {
            description: "Event not found",
          },
        },
      },
    },
    "/events": {
      post: {
        summary: "Create a new event",
        description: "Creates a new event",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            in: "body",
            name: "event",
            description: "Event object to be created",
            required: true,
            schema: {
              $ref: "#/definitions/Event",
            },
          },
        ],
        responses: {
          "201": {
            description: "Event created successfully",
            schema: {
              $ref: "#/definitions/Event",
            },
          },
        },
      },
    },
  },
  definitions: {
    Event: {
      type: "object",
      properties: {
        created_by: {
          type: "string",
        },
        name: {
          type: "string",
        },
        photo: {
          type: "string",
        },
        messages: {
          type: "array",
          items: {
            $ref: "#/definitions/Message",
          },
        },
        participants: {
          type: "array",
          items: {
            type: "string",
          },
        },
        expenses: {
          type: "array",
          items: {
            $ref: "#/definitions/Expense",
          },
        },
        start_time: {
          type: "string",
          format: "date-time",
        },
      },
    },
    Message: {
      type: "object",
      properties: {
        sent_by: {
          type: "string",
        },
        content: {
          type: "string",
        },
        timestamp: {
          type: "string",
          format: "date-time",
        },
        media: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },
    Expense: {
      type: "object",
      properties: {
        created_by: {
          type: "string",
        },
        name: {
          type: "string",
        },
        amount: {
          type: "number",
          format: "double",
        },
        media: {
          type: "array",
          items: {
            type: "string",
          },
        },
        applicable_to: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },
  },
};
