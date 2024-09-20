import { obterCardsServicos } from "../funcoesDFLOW/funcoes.js";

export default class DialogFlowController {
  processarIntencoes(req, res) {
    if (req.method == "POST") {
      const nomeIntencao = req.body.queryResult.intent.displayName;
      if (nomeIntencao == "Default Welcome Intent") {
        const origem = req.body?.originalDetectIntentRequest?.source;
        if (origem) {
          // está vindo do ambiente padrao do DialogFlow
          obterCardsServicos("custom")
            .then((listaCards) => {
              let respostaDF = {
                fulfillmentMessages: [],
              };
              respostaDF.fulfillmentMessages.push({
                text: {
                  text: [
                    "Bem vindo a Duarte Outlet! \n",
                    "Esses são os nossos produtos na loja: \n",
                  ],
                },
              });
              respostaDF.fulfillmentMessages.push(...listaCards);
              respostaDF.fulfillmentMessages.push({
                text: {
                  text: ["Qual produto você deseja?"],
                },
              });
              res.status(200).json(respostaDF);
            })
            .catch((erro) => {
              let respostaDF = {
                fulfillmentMessages: [],
              };
              respostaDF.fulfillmentMessages.push({
                text: {
                  text: [
                    "Bem vindo a Duarte Outlet! \n",
                    "Não foi possivel recuperar a lista de produtos. \n",
                    "O sistema está com problemas.",
                  ],
                },
              });
              res.status(200).json(respostaDF);
            });
        } else {
          // está vindo do messenger
          obterCardsServicos("messenger")
            .then((listaCards) => {
              let respostaDF = {
                fulfillmentMessages: [],
              };
              respostaDF.fulfillmentMessages.push({
                payload: {
                  richContent: [
                    [
                      {
                        type: "description",
                        title: "Bem vindo a Duarte Outlet!",
                        text: [
                          "Estamos muito felizes em ter você por aqui!",
                          "Esses são os nossos produtos na loja: \n",
                        ],
                      },
                    ],
                  ],
                },
              });
              respostaDF.fulfillmentMessages[0].payload.richContent[0].push(
                ...listaCards
              );
              respostaDF.fulfillmentMessages[0].payload.richContent[0].push({
                type: "description",
                title: "Qual produto você deseja?",
                text: [],
              });
              res.status(200).json(respostaDF);
            })
            .catch((erro) => {
              console.error("Erro durante a obtenção dos cards:", erro);
              let respostaDF = {
                fulfillmentMessages: [],
              };
              respostaDF.fulfillmentMessages.push({
                payload: {
                  richContent: [
                    [
                      {
                        type: "description",
                        title: "Bem vindo a Duarte Outlet!",
                        text: [
                          "Não foi possivel recuperar a lista de produtos. \n",
                          "O sistema está com problemas. \n",
                        ],
                      },
                    ],
                  ],
                },
              });
              res.status(200).json(respostaDF);
            });
        }
      }
    }
  }
}
