import { eventoSchema } from '../validation/EventoValidation';
import { EventoService } from '../services/EventoService';
import { EventoLog } from '../logs/EventoLog';
import { Evento } from '../models/EventoModel';

export class EventoController {
  eventoService = new EventoService();
  eventoLog = new EventoLog();

  async createEvento(data: any) {
    try {
      
      const validatedData = eventoSchema.parse(data);
  
      const evento = await this.eventoService.createEvento(validatedData) as unknown as Evento | null;
      if (evento !== null) {
        await this.eventoLog.log('Evento criado: ' + (evento.nome || 'sem nome'));
        return evento;
      }
      throw new Error('Falha ao criar evento');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro de validação: ${error.message}`);
      } else {
        throw new Error('Erro desconhecido ao validar evento.');
      }
    }
  }
  
}
