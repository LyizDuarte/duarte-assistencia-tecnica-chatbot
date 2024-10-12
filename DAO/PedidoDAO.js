import Pedido from "../models/Pedido.js"
import conectar from "./conexao.js"

export default class PedidoDAO {
  constructor() {
    this.init()
  }
  async init() {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS pedido(
                codigo int not null primary key auto_increment,
                nome varchar(100) not null,
                email varchar(200) not null,
                telefone varchar(50) not null,
                endereco varchar(250) not null,
                valorTotal decimal(10,2) not null
            )`
      const conexao = await conectar()
      await conexao.execute(sql)
      const sql2 = `CREATE TABLE IF NOT EXISTS pedido_servico(
                pedido_codigo int not null,
                servico_codigo int not null,
                constraint fk_pedido foreign key (pedido_codigo) references pedido(codigo),
                constraint fk_servico foreign key (servico_codigo) references servico(codigo),
                valorUnitario decimal(10,2) not null
            );`
      await conexao.execute(sql2)
      global.poolConexoes.releaseConnection(conexao)
      console.log("Banco de dados de pedido iniciado com sucesso!")
    } catch (erro) {
      console.log("Erro ao iniciar o banco de dados: " + erro.message)
    }
  }

  async gravar(pedido) {
    if (pedido instanceof Pedido) {
      const sql = `INSERT INTO pedido (nome, email, telefone, endereco, valorTotal) VALUES (?, ?, ?, ?, ?)`
      const parametros = [
        pedido.nome,
        pedido.email,
        pedido.telefone,
        pedido.endereco,
        pedido.valorTotal,
      ]
      const conexao = await conectar()
      const resultado = await conexao.execute(sql, parametros).catch((err) => {
        console.error("Erro ao gravar pedido:", err.message)
      })
      if (resultado) {
        pedido.codigo = resultado[0].insertId
        console.log("Pedido gravado com sucesso! Código:", pedido.codigo)

        for (const item of pedido.itensPedido) {
          if (!item.servico || !item.servico.codigo || !item.prioridade) {
            console.log("Item inválido:", item)
            continue // Pula itens inválidos
          }
          const sql2 = `INSERT INTO pedido_servico(pedido_codigo, servico_codigo, valorUnitario) VALUES(?, ?, ?)`
          const parametros = [
            pedido.codigo,
            item.servico.codigo,
            item.servico.valorServico,
          ]
          await conexao.execute(sql2, parametros).catch((err) => {
            console.error("Erro ao gravar item no pedido_servico:", err.message)
          })
        }
      }

      global.poolConexoes.releaseConnection(conexao)
    } else {
      console.log("O objeto passado não é uma instância de Pedido.")
    }
  }

  async consultarAtendimento(codigo) {
    const sql = `
      SELECT 
        p.codigo,
        p.nome,
        p.email,
        p.telefone,
        p.endereco,
        s.descricao,
        s.prazo,
        s.valorServico
      FROM 
        pedido p
      INNER JOIN 
        pedido_servico ps ON p.codigo = ps.pedido_codigo
      INNER JOIN 
        servico s ON ps.servico_codigo = s.codigo
      WHERE 
        p.codigo = ${codigo}
    `
    const conexao = await conectar()
    const [registros] = await conexao.execute(sql)
    global.poolConexoes.releaseConnection(conexao)
    return registros
  }
}
