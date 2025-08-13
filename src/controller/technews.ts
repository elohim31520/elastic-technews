import { Request, Response } from 'express'
import { technewsService } from '../services/technews'

class TechnewsController {
	async create(req: Request, res: Response) {
		try {
			const result = await technewsService.createPost(req.body);
			res.status(201).send(result);
		} catch (error) {
			res.status(500).send({ message: '創建Technews失敗:', error });
		}
	}

	async get(req: Request, res: Response) {
		try {
			const { id } = req.params
			const result = await technewsService.getPost(id)
			res.status(200).send(result)
		} catch (error) {
			res.status(500).send({ message: 'Error getting post', error })
		}
	}

	async update(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const result = await technewsService.updatePost(id, req.body);
			res.status(200).send(result);
		} catch (error) {
			res.status(500).send({ message: 'Error updating post', error });
		}
	}

	async delete(req: Request, res: Response) {
		try {
			const { id } = req.params
			await technewsService.deletePost(id)
			res.status(204).send()
		} catch (error) {
			res.status(500).send({ message: 'Error deleting post', error })
		}
	}
}

export const technewsController = new TechnewsController()
