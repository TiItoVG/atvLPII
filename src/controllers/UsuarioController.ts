import { UsuarioService } from '../services/UsuarioService';
import { UsuarioLog } from '../logs/UsuarioLog';
import { Usuario } from '../models/UsuarioModel';

export class UsuarioController {
  usuarioService = new UsuarioService();
  usuarioLog = new UsuarioLog();

  async createUsuario(data: any) {
    const usuario = await this.usuarioService.createUsuario(data) as unknown as Usuario | null;
    if (usuario !== null) {
      await this.usuarioLog.log('Usuário criado: ' + usuario.email);
      return usuario;
    }
    throw new Error('Falha ao criar usuário');
  }

  async listarUsuarios() {
    return this.usuarioService.getAllUsuarios();
  }

  async buscarUsuario(id: number) {
    return this.usuarioService.getUsuarioById(id);
  }

  async alterarUsuario(id: number, data: any) {
    const usuario = await this.usuarioService.updateUsuario(id, data) as unknown as Usuario | null;
    if (usuario !== null) {
      await this.usuarioLog.log('Usuário alterado: ' + (data.email || 'sem email'));
      return usuario;
    }
    throw new Error('Falha ao alterar usuário');
  }

  async deletarUsuario(id: number) {
    await this.usuarioService.deleteUsuario(id);
    await this.usuarioLog.log('Usuário deletado com ID: ' + id);
  }
}