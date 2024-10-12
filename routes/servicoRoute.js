import { Router } from "express"
import ServicoController from "../controllers/ServicoController.js"

const routeServico = new Router()
const ctrlServico = new ServicoController()

routeServico.get("/", ctrlServico.consultar)
routeServico.post("/", ctrlServico.gravar)
routeServico.put("/", ctrlServico.alterar)
routeServico.delete("/", ctrlServico.excluir)

export default routeServico
