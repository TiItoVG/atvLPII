import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export class EventoService {
  async createEvento(evento: { nome: string; data: string; usuario_id: number }) {
    const db = await open({ filename: './data/evento.db', driver: sqlite3.Database });
    await db.run('INSERT INTO eventos (nome, data, usuario_id) VALUES (?, ?, ?)', [evento.nome, evento.data, evento.usuario_id]);
  }

  async getAllEventos() {
    const db = await open({ filename: './data/evento.db', driver: sqlite3.Database });
    return db.all('SELECT * FROM eventos');
  }

  async getEventoById(id: number) {
    const db = await open({ filename: './data/evento.db', driver: sqlite3.Database });
    return db.get('SELECT * FROM eventos WHERE id = ?', [id]);
  }

  async updateEvento(id: number, evento: { nome: string; data: string; usuario_id: number }) {
    const db = await open({ filename: './data/evento.db', driver: sqlite3.Database });
    await db.run('UPDATE eventos SET nome = ?, data = ?, usuario_id = ? WHERE id = ?', [evento.nome, evento.data, evento.usuario_id, id]);
  }

  async deleteEvento(id: number) {
    const db = await open({ filename: './data/evento.db', driver: sqlite3.Database });
    await db.run('DELETE FROM eventos WHERE id = ?', [id]);
  }
}
