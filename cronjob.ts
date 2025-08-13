import { CronJob } from 'cron';
import { crawlTechNews } from './src/modules/crawler/technews';

interface CronConfig {
	schedule: string
	mission: () => void
}

function createCronJob({ schedule, mission }: CronConfig): CronJob {
	if (!schedule) {
		throw new Error('Schedule is required')
	}
	const job = new CronJob(schedule, mission, null, true, 'Asia/Taipei')
	return job
}

createCronJob({
	schedule: '30 11-18/3 * * *',
	mission: crawlTechNews,
})