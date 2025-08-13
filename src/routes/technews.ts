import { Router } from 'express'
import TechnewsController from '../controller/technews'

// 1. 改為導出一個函式，它接收 Controller 作為參數
export const createTechnewsRouter = (technewsController: TechnewsController): Router => {
	const router = Router()

	router.post('/technews', technewsController.create)
	router.get('/technews/:id', technewsController.get)
	router.put('/technews/:id', technewsController.update)
	router.delete('/technews/:id', technewsController.delete)

	return router
}
