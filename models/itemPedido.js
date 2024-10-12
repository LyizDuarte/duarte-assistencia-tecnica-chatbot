export default class ItemPedido {
  #servico
  #prioridade
  #valorUnitario
  constructor(servico, prioridade, valorUnitario) {
    this.#servico = servico
    this.#prioridade = prioridade
    this.#valorUnitario = valorUnitario
  }

  get servico() {
    return this.#servico
  }

  set servico(servico) {
    this.#servico = servico
  }

  get prioridade() {
    return this.#prioridade
  }

  set prioridade(prioridade) {
    this.#prioridade = prioridade
  }

  get valorUnitario() {
    return this.#valorUnitario
  }

  set valorUnitario(valorUnitario) {
    this.#valorUnitario = valorUnitario
  }
}
