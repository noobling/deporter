import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerDef from "./swaggerDef";

const options: swaggerJsdoc.Options = {
  swaggerDefinition: swaggerDef,
  apis: ["./api.ts"],
};

const specs = swaggerJsdoc(options);

export default (app: any) => {
  app.use("/", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
};
