import { Client } from "pg";
import { CustomError } from "src/utils/CustomError";

export async function executeQuery(connStr: any, command: any, values?: any) {

    const client = new Client(connStr);
    await client.connect();

    let q;
    try {
        if (values) {
            q = await client.query(command, values);
        } else {
            q = await client.query(command);
        }
        console.log(q);
    } catch (e) {
        console.log('error executing ', command, e);
        throw new CustomError('Error insert', 500)
    } finally {
        await client.end();
    }
    return q
}

// init db
// await execute(db, `
// CREATE TABLE libros (
//   libro_id SERIAL PRIMARY KEY,
//   titulo VARCHAR(255) NOT NULL,
//   autor VARCHAR(100),
//   editorial VARCHAR(100),
//   año_publicacion INTEGER,
//   ISBN VARCHAR(20) UNIQUE,
//   cantidad_paginas INTEGER,
//   genero VARCHAR(50)
// );`);