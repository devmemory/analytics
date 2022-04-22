const reader = require('xlsx')

exports.makeExcel = (data) => {
    const workBook = handler.getWorkBook()
    // 날짜별 통계값 엑셀 형태로
    const dateSheet = handler.getWorksheet(data.date)
    // 페이지별 통계값 엑셀 형태로
    const screenSheet = handler.getWorksheet(data.screen)

    // sheet에 추가
    reader.utils.book_append_sheet(workBook, dateSheet, handler.getSheetName('날짜'))
    reader.utils.book_append_sheet(workBook, screenSheet, handler.getSheetName('페이지'))

    // excel 파일 생성
    // reader.writeFile(workBook, handler.getExcelFileName())
    reader.writeFileAsync(handler.getExcelFileName(), workBook, null, () => {
        console.log('Finished writing')
        data.finished()
    })
}

const handler = {
    getWorkBook: () => {
        return reader.utils.book_new()
    },
    getExcelFileName: () => {
        return `analytics.xls`;
    },
    getSheetName: (name) => {
        // 공백이면 순서대로
        // ex: sheet1, sheet2
        return name;
    },
    getExcelData: (data) => {

        let sheetData = [['']]

        data.forEach((row, rowIndex) => {
            console.log({ row, rowIndex })
            sheetData[0] = [...sheetData[0], row.div]

            row.list.forEach((e, i) => {
                console.log({ e, i })
                if (rowIndex === 0) {
                    sheetData[i + 1] = [e.title, e.value]
                } else {
                    sheetData[i + 1] = [...sheetData[i + 1], e.value]
                }
            })
        })

        return sheetData;
    },
    getWorksheet: (data) => {
        console.log('getWorksheet : ', data.length)
        return reader.utils.aoa_to_sheet(handler.getExcelData(data));
    }
}