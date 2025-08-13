import express from 'express'
// 1. 引入所有需要的模組
import { initializeTechnewsService } from './services/technews'
import TechnewsController from './controller/technews'
import { createTechnewsRouter } from './routes/technews'

async function startServer() {
	const app = express()
	app.use(express.json())

	// 2. 非同步初始化 Service
	console.log('初始化服務...')
	const technewsService = await initializeTechnewsService()

	// 3. 將 Service 注入到 Controller
	const technewsController = new TechnewsController(technewsService)

	// 4. 使用工廠函式建立 Router
	const technewsRouter = createTechnewsRouter(technewsController)

	// 5. 將設定好的 Router 掛載到應用程式上，並建議加上 API 前綴
	app.use('/api', technewsRouter)

	// 6. 所有東西都準備好之後，才啟動伺服器
	const PORT = process.env.PORT || 3001
	app.listen(PORT, () => {
		console.log(`伺服器正在 http://localhost:${PORT} 上運行`)
	})
}

startServer().catch((error) => {
	console.error('啟動伺服器失敗:', error)
	process.exit(1)
})