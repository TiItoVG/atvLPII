import { UsuarioService } from '../services/UsuarioService';
import { faker } from '@faker-js/faker';
(async () => {
  const usuarioService = new UsuarioService();
  await usuarioService.createUsuario({
    nome: 'Administrador',
    email: 'admin@hotmail.com',
    senha: 'aDmin123@!'
  });
  for (let i = 0; i < 5; i++) {
    await usuarioService.createUsuario({
      nome: faker.person.fullName(),
      email: faker.internet.email(),
      senha: 'Teste@1234'
    });
  }
})();