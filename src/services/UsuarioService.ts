import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export class UsuarioService {
  async createUsuario(usuario: { nome: string; email: string; senha: string }) {
    const db = await open({ filename: './data/usuario.db', driver: sqlite3.Database });
    await db.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [usuario.nome, usuario.email, usuario.senha]);
  }

  async getAllUsuarios() {
    const db = await open({ filename: './data/usuario.db', driver: sqlite3.Database });
    return db.all('SELECT * FROM usuarios');
  }

  async getUsuarioById(id: number) {
    const db = await open({ filename: './data/usuario.db', driver: sqlite3.Database });
    return db.get('SELECT * FROM usuarios WHERE id = ?', [id]);
  }

  async updateUsuario(id: number, usuario: { nome: string; email: string; senha: string }) {
    const db = await open({ filename: './data/usuario.db', driver: sqlite3.Database });
    await db.run('UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?', [usuario.nome, usuario.email, usuario.senha, id]);
  }

  async deleteUsuario(id: number) {
    const db = await open({ filename: './data/usuario.db', driver: sqlite3.Database });
    await db.run('DELETE FROM usuarios WHERE id = ?', [id]);
  }
}