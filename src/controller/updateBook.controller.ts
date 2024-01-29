import { APIGatewayProxyEvent } from 'aws-lambda';
import { executeQuery } from 'src/db/config';
import { Book } from 'src/types/Book';
import { CustomError } from 'src/utils/CustomError';

export const updateBook = async (event: APIGatewayProxyEvent, db: any) => {
  const bookId = event.pathParameters?.id;

  if (!bookId) {
    throw new CustomError('ID de libro no proporcionado en la ruta.', 400);
  }

  if (!event.body) {
    throw new CustomError('El body del request no está presente.',400);
  }

  const updatedBook: Book = JSON.parse(event.body);

  const query = `
    UPDATE libros
    SET titulo = $1, autor = $2, editorial = $3, año_publicacion = $4, ISBN = $5, cantidad_paginas = $6, genero = $7
    WHERE libro_id = $8
    RETURNING *;
  `;

  const result = await executeQuery(db, query, [
    updatedBook.titulo,
    updatedBook.autor,
    updatedBook.editorial,
    updatedBook.año_publicacion,
    updatedBook.ISBN,
    updatedBook.cantidad_paginas,
    updatedBook.genero,
    bookId,
  ]);

  if (result.rows.length === 0) {
    throw new CustomError(`No se encontró un libro con el ID ${bookId}.`, 404);
  }

  const updatedBookData: Book = result.rows[0];

  return {
    message: 'Libro actualizado correctamente',
    updatedBook: updatedBookData,
  };
};
