import axios from 'axios'
import _ from 'lodash'

const technewsApi = 'http://localhost:1234/technews'
const elasticsearchBulkApi = 'http://localhost:9200/_bulk' // 1. 改用 _bulk API 端點

async function fetchTechnews(page: number, size: number) {
	console.log(`正在從 API 獲取第 ${page} 頁的資料...`)
	const response = await axios.get(technewsApi, {
		params: {
			page,
			size,
		},
	})
	const data = _.get(response, 'data.data', [])
	return data
}

async function migrateMysqlToElastic() {
	let page = 1
	const size = 100

	// 2. 使用 while 迴圈持續處理直到沒有資料
	while (true) {
		const data = await fetchTechnews(page, size)

		if (data.length === 0) {
			console.log('所有資料都已成功遷移！')
			break
		}

		console.log(`準備將 ${data.length} 筆資料寫入 Elasticsearch...`)

		// 3. 建立 _bulk API 需要的 NDJSON 格式
		const bulkBody =
			data
				.map((doc: any) => {
					// 每一筆資料都包含一個 action 和 source
					const action = { index: { _index: 'technews', _id: doc.id } } // 使用 MySQL 的 id 作為 ES 的 _id
					return `${JSON.stringify(action)}\n${JSON.stringify(doc)}`
				})
				.join('\n') + '\n' // Bulk API 要求最後要有一個換行符

		try {
			const { data: bulkResponse } = await axios.post(
				elasticsearchBulkApi,
				bulkBody,
				{
					// 4. 設定正確的 Content-Type
					headers: { 'Content-Type': 'application/x-ndjson' },
				},
			)

			// 5. 檢查 bulk 回應中是否有錯誤
			if (bulkResponse.errors) {
				console.error('寫入 Elasticsearch 時發生錯誤，請檢查以下項目：')
				const firstError = bulkResponse.items.find(
					(item: any) => item.index.error,
				)
				if (firstError) {
					console.error(
						'第一個錯誤詳情:',
						JSON.stringify(firstError.index.error, null, 2),
					)
				}
				break // 發生錯誤時停止遷移
			}

			console.log(`成功索引 ${bulkResponse.items.length} 筆資料。`)
			page++
		} catch (e) {
			if (axios.isAxiosError(e)) {
				console.error('請求 Elasticsearch 失敗:', e.response?.data || e.message)
			} else {
				console.error('發生未知錯誤:', e)
			}
			break
		}
	}
}

migrateMysqlToElastic()
