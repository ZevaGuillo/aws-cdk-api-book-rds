export interface Book {
    libro_id: number;
    titulo: string;
    autor?: string;
    editorial?: string;
    año_publicacion?: number;
    ISBN?: string;
    cantidad_paginas?: number;
    genero?: string;
}

export interface Response {
    message: string,
    book?: Book
}