import { z } from 'zod';

export const eventoSchema = z.object({
  nome: z.string().min(3),
  data: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Formato inválido. Use DD-MM-AAAA"),
  usuario_id: z.number().int(),
});
