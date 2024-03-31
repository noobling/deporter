export default {
  swagger: "2.0",
  info: {
    version: "1.0.0",
    title: "Event API",
    description: "API for managing events",
  },
  basePath: "/",
  schemes: ["http", "https"],
  paths: {
    "/user/{id}": {
      get: {
        summary: "Get user by ID",
        description: "Returns user by id",
        produces: ["application/json"],
        parameters: [
          {
            name: "id",
            in: "path",
            description: "ID of the event to retrieve",
            required: true,
            type: "string",
            example: "6608cb6a9ba84d871e155dbd",
          },
        ],
        responses: {
          "200": {
            description: "Successful operation",
            schema: {
              $ref: "#/definitions/User",
            },
          },
          "404": {
            description: "User not found",
          },
        },
      },
    },
    "/user": {
      post: {
        summary: "Create a new user",
        description: "Creates a new user",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            in: "body",
            name: "user",
            description: "User object to be created",
            required: true,
            schema: {
              $ref: "#/definitions/CreateUserRequest",
            },
          },
        ],
        responses: {
          "200": {
            description: "User created successfully",
            schema: {
              $ref: "#/definitions/User",
            },
          },
        },
      },
    },
    "/event/{id}": {
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
            example: "66091716d83206a549f25de3",
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
    "/event": {
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
              $ref: "#/definitions/CreateEventRequest",
            },
          },
        ],
        responses: {
          "200": {
            description: "Event created successfully",
            schema: {
              $ref: "#/definitions/Event",
            },
          },
        },
      },
    },
    "/event/{id}/expense": {
      post: {
        summary: "Add expense to event",
        description: "Add expense to event",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            in: "body",
            name: "expense",
            description: "Expense object to be created",
            required: true,
            schema: {
              $ref: "#/definitions/CreateExpenseRequest",
            },
          },
          {
            name: "id",
            in: "path",
            description: "ID of the event to add expense",
            required: true,
            type: "string",
            example: "66091716d83206a549f25de3",
          },
        ],
        responses: {
          "200": {
            description: "Expense created successfully",
            schema: {
              $ref: "#/definitions/Event",
            },
          },
        },
      },
    },
    "/event/{id}/message": {
      post: {
        summary: "Add message to event",
        description: "Add message to event",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            in: "body",
            name: "message",
            description: "Message object to be created",
            required: true,
            schema: {
              $ref: "#/definitions/CreateMessageRequest",
            },
          },
          {
            name: "id",
            in: "path",
            description: "ID of the event to add message",
            required: true,
            type: "string",
            example: "66091716d83206a549f25de3",
          },
        ],
        responses: {
          "200": {
            description: "Message created successfully",
            schema: {
              $ref: "#/definitions/Event",
            },
          },
        },
      },
    },
  },
  definitions: {
    CreateEventRequest: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        photo: {
          type: "string",
        },
        start_time: {
          type: "string",
          format: "date-time",
        },
      },
      example: {
        name: "My Event",
        photo: "https://example.com/photo.jpg",
        start_time: "2024-03-31T07:39:21.758Z",
      },
    },
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
        created_at: {
          type: "string",
          format: "date-time",
        },
        updated_at: {
          type: "string",
          format: "date-time",
        },
      },
    },
    Message: {
      type: "object",
      properties: {
        created_by: {
          type: "string",
        },
        content: {
          type: "string",
        },
        media: {
          type: "array",
          items: {
            type: "string",
          },
        },
        created_at: {
          type: "string",
          format: "date-time",
        },
        updated_at: {
          type: "string",
          format: "date-time",
        },
      },
    },
    CreateExpenseRequest: {
      type: "object",
      properties: {
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
      example: {
        name: "My Expense Name",
        amount: 100.23,
        media: ["photo_url.com"],
        applicable_to: ["6608cb6a9ba84d871e155dbd"],
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
        created_at: {
          type: "string",
          format: "date-time",
        },
        updated_at: {
          type: "string",
          format: "date-time",
        },
      },
    },
    CreateUserRequest: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        photo: {
          type: "string",
        },
      },
      required: ["name"],
      example: {
        name: "David",
        photo: "https://example.com/photo.jpg",
      },
    },
    CreateUserResponse: {
      type: "object",
      properties: {
        insertedId: {
          type: "string",
          description: "id of user to query on",
        },
      },
    },
    User: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        photo: {
          type: "string",
        },
        created_at: {
          type: "string",
          format: "date-time",
        },
        updated_at: {
          type: "string",
          format: "date-time",
        },
      },
    },
    CreateMessageRequest: {
      type: "object",
      properties: {
        content: {
          type: "string",
        },

        media: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
      example: {
        content: "My message",
        media: ["photo_url.com"],
      },
    },
  },
};
