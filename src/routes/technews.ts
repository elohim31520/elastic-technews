import { Router } from 'express'
import { technewsController } from '../controller/technews'

const router = Router()

router.post('/posts', technewsController.create)
router.get('/posts/:id', technewsController.get)
router.put('/posts/:id', technewsController.update)
router.delete('/posts/:id', technewsController.delete)

export default router
