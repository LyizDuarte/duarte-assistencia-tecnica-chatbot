import conectar from "./conexao.js";
import Servico from "../models/Servico.js";
export default class ServicoDAO {
  constructor() {
    this.init();
  }
  async init() {
    try {
      const sql = `create table if not exists Servico (
        codigo int primary key not null auto_increment ,
        titulo varchar(100) not null,
        descricao varchar(200) not null,
        valorServico decimal (10,2) not null,
        urlImagem varchar(200) not null
      )`;
      const conexao = await conectar();
      await conexao.execute(sql);
      global.poolConexoes.releaseConnection(conexao);
      console.log("Banco de dados iniciado.");
    } catch (error) {
      console.log("Erro ao iniciar o banco de dados: ", error);
    }
  }

  async gravar(servico) {
    if (servico instanceof Servico) {
      const sql = `insert into Servico (titulo,descricao, valorServico, urlImagem) values (?, ?, ?, ?)`;
      const parametros = [
        servico.titulo,
        servico.descricao,
        servico.valorServico,
        servico.urlImagem,
      ];
      const conexao = await conectar();
      const resultado = await conexao.execute(sql, parametros);
      servico.codigo = resultado[0].insertId;
      global.poolConexoes.releaseConnection(conexao);
    }
  }
  async alterar(servico) {
    if (servico instanceof Servico) {
      const sql = `update Servico set titulo = ?, descricao = ?, valorServico = ?, urlImagem = ? where codigo = ?`;
      const parametros = [
        servico.titulo,
        servico.descricao,
        servico.valorServico,
        servico.urlImagem,
        servico.codigo,
      ];
      const conexao = await conectar();
      await conexao.execute(sql, parametros);
      global.poolConexoes.releaseConnection(conexao);
    }
  }
  async excluir(servico) {
    if (servico instanceof Servico) {
      const sql = `delete from Servico where codigo = ?`;
      const parametros = [servico.codigo];
      const conexao = await conectar();
      await conexao.execute(sql, parametros);
      global.poolConexoes.releaseConnection(conexao);
    }
  }

  async consultar(servico) {
    const sql = `select * from Servico`;
    const conexao = await conectar();
    const [registros, campos] = await conexao.execute(sql);
    const listaServicos = [];
    for (const registro of registros) {
      const servico = new Servico(
        registro["codigo"],
        registro["titulo"],
        registro["descricao"],
        registro["valorServico"],
        registro["urlImagem"]
      );
      listaServicos.push(servico);
    }
    return listaServicos;
  }
}
