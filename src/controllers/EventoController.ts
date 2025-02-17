import { EventoService } from '../services/EventoService';
import { EventoLog } from '../logs/EventoLog';
import { Evento } from '../models/EventoModel';

export class EventoController {
  eventoService = new EventoService();
  eventoLog = new EventoLog();

  async createEvento(data: any) {
    const evento = await this.eventoService.createEvento(data) as unknown as Evento | null;
    if (evento !== null) {
      await this.eventoLog.log('Evento criado: ' + (evento.nome || 'sem nome'));
      return evento;
    }
    throw new Error('Falha ao criar evento');
  }

  async listarEventos() {
    return this.eventoService.getAllEventos();
  }

  async buscarEvento(id: number) {
    return this.eventoService.getEventoById(id);
  }

  async alterarEvento(id: number, data: any) {
    const evento = await this.eventoService.updateEvento(id, data) as unknown as Evento | null;
    if (evento !== null) {
      await this.eventoLog.log('Evento alterado: ' + (data.nome || 'sem nome'));
      return evento;
    }
    throw new Error('Falha ao alterar evento');
  }

  async deletarEvento(id: number) {
    await this.eventoService.deleteEvento(id);
    await this.eventoLog.log('Evento deletado com ID: ' + id);
  }
}