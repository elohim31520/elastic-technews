import { Client } from '@elastic/elasticsearch'
import ELASTICSEARCH_INDEX from '../constant/elasticsearchIndex'
import { Technews } from '../types/technews'

class TechnewsService {
	private client: Client

	constructor() {
		this.client = new Client({ node: 'http://localhost:9200' })
		try {
			this.client.indices.exists({ index: ELASTICSEARCH_INDEX.TECHNEWS }).then((exists) => {
				if (!exists) {
					this.client.indices.create({ index: ELASTICSEARCH_INDEX.TECHNEWS })
					console.log(`索引 '${ELASTICSEARCH_INDEX.TECHNEWS}' 建立成功！`)
				}
			})
		} catch (error) {
			console.error('建立索引時發生錯誤:', error)
		}
	}

	async createPost({ title, web_url, publisher, release_time }: Technews) {
		try {
			const { hits } = await this.client.search({
				index: ELASTICSEARCH_INDEX.TECHNEWS,
				query: {
					match: {
						title,
					},
				},
			})

			if (hits.total && (hits.total as any).value > 0) {
				console.log(`標題為 "${title}" 的文章已存在，將不會重複創建。`)
				return hits.hits[0]
			}

			return this.client.index({
				index: ELASTICSEARCH_INDEX.TECHNEWS,
				document: {
					title,
					web_url,
					publisher,
					release_time,
					timestamp: new Date().getTime(),
				},
			})
		} catch (error) {
			console.error('創建Technews失敗:', error)
			throw error
		}
	}

	async getPost(id: string) {
		return this.client.get({
			index: ELASTICSEARCH_INDEX.TECHNEWS,
			id,
		})
	}

	async updatePost(id: string, { title, web_url, publisher, release_time }: Technews) {
		return this.client.update({
			index: ELASTICSEARCH_INDEX.TECHNEWS,
			id,
			doc: {
				title,
				web_url,
				publisher,
				release_time,
				updated_at: new Date().getTime(),
			},
		})
	}

	async deletePost(id: string) {
		return this.client.delete({
			index: ELASTICSEARCH_INDEX.TECHNEWS,
			id,
		})
	}
}

export const technewsService = new TechnewsService()
