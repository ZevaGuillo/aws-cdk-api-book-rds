import { APIGatewayProxyEvent } from 'aws-lambda';
import { executeQuery } from 'src/db/config';
import { Book } from 'src/types/Book';

export const getBooks = async (event: APIGatewayProxyEvent, db: any) => {
    const query = `
    SELECT * FROM libros;
  `;

    const result = await executeQuery(db, query);

    const books: Book[] = result.rows;


    return {
        message: 'Libros obtenidos correctamente',
        books,
    };
};
