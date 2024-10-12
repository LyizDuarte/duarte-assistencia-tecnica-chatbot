import { Router } from "express"
import DialogFlowController from "../controllers/dialogFlowController.js"

const routeDialogFlow = new Router()
const ctrlDialogFlow = new DialogFlowController()

routeDialogFlow.post("/", ctrlDialogFlow.processarIntencoes)

export default routeDialogFlow
