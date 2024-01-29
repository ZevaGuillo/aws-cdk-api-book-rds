import { APIGatewayProxyEvent } from 'aws-lambda';
import { executeQuery } from 'src/db/config';
import { CustomError } from 'src/utils/CustomError';

export const deleteBook = async (event: APIGatewayProxyEvent, db: any) => {
    const bookId = event.pathParameters?.id;

    if (!bookId) {
        throw new CustomError('ID de libro no proporcionado en la ruta.', 400);
    }

    const query = `
    DELETE FROM libros
    WHERE libro_id = $1
    RETURNING *;
  `;

    const result = await executeQuery(db, query, [bookId]);

    if (result.rows.length === 0) {
        throw new CustomError(`No se encontró un libro con el ID ${bookId}.`, 404);
    }

    const deletedBookData = result.rows[0];

    return {
        message: 'Libro eliminado correctamente',
        deletedBook: deletedBookData,
    };
};
