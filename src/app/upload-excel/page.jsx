'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

const UploadPage = () => {
  const [excelFile, setExcelFile] = useState(null);
  const [excelFileError, setExcelFileError] = useState(null);
  const [excelData, setExcelData] = useState(null);

  const fileType = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

  const handleFile = (e) => {
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile && fileType.includes(selectedFile.type)) {
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          setExcelFileError(null);
          setExcelFile(e.target.result);
        };
      } else {
        setExcelFileError('Please select only Excel file types');
        setExcelFile(null);
      }
    } else {
      console.log('Please select a file');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, { type: 'buffer' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(data);
    } else {
      setExcelData(null);
    }
  };

  return (
    <div className="container">
      {/* Upload File Section */}
      <div className='form'>
        <form className='form-group' autoComplete="off" onSubmit={handleSubmit}>
          <label><h5>Upload Excel file</h5></label>
          <br />
          <input type='file' className='form-control' onChange={handleFile} required />
          {excelFileError && <div className='text-danger' style={{ marginTop: '5px' }}>{excelFileError}</div>}
          <button type='submit' className='btn btn-success' style={{ marginTop: '5px' }}>Submit</button>
        </form>
      </div>

      <br />
      <hr />

      {/* View File Section */}
      <h5>View Excel file</h5>
      <div className='viewer'>
        {excelData === null && <>No file selected</>}
        {excelData !== null && (
          <div className='table-responsive'>
            <table className='table'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Gender</th>
                  <th>Country</th>
                  <th>Age</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {excelData.map((individualExcelData, index) => (
                  <tr key={index}>
                    <td>{individualExcelData.Id}</td>
                    <td>{individualExcelData.FirstName}</td>
                    <td>{individualExcelData.LastName}</td>
                    <td>{individualExcelData.Gender}</td>
                    <td>{individualExcelData.Country}</td>
                    <td>{individualExcelData.Age}</td>
                    <td>{individualExcelData.Date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
