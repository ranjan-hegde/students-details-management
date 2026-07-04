const dayjs = require('dayjs');

const generateTCTemplate = (tcData, settings = {}) => {
  const formatDate = (date) => date ? dayjs(date).format('DD-MMM-YYYY') : '';
  const dobFormat = tcData.dateOfBirth ? dayjs(tcData.dateOfBirth).format('DD-MMM-YYYY').toUpperCase() : '';
  
  const schoolName = settings.schoolName || "EduManage School";
  const schoolAddress = settings.schoolAddress || "123 Education Lane, Learning City";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      font-size: 11px;
    }
    .container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #000;
      padding: 15px;
      box-sizing: border-box;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h2 {
      margin: 0 0 5px 0;
      font-size: 16px;
      text-transform: uppercase;
    }
    .header h3 {
      margin: 0 0 10px 0;
      font-size: 12px;
      font-weight: normal;
    }
    .header h1 {
      margin: 0;
      font-size: 18px;
      text-decoration: underline;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin-bottom: 20px;
    }
    td {
      border: 1px solid #000;
      padding: 6px;
      vertical-align: top;
      word-wrap: break-word;
    }
    .col-left {
      width: 50%;
    }
    .col-right {
      width: 50%;
    }
    .label {
      font-size: 10px;
      margin-bottom: 2px;
    }
    .value {
      font-weight: bold;
      font-size: 11px;
      text-transform: uppercase;
    }
    .footer {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .footer-block {
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${schoolName}</h2>
      <h3>${schoolAddress}</h3>
      <h1>SCHOOL TRANSFER CERTIFICATE</h1>
    </div>

    <table>
      <tr>
        <td class="col-left">
          <div class="label">1. Admission No. / Enrollment No.</div>
          <div class="value">${tcData.admissionNumber || ''}</div>
        </td>
        <td class="col-right">
          <div class="label">14. Standard in which the student is studying at the time of leaving the School</div>
          <div class="value">Class ${tcData.classAtTimeOfLeaving || tcData.currentClass || ''}</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">2. Cumulative Record No. / TC No.</div>
          <div class="value">${tcData.tcNumber || ''}</div>
        </td>
        <td class="col-right" rowspan="2">
          <div class="label">15. Student opted Subjects</div>
          <div class="label">a) Languages Studied</div>
          <div class="value">KANNADA, ENGLISH, HINDI</div>
          <div class="label" style="margin-top: 4px;">b) Elective Studied</div>
          <div class="value">MATHEMATICS, SOCIAL SCIENCE, SCIENCE</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">3. Date of Admission To School</div>
          <div class="value">${formatDate(tcData.admissionDate)}</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">4. Name of the Student in full</div>
          <div class="value">${tcData.studentName || ''}</div>
        </td>
        <td class="col-right">
          <div class="label">16. Medium of Instructions</div>
          <div class="value">English</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">5. Sex</div>
          <div class="value">${tcData.gender === 'Female' ? 'Girl' : (tcData.gender === 'Male' ? 'Boy' : tcData.gender || '')}</div>
        </td>
        <td class="col-right">
          <div class="label">17. Whether the Student has paid all the fees due to School ?</div>
          <div class="value" style="text-align: right;">YES</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">6. Nationality</div>
          <div class="value">${tcData.nationality || 'Indian'}</div>
        </td>
        <td class="col-right">
          <div class="label">18. Fee Concession, if any (Nature and period to be specified)</div>
          <div class="value">NO</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">7. Religion / Caste</div>
          <div class="value">${tcData.religion || ''} / ${tcData.caste || ''} / ${tcData.subCaste || ''}</div>
        </td>
        <td class="col-right">
          <div class="label">19. Scholarship if any (Nature and period to be specified)</div>
          <div class="value">NO</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">8. Name of the Father</div>
          <div class="value">${tcData.fatherName || ''}</div>
        </td>
        <td class="col-right">
          <div class="label">20. Whether Medically Examined or not</div>
          <div class="value" style="text-align: right;">YES</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">9. Name of the Mother</div>
          <div class="value">${tcData.motherName || ''}</div>
        </td>
        <td class="col-right">
          <div class="label">21. Month of student last attendance at the School</div>
          <div class="value">${formatDate(tcData.dateOfLeaving) || ''}</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">10. Whether the candidate belongs to Schedule Caste or Schedule Tribe ?</div>
          <div class="value">${tcData.category || ''}</div>
        </td>
        <td class="col-right">
          <div class="label">22. Date on which the application for the Transfer Certificate was received</div>
          <div class="value">${formatDate(new Date())}</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">11. Whether qualified for promotion to a Higher Standard ?</div>
          <div class="value" style="text-align: right;">${tcData.result || 'YES'}</div>
        </td>
        <td class="col-right">
          <div class="label">23. Number of School Days up to the date of leaving in academic year</div>
          <div class="value">${tcData.totalWorkingDays || '214'}</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">12. Student Date of Birth (In words)</div>
          <div class="value">${dobFormat}</div>
        </td>
        <td class="col-right">
          <div class="label">24. Number of Total Days the student attended in academic year</div>
          <div class="value" style="text-align: right;">${tcData.totalPresentDays || '193'}</div>
        </td>
      </tr>
      <tr>
        <td class="col-left">
          <div class="label">13. Place : ${tcData.place || ''}</div>
          <div class="label">Taluka : ${tcData.taluka || ''}</div>
          <div class="label">District : ${tcData.district || ''}</div>
        </td>
        <td class="col-right">
          <div class="label" style="display:inline-block; width:70%;">25. Character and Conduct</div>
          <div class="value" style="display:inline-block; text-align: right; width:25%;">${tcData.conduct || 'Good'}</div>
        </td>
      </tr>
    </table>

    <div style="margin-top: 10px; display: flex; justify-content: space-between;">
      <div>Date of Entry : ________________________</div>
      <div style="font-weight: bold;">Date of Issue : ${formatDate(new Date())}</div>
    </div>

    <div class="footer">
      <div class="footer-block" style="width: 30%;">
        <br><br><br>
        <div style="border-top: 1px solid #000; padding-top: 5px; margin-top: 50px;">
          Data Entry Operator Sign
        </div>
      </div>
      <div class="footer-block" style="width: 30%;">
        <div style="border: 2px dotted #000; border-radius: 50%; width: 100px; height: 100px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
          School Seal<br>Date_______
        </div>
      </div>
      <div class="footer-block" style="width: 30%;">
        <br><br><br>
        <div style="border-top: 1px solid #000; padding-top: 5px; margin-top: 50px;">
          Headmaster Sign
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = generateTCTemplate;
