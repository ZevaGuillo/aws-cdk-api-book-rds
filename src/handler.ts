import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Client } from "pg";

type responseType = {
  body: string;
  statusCode: number;
};

export const main = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let response: responseType = {} as responseType;

  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    switch (event.httpMethod) {
      case "POST": // Create
        
        break;

      case "GET": // Read
        break;

      case "PUT": // Update
        break;

      case "DELETE": // Delete
        break;

      default:
        response = {
          statusCode: 400,
          body: "Operación no admitida",
        };
    }
  } catch (error) {
    console.error("Error:", error);
    response = {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  } finally {
    client.end();
  }

  return response;
};
