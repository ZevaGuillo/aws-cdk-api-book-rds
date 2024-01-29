import { APIGatewayProxyEvent } from "aws-lambda";
import { executeQuery } from "src/db/config";
import { Book } from "src/types/Book";
import { CustomError } from "src/utils/CustomError";

export const createBook = async (event: APIGatewayProxyEvent, db: any) => {
    if (!event.body) {
        console.log("no hay body");
        throw new CustomError('El body del request no está presente', 400);
    }

    const book: Book = JSON.parse(event.body);

    if (!book.titulo) { throw new CustomError('El libro no contiene titulo', 400); }

    const query = `
    INSERT INTO libros (titulo, autor, editorial, año_publicacion, ISBN, cantidad_paginas, genero)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING libro_id;
  `;
    await executeQuery(db, query, [
        book.titulo,
        book.autor,
        book.editorial,
        book.año_publicacion,
        book.ISBN,
        book.cantidad_paginas,
        book.genero,
    ]);

    console.log("Ejecución correcta");


    return {
        message: "creado",
        book
    }
}