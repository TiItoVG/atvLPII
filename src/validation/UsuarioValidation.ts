import { z } from 'zod';

export const usuarioSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(8).regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
});
