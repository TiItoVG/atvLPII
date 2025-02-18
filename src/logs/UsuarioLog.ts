import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export class UsuarioLog {
  async log(action: string) {
    const db = await open({ filename: './data/logs.db', driver: sqlite3.Database });
    await db.run('INSERT INTO logs (descricao, data) VALUES (?, ?)', [action, new Date().toUTCString()]);
  }
}
