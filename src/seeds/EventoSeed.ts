import { EventoService } from '../services/EventoService';
import { faker } from '@faker-js/faker';
(async () => {
  const eventoService = new EventoService();
  for (let i = 0; i < 5; i++) {
    await eventoService.createEvento({
      nome: faker.lorem.words(3),
      data: faker.date.future().toISOString(),
      usuario_id: 1
    });
  }
})();
