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
    "/event/{id}/participants": {
      post: {
        summary: "Add participants to event",
        description: "Add participants to event",
        consumes: ["application/json"],
        produces: ["application/json"],
        parameters: [
          {
            in: "body",
            name: "participants",
            description: "participants to add",
            required: true,
            schema: {
              $ref: "#/definitions/AddParticipantRequest",
            },
          },
          {
            name: "id",
            in: "path",
            description: "ID of the event to add participants",
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
    Event: {
      type: "object",
      properties: {
        created_by: {
          type: "string",
          example: "user123",
        },
        name: {
          type: "string",
          example: "Birthday Party",
        },
        photo: {
          type: "string",
          example: "https://example.com/photo.jpg",
        },
        messages: {
          type: "array",
          items: {
            $ref: "#/definitions/Message",
          },
          example: [],
        },
        participants: {
          type: "array",
          items: {
            type: "string",
          },
          example: ["user123", "user456"],
        },
        expenses: {
          type: "array",
          items: {
            $ref: "#/definitions/Expense",
          },
          example: [],
        },
        start_time: {
          type: "string",
          example: "2024-04-01T12:00:00Z",
        },
        created_at: {
          type: "string",
          example: "2024-04-01T10:00:00Z",
        },
        updated_at: {
          type: "string",
          example: "2024-04-01T10:30:00Z",
        },
      },
    },
    EventResponse: {
      allOf: [
        {
          $ref: "#/definitions/Event",
        },
        {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "event123",
            },
          },
          required: ["_id"],
        },
      ],
    },
    CreateEventRequest: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "Birthday Party",
        },
        photo: {
          type: "string",
          example: "https://example.com/photo.jpg",
        },
        start_time: {
          type: "string",
          example: "2024-04-01T12:00:00Z",
        },
      },
      required: ["name", "start_time"],
    },
    AddParticipantRequest: {
      type: "object",
      properties: {
        participants: {
          type: "array",
          items: {
            type: "string",
          },
          example: ["user456"],
        },
      },
    },
    Message: {
      type: "object",
      properties: {
        created_by: {
          type: "string",
          example: "user123",
        },
        content: {
          type: "string",
          example: "Hello!",
        },
        media: {
          type: "array",
          items: {
            type: "string",
          },
          example: [],
        },
        created_at: {
          type: "string",
          example: "2024-04-01T10:00:00Z",
        },
        updated_at: {
          type: "string",
          example: "2024-04-01T10:30:00Z",
        },
      },
    },
    CreateMessageRequest: {
      type: "object",
      properties: {
        content: {
          type: "string",
          example: "Hello!",
        },
        media: {
          type: "array",
          items: {
            type: "string",
          },
          example: [],
        },
      },
      required: ["content"],
    },
    Media: {
      type: "object",
      properties: {
        created_by: {
          type: "string",
          example: "user123",
        },
        type: {
          type: "string",
          example: "image/jpeg",
        },
      },
    },
    MediaResponse: {
      allOf: [
        {
          $ref: "#/definitions/Media",
        },
        {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "media123",
            },
          },
          required: ["_id"],
        },
      ],
    },
    User: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "John Doe",
        },
        photo: {
          type: "string",
          example: "https://example.com/photo.jpg",
        },
      },
    },
    UserResponse: {
      allOf: [
        {
          $ref: "#/definitions/User",
        },
        {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "user123",
            },
          },
          required: ["_id"],
        },
      ],
    },
    Expense: {
      type: "object",
      properties: {
        created_by: {
          type: "string",
          example: "user123",
        },
        name: {
          type: "string",
          example: "Food",
        },
        amount: {
          type: "number",
          format: "double",
          example: 25.5,
        },
        media: {
          type: "array",
          items: {
            type: "string",
          },
          example: [],
        },
        applicable_to: {
          type: "array",
          items: {
            type: "string",
          },
          example: ["user123", "user456"],
        },
        created_at: {
          type: "string",
          example: "2024-04-01T10:00:00Z",
        },
        updated_at: {
          type: "string",
          example: "2024-04-01T10:30:00Z",
        },
      },
    },
    CreateExpenseRequest: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "Food",
        },
        amount: {
          type: "number",
          format: "double",
          example: 25.5,
        },
        media: {
          type: "array",
          items: {
            type: "string",
          },
          example: [],
        },
        applicable_to: {
          type: "array",
          items: {
            type: "string",
          },
          example: ["user123"],
        },
      },
      required: ["name", "amount"],
    },
  },
};
