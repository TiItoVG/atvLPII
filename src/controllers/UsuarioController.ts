import { usuarioSchema } from '../validation/UsuarioValidation';
import { UsuarioService } from '../services/UsuarioService';
import { UsuarioLog } from '../logs/UsuarioLog';
import { Usuario } from '../models/UsuarioModel';

export class UsuarioController {
  usuarioService = new UsuarioService();
  usuarioLog = new UsuarioLog();

  async createUsuario(data: any) {
    try {
      
      const validatedData = usuarioSchema.parse(data);
  
      const usuario = await this.usuarioService.createUsuario(validatedData) as unknown as Usuario | null;
      if (usuario !== null) {
        await this.usuarioLog.log('Usuário criado: ' + usuario.email);
        return usuario;
      }
      throw new Error('Falha ao criar usuário');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro de validação: ${error.message}`);
      } else {
        throw new Error('Erro desconhecido ao validar usuário.');
      }
    }
  }
  async alterarUsuario(id: number, data: any) {
    try {
      
      const validatedData = usuarioSchema.parse(data); 
  
      const usuario = await this.usuarioService.updateUsuario(id, validatedData) as unknown as Usuario | null;
      if (usuario !== null) {
        await this.usuarioLog.log(`Usuário alterado: ${usuario.email}`);
        return usuario;
      }
      throw new Error('Falha ao alterar usuário');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro de validação: ${error.message}`);
      } else {
        throw new Error('Erro desconhecido ao validar usuário.');
      }
    }
  }
  
}
