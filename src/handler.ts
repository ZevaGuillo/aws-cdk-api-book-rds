import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'


export const main = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return {
      body: JSON.stringify([
        {bookId: 1, text: 'perrito 🐕🐶'},
        {bookId: 2, text: 'sopita 🥗'},
      ]),
      statusCode: 200,
    };
  }