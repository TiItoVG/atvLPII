import fs from 'fs';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import * as readline from 'readline';
import { UsuarioService } from './services/UsuarioService';
import { EventoService } from './services/EventoService';
import { usuarioSchema } from './validation/UsuarioValidation';

function logToFile(usuario: string, acao: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] Usuário: ${usuario} | Ação: ${acao}\n`;


  fs.appendFileSync('./data/logs.log', logMessage, 'utf8');
}

async function initializeDatabase() {
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');

  const dbUsuario = await open({ filename: './data/usuario.db', driver: sqlite3.Database });
  await dbUsuario.exec(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    nome TEXT NOT NULL, 
    email TEXT UNIQUE NOT NULL, 
    senha TEXT NOT NULL
  );`);

  if (!await dbUsuario.get('SELECT * FROM usuarios WHERE email = ?', ['admin@hotmail.com'])) {
    await dbUsuario.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', ['Administrador', 'admin@hotmail.com', 'aDmin123@!']);
  }

  const dbEvento = await open({ filename: './data/evento.db', driver: sqlite3.Database });
  await dbEvento.exec(`CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    nome TEXT NOT NULL, 
    data TEXT NOT NULL, 
    usuario_id INTEGER, 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );`);

  console.log('Banco de dados inicializado com sucesso!');
  

  logToFile('Sistema', 'Sistema inicializado');
}

async function mainMenu() {
  const usuarioService = new UsuarioService();
  const eventoService = new EventoService();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (query: string) => new Promise<string>(resolve => rl.question(query, resolve));

  let currentUser = null;
  console.log('--- Sistema de Login ---');

  while (!currentUser) {
    const id = await ask('ID do Usuário: ');
    try {
      const user = await usuarioService.getUsuarioById(Number(id));
      if (user) {
        currentUser = user;
        console.log(`Login bem-sucedido! Bem-vindo, ${user.nome}`);
        logToFile(user.email, 'Login realizado');
      } else {
        console.log('Usuário não encontrado. Tente novamente.');
      }
    } catch (error) {
      console.log('Erro ao realizar login:', error);
    }
  }

  while (true) {
    const option = await ask('Escolha uma opção:\n1. Criar usuário\n2. Listar usuários\n3. Buscar usuário por ID\n4. Alterar usuário\n5. Deletar usuário\n6. Criar evento\n7. Sair\n> ');
    try {
      switch (option.trim()) {
        case '1':
          try {
            const nome = await ask('Nome: ');
            const email = await ask('Email: ');
            const senha = await ask('Senha: ');

            const validatedUser = usuarioSchema.parse({ nome, email, senha });

            await usuarioService.createUsuario(validatedUser);
            logToFile(currentUser.email, `Criou o usuário ${email}`);
            console.log('Usuário criado com sucesso!');
          } catch (error) {
            console.error('Erro ao criar usuário:', error);
          }
          break;
        case '2':
          console.log(await usuarioService.getAllUsuarios());
          logToFile(currentUser.email, 'Listou todos os usuários');
          break;
        case '3':
          const idBusca = await ask('ID do usuário: ');
          console.log(await usuarioService.getUsuarioById(Number(idBusca)));
          logToFile(currentUser.email, `Buscou o usuário de ID ${idBusca}`);
          break;
        case '4':
          try {
            const idAlt = await ask('ID do usuário a alterar: ');
            const novoNome = await ask('Novo nome (pressione Enter para manter o atual): ');
            const novoEmail = await ask('Novo email (pressione Enter para manter o atual): ');
            const novaSenha = await ask('Nova senha (pressione Enter para manter a atual): ');

            const updatedUserData: any = {};
            if (novoNome) updatedUserData.nome = novoNome;
            if (novoEmail) updatedUserData.email = novoEmail;
            if (novaSenha) updatedUserData.senha = novaSenha;

            const validatedUser = usuarioSchema.parse(updatedUserData);

            await usuarioService.updateUsuario(Number(idAlt), validatedUser);
            logToFile(currentUser.email, `Alterou o usuário de ID ${idAlt}`);
            console.log('Usuário alterado com sucesso!');
          } catch (error) {
            console.error('Erro ao alterar usuário:', error);
          }
          break;
        case '5':
          const idDel = await ask('ID do usuário a deletar: ');
          await usuarioService.deleteUsuario(Number(idDel));
          logToFile(currentUser.email, `Deletou o usuário de ID ${idDel}`);
          console.log('Usuário deletado com sucesso!');
          break;
        case '6':
          const eventoNome = await ask('Nome do evento: ');
          const eventoData = await ask('Data do evento (DD-MM-AAAA): ');
          await eventoService.createEvento({ nome: eventoNome, data: eventoData, usuario_id: currentUser.id });
          logToFile(currentUser.email, `Criou o evento ${eventoNome}`);
          console.log('Evento criado com sucesso!');
          break;
        case '7':
          logToFile(currentUser.email, 'Logout realizado');
          console.log('Saindo...');
          rl.close();
          process.exit(0);
        default:
          console.log('Opção inválida');
      }
    } catch (error: unknown) {
      console.error('Erro:', (error as Error).message);
    }
  }
}

initializeDatabase().then(mainMenu).catch(console.error);
