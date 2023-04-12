import * as dotenv from "dotenv"
dotenv.config()
import { MongoClient } from 'mongodb';

let db = undefined;


export function fetchCollection(name) {
  return fetchDatabase().collection(name);
}

function fetchDatabase() {
  if (db != undefined) {
    return db;
  }

  const url = `mongodb+srv://${process.env.appUsername}:${process.env.appPassword}@cluster0.hx5gfla.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(url);

  db = client.db(process.env.appDatabaseName); // Samling av collections (skapas dynamisk, har ej skapats explicit i atlas)

  return db;
}