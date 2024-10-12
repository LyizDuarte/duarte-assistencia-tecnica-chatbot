import Servico from "../models/Servico.js";

export default class ServicoController {
  //a classe ira manipular requisicoes HTTP

  gravar(req, res) {
    if (req.method == "POST" && req.is("application/json")) {
      const dados = req.body;
      const titulo = dados.titulo;
      const descricao = dados.descricao;
      const prazo = dados.prazo;
      const valorServico = dados.valorServico;
      const urlImagem = dados.urlImagem;

      if (titulo && descricao && prazo && valorServico > 0 && urlImagem) {
        const servico = new Servico(
          0,
          titulo,
          descricao,
          prazo,
          valorServico,
          urlImagem
        );
        servico
          .gravar()
          .then(() => {
            res.status(201).json({
              status: true,
              message: "Serviço gravado com sucesso",
            });
          })
          .catch((erro) => {
            res.status(500).json({
              status: false,
              message: "Erro ao tentar gravar o servico: " + erro,
            });
          });
      } else {
        res
          .status(400)
          .json({ status: false, message: "Informe os dados corretamente" });
      }
    } else {
      res.status(400).json({
        status: false,
        message: "Requisicao invalida. Método não permitido",
      });
    }
  }

  alterar(req, res) {
    if (req.method == "PUT" && req.is("application/json")) {
      const dados = req.body;
      const codigo = dados.codigo;
      const titulo = dados.titulo;
      const descricao = dados.descricao;
      const prazo = dados.prazo;
      const valorServico = dados.valorServico;
      const urlImagem = dados.urlImagem;

      if (
        codigo &&
        codigo > 0 &&
        titulo &&
        descricao &&
        prazo &&
        valorServico > 0 &&
        urlImagem 
      ) {
        const servico = new Servico(
          codigo,
          titulo,
          descricao,
          prazo,
          valorServico,
          urlImagem
        );
        servico
          .alterar()
          .then(() => {
            res.status(201).json({
              status: true,
              message: "Serviço alterado com sucesso",
            });
          })
          .catch((erro) => {
            res.status(500).json({
              status: false,
              message: "Erro ao tentar alterar o servico: " + erro,
            });
          });
      } else {
        res
          .status(400)
          .json({ status: false, message: "Informe os dados corretamente" });
      }
    } else {
      res.status(400).json({
        status: false,
        message: "Requisicao invalida. Método não permitido",
      });
    }
  }

  excluir(req, res) {
    if (req.method == "DELETE" && req.is("application/json")) {
      const dados = req.body;
      const codigo = dados.codigo;
      if (codigo && codigo > 0) {
        const servico = new Servico(codigo);
        servico
          .excluir()
          .then(() => {
            res.status(201).json({
              status: true,
              message: "Serviço excluído com sucesso",
            });
          })
          .catch((erro) => {
            res.status(500).json({
              status: false,
              message: "Erro ao tentar excluir o servico: " + erro,
            });
          });
      }
    } else {
      res.status(400).json({
        status: false,
        message: "Requisicao invalida. Método não permitido",
      });
    }
  }
  consultar(req, res) {
    if (req.method == "GET") {
      const servico = new Servico();
      servico
        .consultar()
        .then((listaDeServicos) => {
          res.status(200).json({ status: true, listaDeServicos: listaDeServicos });
        })
        .catch((erro) => {
          res.status(500).json({
            status: false,
            message: "Erro ao tentar consultar os servicos: " + erro,
          });
        });
    } else {
      res.status(400).json({
        status: false,
        message: "Requisicao invalida. Método não permitido",
      });
    }
  }
}
