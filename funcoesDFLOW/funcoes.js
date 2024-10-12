import Servico from "../models/Servico.js"

export function criarMessengerCard() {
  return {
    type: "info",
    title: "",
    subtitle: "",
    image: {
      src: {
        rawUrl: "",
      },
    },
    actionLink: "",
  }
} //fim da função criarMessengerCard

export function criarCustomCard() {
  //exibir nos ambientes padrões, tais como: ambiente de teste do DialogFlow, slack, etc
  return {
    card: {
      title: "",
      subtitle: "",
      imageUri: "",
      buttons: [
        {
          text: "botão",
          postback: "",
        },
      ],
    },
  }
} // fim da função criarCustomCard

export async function obterCardsServicos(tipoCard = "custom") {
  const listaCardsServicos = []
  const servicoModel = new Servico()
  const servicos = await servicoModel.consultar()

  for (const servico of servicos) {
    let card
    if (tipoCard == "custom") {
      card = criarCustomCard()
      card.card.title = servico.titulo
      card.card.subtitle = servico.descricao
      card.card.imageUri = servico.urlImagem
      card.card.buttons[0].postback =
        "https://www.getninjas.com.br/assistencia-tecnica"
    } else {
      card = criarMessengerCard()
      card.title = servico.titulo
      card.subtitle = servico.descricao
      card.image.src.rawUrl = servico.urlImagem
      card.actionLink = "https://www.getninjas.com.br/assistencia-tecnica"
    }
    listaCardsServicos.push(card)
  }

  return listaCardsServicos
}
