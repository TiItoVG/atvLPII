import { open } from 'sqlite'
import sqlite3 from 'sqlite3';
import fs from 'fs';
import { UsuarioService } from './services/UsuarioService';
import { EventoService } from './services/EventoService';
import * as readline from 'readline';

async function initializeDatabase() {
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');

  const dbUsuario = await open({ filename: './data/usuario.db', driver: sqlite3.Database });
  await dbUsuario.exec(`CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL, senha TEXT NOT NULL);`);
  if (!await dbUsuario.get('SELECT * FROM usuarios WHERE email = ?', ['admin@hotmail.com'])) {
    await dbUsuario.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', ['Administrador', 'admin@hotmail.com', 'aDmin123@!']);
  }

  const dbEvento = await open({ filename: './data/evento.db', driver: sqlite3.Database });
  await dbEvento.exec(`CREATE TABLE IF NOT EXISTS eventos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, data TEXT NOT NULL, usuario_id INTEGER, FOREIGN KEY (usuario_id) REFERENCES usuarios(id));`);

  const dbLogs = await open({ filename: './data/logs.db', driver: sqlite3.Database });
  await dbLogs.exec(`CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT NOT NULL, acao TEXT NOT NULL, datahora DATETIME DEFAULT CURRENT_TIMESTAMP);`);

  console.log('Banco de dados inicializado com sucesso!');
  try {
    await dbLogs.run('INSERT INTO logs (usuario, acao) VALUES (?, ?)', ['Sistema', 'Sistema inicializado']);
  } catch (error) {
    console.error('Erro ao inserir log de inicialização:', error);
  }
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
        const dbLogs = await open({ filename: './data/logs.db', driver: sqlite3.Database });
        await dbLogs.run('INSERT INTO logs (usuario, acao) VALUES (?, ?)', [user.email, 'Login realizado']);
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
      const dbLogs = await open({ filename: './data/logs.db', driver: sqlite3.Database });
      switch (option.trim()) {
        case '1':
          const nome = await ask('Nome: ');
          const email = await ask('Email: ');
          const senha = await ask('Senha: ');
          await usuarioService.createUsuario({ nome, email, senha });
          await dbLogs.run('INSERT INTO logs (usuario, acao) VALUES (?, ?)', [currentUser.email, `Criou o usuário ${email}`]);
          console.log('Usuário criado com sucesso!');
          break;
        case '2':
          console.log(await usuarioService.getAllUsuarios());
          await dbLogs.run('INSERT INTO logs (usuario, acao) VALUES (?, ?)', [currentUser.email, 'Listou todos os usuários']);
          break;
        case '3':
          const idBusca = await ask('ID do usuário: ');
          console.log(await usuarioService.getUsuarioById(Number(idBusca)));
          await dbLogs.run('INSERT INTO logs (usuario, acao) VALUES (?, ?)', [currentUser.email, `Buscou o usuário de ID ${idBusca}`]);
          break;
        case '4':
          const idAlt = await ask('ID do usuário a alterar: ');
          const novoNome = await ask('Novo nome: ');
          const novoEmail = await ask('Novo email: ');
          const novaSenha = await ask('Nova senha: ');
          await usuarioService.updateUsuario(Number(idAlt), { nome: novoNome, email: novoEmail, senha: novaSenha });
          await dbLogs.run('INSERT INTO logs (usuario, acao) VALUES (?, ?)', [currentUser.email, `Alterou o usuário de ID ${idAlt}`]);
          console.log('Usuário alterado com sucesso!');
          break;
        case '5':
          const idDel = await ask('ID do usuário a deletar: ');
          await usuarioService.deleteUsuario(Number(idDel));
          await dbLogs.run('INSERT INTO logs (usuario, acao) VALUES (?, ?)', [currentUser.email, `Deletou o usuário de ID ${idDel}`]);
          console.log('Usuário deletado com sucesso!');
          break;
        case '6':
          const eventoNome = await ask('Nome do evento: ');
          const eventoData = await ask('Data do evento (DD-MM-AAAA): ');
          await eventoService.createEvento({ nome: eventoNome, data: eventoData, usuario_id: currentUser.id });
          await dbLogs.run('INSERT INTO logs (usuario, acao) VALUES (?, ?)', [currentUser.email, `Criou o evento ${eventoNome}`]);
          console.log('Evento criado com sucesso!');
          break;
        case '7':
          await dbLogs.run('INSERT INTO logs (usuario, acao) VALUES (?, ?)', [currentUser.email, 'Logout realizado']);
          console.log('Saindo...');
          rl.close();
          process.exit(0);
        default:
          console.log('Opção inválida');
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Erro:', err.message);
    }
  }
}

initializeDatabase().then(mainMenu).catch(console.error);
