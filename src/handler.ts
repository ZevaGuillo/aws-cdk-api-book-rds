import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createBook } from "./controller/createBook.controller";
import { CustomError } from "./utils/CustomError";
import { sendResponse } from './utils'
import { getBooks } from "./controller/getBook.controller";
import { updateBook } from "./controller/updateBook.controller";
import { deleteBook } from "./controller/deleteBook.controller";

type responseType = {
  body: string;
  statusCode: number;
};

export const main = async (
  event: APIGatewayProxyEvent,
  context: any
): Promise<APIGatewayProxyResult> => {
  let response: responseType = {} as responseType;

  const db = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }

  try {

    switch (event.httpMethod) {
      case "POST": // Create

        const res = await createBook(event, db);
        return sendResponse(res, 201);

      case "GET": // Read
        let getRes = await getBooks(event, db);
        return sendResponse(getRes, 200);

      case "PUT": // Update
        let putRes = await updateBook(event, db);
        return sendResponse(putRes, 200);

      case "DELETE": // Delete
      let delRes = await deleteBook(event, db);
      return sendResponse(delRes, 200);

      default:
        response = {
          statusCode: 400,
          body: "Operación no admitida",
        };
    }
  } catch (error) {
    console.error("Error:", error);

    if (error instanceof CustomError) {
      response = {
        statusCode: error.statusCode,
        body: JSON.stringify({ message: error.message })
      }
    } else {
      response = {
        statusCode: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      };
    }

  } finally {
  }

  return response
};

