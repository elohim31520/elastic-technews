import { Request, Response } from 'express'
import { TechnewsService } from '../services/technews'

class TechnewsController {
	private technewsService: TechnewsService

	constructor(technewsService: TechnewsService) {
		this.technewsService = technewsService
	}

	public create = async (req: Request, res: Response) => {
		try {
			const result = await this.technewsService.createPost(req.body)
			res.status(201).send(result)
		} catch (error) {
			res.status(500).send({ message: '創建Technews失敗:', error })
		}
	}

	public get = async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const result = await this.technewsService.getPost(id)
			res.status(200).send(result)
		} catch (error: any) {
			if (error.statusCode === 404) {
				return res.status(404).send({ message: '找不到指定的文章' })
			}
			res.status(500).send({ message: '獲取文章失敗', error })
		}
	}

	public update = async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			const result = await this.technewsService.updatePost(id, req.body)
			res.status(200).send(result)
		} catch (error: any) {
			if (error.statusCode === 404) {
				return res.status(404).send({ message: '找不到要更新的文章' })
			}
			res.status(500).send({ message: '更新文章失敗', error })
		}
	}

	public delete = async (req: Request, res: Response) => {
		try {
			const { id } = req.params
			await this.technewsService.deletePost(id)
			res.status(204).send()
		} catch (error) {
			res.status(500).send({ message: '刪除文章失敗', error })
		}
	}
}

export default TechnewsController
