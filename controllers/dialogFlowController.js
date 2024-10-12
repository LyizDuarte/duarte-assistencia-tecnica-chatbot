import { obterCardsServicos } from "../funcoesDFLOW/funcoes.js"
import Pedido from "../models/Pedido.js"
import Servico from "../models/Servico.js"
import ItemPedido from "../models/itemPedido.js"

export default class DialogFlowController {
  async processarIntencoes(requisicao, resposta) {
    if (requisicao.method == "POST") {
      const dados = requisicao.body
      const nomeIntencao = dados.queryResult.intent.displayName
      const origem = dados?.originalDetectIntentRequest?.source

      if (nomeIntencao == "Default Welcome Intent") {
        if (origem) {
          obterCardsServicos("custom")
            .then((cards) => {
              let respostaDF = {
                fulfillmentMessages: [],
              }
              respostaDF.fulfillmentMessages.push({
                text: {
                  text: [
                    "Bem vindo a Duarte Assistência Técnica! \n",
                    "Esses são os nossas categorias de serviços: \n",
                  ],
                },
              })
              respostaDF.fulfillmentMessages.push(...cards)
              respostaDF.fulfillmentMessages.push({
                text: {
                  text: ["Qual categoria você deseja?"],
                },
              })
              resposta.status(200).json(respostaDF)
            })
            .catch((erro) => {
              let respostaDF = {
                fulfillmentMessages: [],
              }
              respostaDF.fulfillmentMessages.push({
                text: {
                  text: [
                    "Bem vindo a Duarte Outlet! \n",
                    "Não foi possível recuperar a lista de serviços. \n",
                    "O sistema está com problemas. \n",
                  ],
                },
              })
              resposta.status(200).json(respostaDF)
            })
        } else {
          obterCardsServicos("messenger")
            .then((cards) => {
              let respostaDF = {
                fulfillmentMessages: [],
              }
              respostaDF.fulfillmentMessages.push({
                payload: {
                  richContent: [
                    [
                      {
                        type: "description",
                        title: "Bem vindo a Duarte Assistência Técnica!",
                        text: [
                          "Estamos muito felizes em ter você por aqui!",
                          "Esses são nossos produtos: \n",
                        ],
                      },
                    ],
                  ],
                },
              })
              respostaDF.fulfillmentMessages[0].payload.richContent[0].push(
                ...cards
              )
              respostaDF.fulfillmentMessages[0].payload.richContent[0].push({
                type: "description",
                title: "Qual categoria você deseja?",
                text: [],
              })
              resposta.json(respostaDF)
            })
            .catch((erro) => {
              let respostaDF = {
                fulfillmentMessages: [],
              }
              respostaDF.fulfillmentMessages.push({
                payload: {
                  richContent: [
                    [
                      {
                        type: "description",
                        title: "Bem vindo a Duarte Assistência Técnica!",
                        text: [
                          "Estamos muito felizes em ter você por aqui!",
                          "Infelizmente não foi possível recuperar a lista de serviços. \n",
                          "O sistema está com problemas. \n",
                        ],
                      },
                    ],
                  ],
                },
              })
              resposta.status(200).json(respostaDF)
            })
        }
      } else if (nomeIntencao == "coletarDemanda") {
        console.log("coletarDemanda")
        if (!global.demanda) {
          global.demanda = {}
        }
        const sessaoUsuario = dados.session.split("/")[4]
        if (!global.demanda[sessaoUsuario]) {
          global.demanda[sessaoUsuario] = {
            servicos: [],
            prioridades: [],
          }
        }
        const servicosJaColetados = global.demanda[sessaoUsuario].servicos
        const prioridadesJaColetadas = global.demanda[sessaoUsuario].prioridades
        const novosServicos = dados.queryResult.parameters.servico
        const novasPrioridades = dados.queryResult.parameters.prioridade
        global.demanda[sessaoUsuario].servicos = [
          ...servicosJaColetados,
          ...novosServicos,
        ]
        global.demanda[sessaoUsuario].prioridades = [
          ...prioridadesJaColetadas,
          ...novasPrioridades,
        ]
      } else if (nomeIntencao == "confirmaAtendimento") {
        console.log("confirmaAtendimento")
        const nomeUsuario =
          dados.queryResult.outputContexts[0].parameters["person.original"]
        const emailUsuario =
          dados.queryResult.outputContexts[0].parameters["email.original"]
        const telefoneUsuario =
          dados.queryResult.outputContexts[0].parameters["phone-number"]
        const enderecoUsuario =
          dados.queryResult.outputContexts[0].parameters[
            "street-address.original"
          ]
        const sessaoUsuario = dados.session.split("/")[4]
        const listaItens = []
        let prazoTotal = 0
        let prioridades = ""
        for (
          let i = 0;
          i < global.demanda[sessaoUsuario].servicos.length;
          i++
        ) {
          const servico = new Servico()
          const servicoSelecionado = await servico.consultarTitulo(
            global.demanda[sessaoUsuario].servicos[i]
          )
          const servicoPrazo = servicoSelecionado[0].prazo
          const prioridade = global.demanda[sessaoUsuario].prioridades[i]
          const itemPedido = new ItemPedido(
            servicoSelecionado[0],
            prioridade,
            servicoSelecionado[0].valorServico
          )
          listaItens.push(itemPedido)
          prazoTotal += servicoPrazo
          prioridades += `Serviço: Assistência de ${servicoSelecionado[0].titulo}\n Prioridade: ${prioridade}\n`
        }

        const pedido = new Pedido(
          0,
          nomeUsuario,
          emailUsuario,
          telefoneUsuario,
          enderecoUsuario,
          0,
          listaItens
        )
        pedido
          .gravar()
          .then(() => {
            if (origem) {
              let respostaDF = {
                fulfillmentMessages: [],
              }
              respostaDF.fulfillmentMessages.push({
                text: {
                  text: [
                    "Seu pedido foi registrado com sucesso! \n",
                    "Protocolo nº " +
                      pedido.codigo +
                      "\nTécnico: Luiz Duarte " +
                      "\nPrazo: " +
                      prazoTotal +
                      " horas\n" +
                      prioridades +
                      "Obrigado pela preferência. \n",
                  ],
                },
              })
              resposta.status(200).json(respostaDF)
            } else {
              let respostaDF = {
                fulfillmentMessages: [],
              }
              respostaDF.fulfillmentMessages.push({
                payload: {
                  richContent: [
                    [
                      {
                        type: "description",
                        title: "Pedido gravado com sucesso!",
                        text: [
                          "Seu pedido foi registrado com sucesso! \n",
                          "Protocolo nº " +
                            pedido.codigo +
                            "\nTécnico: Luiz Duarte " +
                            "\nPrazo: " +
                            prazoTotal +
                            " horas\n" +
                            prioridades +
                            "Obrigado pela preferência. \n",
                        ],
                      },
                    ],
                  ],
                },
              })
              resposta.status(200).json(respostaDF)
            }
          })
          .catch((erro) => {
            if (origem) {
              let respostaDF = {
                fulfillmentMessages: [],
              }
              respostaDF.fulfillmentMessages.push({
                text: {
                  text: [
                    "Não foi possível registrar o seu pedido! \n",
                    "Entre em contato conosco pelo whatsapp. \n",
                    "Erro: " + erro.message,
                  ],
                },
              })
              resposta.status(200).json(respostaDF)
            } else {
              let respostaDF = {
                fulfillmentMessages: [],
              }
              respostaDF.fulfillmentMessages.push({
                payload: {
                  richContent: [
                    [
                      {
                        type: "description",
                        title: "Não foi possível registrar seu pedido!",
                        text: [
                          "Entre com contato conosco pelo whatsapp! \n",
                          "Erro: " + erro.message,
                        ],
                      },
                    ],
                  ],
                },
              })
              resposta.status(200).json(respostaDF)
            }
          })
      } else if (nomeIntencao == "consultarAtendimento") {
        console.log("consultarAtendimento")
        const protocoloCodigo = dados.queryResult.parameters.number
        const pedido = new Pedido()
        try {
          const registros = await pedido.consultarAtendimento(protocoloCodigo)
          if (registros.length > 0) {
            const registro = registros[0]
            const respostaDF = {
              fulfillmentMessages: [
                {
                  text: {
                    text: [
                      `Detalhes do Atendimento:\n`,
                      `Código: ${registro.codigo}\n`,
                      `Nome: ${registro.nome}\n`,
                      `Email: ${registro.email}\n`,
                      `Telefone: ${registro.telefone}\n`,
                      `Endereço: ${registro.endereco}\n`,
                      `Descrição: ${registro.descricao}\n`,
                      `Prazo: ${registro.prazo} horas\n`,
                      `Valor do Serviço: R$${registro.valorServico}\n`,
                    ],
                  },
                },
              ],
            }
            resposta.status(200).json(respostaDF)
          } else {
            resposta.status(404).json({
              fulfillmentMessages: [
                {
                  text: {
                    text: [
                      `Pedido não encontrado. Verifique o código e tente novamente.`,
                    ],
                  },
                },
              ],
            })
          }
        } catch (erro) {
          console.error("erro ao consultar o atendimento", erro)
          resposta.status(500).json({
            fulfillmentMessages: [
              {
                text: {
                  text: [`Erro ao consultar atendimento: ${erro.message}.`],
                },
              },
            ],
          })
        }
      }
    } else {
      resposta.status(405).send("Método não permitido.")
    }
  }
}
