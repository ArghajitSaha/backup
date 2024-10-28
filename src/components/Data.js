import { IndividualData } from './IndividualData.js'

export const Data = ({excelData}) => {
    return excelData.map((individualExcelData)=>(
        <tr key={individualExcelData.Id}>
            <IndividualData individualExcelData={individualExcelData}/>
        </tr>        
    ))
}