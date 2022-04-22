const express = require("express")

const router = express.Router()

const excel = require('./excel')

const { BetaAnalyticsDataClient } = require('@google-analytics/data');

async function runReport(name) {
    const propertyId = process.env.PROPERTY_ID;

    const analyticsDataClient = new BetaAnalyticsDataClient();

    let reportData = []

    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
            {
                startDate: '7daysAgo',
                endDate: 'yesterday',
            },
        ],
        dimensions: [
            {
                name: name,
            }
        ],
        metrics: [
            {
                name: 'activeUsers'
            },
            {
                name: 'active1DayUsers'
            },
            {
                name: 'active7DayUsers'
            },
            {
                name: 'averageSessionDuration'
            },
            {
                name: 'dauPerWau'
            },
            {
                name: 'eventCountPerUser'
            },
            {
                name: 'screenPageViewsPerSession'
            },
            {
                name: 'totalUsers'
            }
        ],
    });

    console.log('Report result:', response.rows.length);
    response.rows.forEach((row, rowIndex) => {
        // console.log({ rowIndex, row })
        let data = { div: row.dimensionValues[0].value, list: [] }

        row.metricValues.forEach((e, i) => {
            switch (i) {
                case 0:
                    data.list = [{ title: '앱 사용자 수', value: e.value }]
                    break
                case 1:
                    data.list = [...data.list, { title: '1일 사용자 수', value: e.value }]
                    break
                case 2:
                    data.list = [...data.list, { title: '1주 사용자 수', value: e.value }]
                    break
                case 3:
                    data.list = [...data.list, { title: '앱 평균 사용시간(세션 유지 시간)', value: Math.round(e.value) }]
                    break
                case 4:
                    data.list = [...data.list, { title: '1주 순 이용자수(dau)', value: Math.round(e.value) }]
                    break
                case 5:
                    data.list = [...data.list, { title: '1인 당 이벤트(클릭 등) 횟수', value: Math.round(e.value) }]
                    break
                case 6:
                    data.list = [...data.list, { title: '1인 당 페이지 뷰 수', value: Math.round(e.value) }]
                    break
                case 7:
                    data.list = [...data.list, { title: '전체 유저 수', value: e.value }]
                    break
                default:
                    console.log('??', e.value)
            }
        })

        reportData = [...reportData, data]
    });
    reportData.sort((a, b) => a.div - b.div)
    // report data = [{date: 날짜, list: [{title: metric, value: value}]}]
    // console.log(JSON.stringify(reportData))

    return reportData
}

// report 데이터 가져오기
// 0 : date, 1 : unifiedScreenName
router.get('/:no', async (req, res) => {
    const no = req.params.no

    let data
    let code

    try {
        data = await runReport(no == 0 ? 'date' : 'unifiedScreenName')
        code = 1
        console.log({ data })
    } catch (e) {
        data = e
        code = -1
        console.log({ e })
    }

    res.send({ data, code })
})

// 현재 디렉토리에 analytics.xls 추가
router.get('/file/excel', async (req, res) => {
    let data
    let code

    try {
        data = {}
        data.date = await runReport('date')
        data.screen = await runReport('unifiedScreenName')
        data.finished = () => {
            console.log('Downloading is started')
            res.download('./analytics.xls')
            console.log('Downloading is finished')
        }
        excel.makeExcel(data)

        code = 1
    } catch (e) {
        data = e
        code = -1

        res.send({ data, code })
    }
})

module.exports = router