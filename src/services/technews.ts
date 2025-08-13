import { Client } from '@elastic/elasticsearch'
import ELASTICSEARCH_INDEX from '../constant/elasticsearchIndex'
import { Technews } from '../types/technews'

interface TechnewsMigrate extends Technews {
	id?: string
	updatedAt?: number
	createdAt?: number
}

// 加上 export 關鍵字
export class TechnewsService {
	private client: Client

	// 1. 將 constructor 改為 private，強制使用者透過靜態方法來建立實例
	private constructor(client: Client) {
		this.client = client
	}

	// 2. 建立一個靜態的、非同步的工廠方法
	public static async create(): Promise<TechnewsService> {
		const client = new Client({ node: 'http://localhost:9200' })
		try {
			const exists = await client.indices.exists({ index: ELASTICSEARCH_INDEX.TECHNEWS })
			if (!exists) {
				await client.indices.create({ index: ELASTICSEARCH_INDEX.TECHNEWS })
				console.log(`索引 '${ELASTICSEARCH_INDEX.TECHNEWS}' 建立成功！`)
			}
		} catch (error) {
			console.error('初始化索引時發生錯誤:', error)
			// 根據您的錯誤處理策略，您可能會想在這裡拋出錯誤
			throw error
		}
		return new TechnewsService(client)
	}

	async createPost(params: TechnewsMigrate) {
		try {
			const { title } = params
			const { hits } = await this.client.search({
				index: ELASTICSEARCH_INDEX.TECHNEWS,
				query: {
					// 1. 改為 term 查詢，並使用 .keyword 子欄位進行精確、未分詞的比對
					term: {
						'title.keyword': title,
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
					...params,
					// 2. 統一使用 createdAt 和 updatedAt
					createdAt: new Date().getTime(),
					updatedAt: new Date().getTime(),
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
				// 3. 將 updated_at 改為 updatedAt
				updatedAt: new Date().getTime(),
			},
		})
	}

	async deletePost(id: string) {
		return this.client.delete(
			{
				index: ELASTICSEARCH_INDEX.TECHNEWS,
				id,
			},
			// 修正：ignore 參數應作為 request options 傳遞
			{
				ignore: [404],
			},
		)
	}
}

// 4. 修改 export 的方式，改為導出一個非同步的工廠函式
export const initializeTechnewsService = async () => {
	return await TechnewsService.create()
}

// 由於 service 的建立現在是非同步的，我們不能再直接導出一個單例
// 這需要在應用程式的進入點進行調整
// export const technewsService = new TechnewsService()

