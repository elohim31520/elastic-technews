import express from 'express'
import technewsRoutes from './routes/technews'

const app = express()
const port = 3001

app.use(express.json())
app.use(technewsRoutes)

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`)
})
