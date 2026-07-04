import React, { useState, useEffect } from 'react';
import { HiOutlineSearch, HiCheckCircle } from 'react-icons/hi';
import { HiDocumentText, HiDocumentCheck } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import * as api from '../services/api';

const Certificates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeForm, setActiveForm] = useState(null); // 'bonafide' or 'tc'
  const [isGenerating, setIsGenerating] = useState(false);

  // TC Form State (Fields 14-25 editable)
  const [tcFormData, setTcFormData] = useState({
    qualifiedForPromotion: 'YES',
    standardAtLeaving: '',
    languages: '',
    electiveSubjects: '',
    mediumOfInstruction: 'English',
    allFeesPaid: 'YES',
    freeConcession: 'NIL',
    scholarship: 'NIL',
    medicallyExamined: 'YES',
    lastAttendanceMonth: '',
    tcApplicationDate: dayjs().format('YYYY-MM-DD'),
    schoolDays: '',
    daysAttended: '',
    characterAndConduct: 'Good',
    dateOfEntry: dayjs().format('YYYY-MM-DD'),
    dateOfIssue: dayjs().format('YYYY-MM-DD')
  });

  // Search Students
  useEffect(() => {
    const searchStudents = async () => {
      if (!searchQuery.trim()) {
        setStudents([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await api.getStudents({ search: searchQuery });
        setStudents(response.data?.data || []);
      } catch (error) {
        console.error('Failed to search students:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchStudents, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setStudents([]);
    setActiveForm(null);
    
    // Pre-fill some TC fields
    setTcFormData(prev => ({
      ...prev,
      standardAtLeaving: student.currentClass || '',
      lastAttendanceMonth: dayjs().format('MMMM YYYY')
    }));
  };

  const handleTcChange = (e) => {
    const { name, value } = e.target;
    setTcFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateBonafide = async () => {
    setIsGenerating(true);
    try {
      const response = await api.generateBonafide(selectedStudent._id);
      
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bonafide_${selectedStudent.admissionNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Bonafide Certificate generated successfully');
      setActiveForm(null);
    } catch (error) {
      toast.error('Failed to generate Bonafide Certificate');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTC = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const response = await api.generateTC(selectedStudent._id, tcFormData);
      
      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TC_${selectedStudent.admissionNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Transfer Certificate generated successfully');
      setActiveForm(null);
    } catch (error) {
      toast.error('Failed to generate Transfer Certificate');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm relative">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Certificate Generator</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiOutlineSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Search student to generate certificate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Search Results Dropdown */}
        {searchQuery.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto left-0">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
            ) : students.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {students.map((student) => (
                  <li 
                    key={student._id} 
                    className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition"
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div>
                      <div className="font-medium text-gray-800">{student.firstName} {student.lastName}</div>
                      <div className="text-xs text-gray-500">{student.admissionNumber} • Class {student.currentClass}</div>
                    </div>
                    <div className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Select</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">No students found</div>
            )}
          </div>
        )}
      </div>

      {selectedStudent && (
        <>
          {/* Selected Student Bar */}
          <div className="bg-blue-600 rounded-xl shadow-sm p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                <p className="text-blue-100 text-sm">{selectedStudent.admissionNumber} • Class {selectedStudent.currentClass}</p>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedStudent(null); setActiveForm(null); }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm transition"
            >
              Change Student
            </button>
          </div>

          {!activeForm ? (
            /* Certificate Selection Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition cursor-pointer" onClick={() => setActiveForm('bonafide')}>
                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <HiDocumentCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Bonafide Certificate</h3>
                <p className="text-sm text-gray-500 mb-4">Generate a bonafide certificate confirming the student is currently enrolled.</p>
                <button className="text-blue-600 font-medium text-sm hover:text-blue-800">Select →</button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition cursor-pointer" onClick={() => setActiveForm('tc')}>
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <HiDocumentText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Transfer Certificate (TC)</h3>
                <p className="text-sm text-gray-500 mb-4">Generate a school transfer certificate for the student.</p>
                <button className="text-blue-600 font-medium text-sm hover:text-blue-800">Select →</button>
              </div>
            </div>
          ) : activeForm === 'bonafide' ? (
            /* Bonafide Generation Form */
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800">Generate Bonafide Certificate</h3>
                <button onClick={() => setActiveForm(null)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Cancel</button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-700">
                <p>The bonafide certificate will be generated with the following details automatically filled:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                  <li>Name: {selectedStudent.firstName} {selectedStudent.lastName}</li>
                  <li>Admission No: {selectedStudent.admissionNumber}</li>
                  <li>Father's Name: {selectedStudent.fatherName}</li>
                  <li>Class: {selectedStudent.currentClass} {selectedStudent.section ? `Sec ${selectedStudent.section}` : ''}</li>
                  <li>Date of Birth: {dayjs(selectedStudent.dateOfBirth).format('DD MMM YYYY')}</li>
                </ul>
              </div>

              <button
                onClick={generateBonafide}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium transition"
              >
                {isGenerating ? 'Generating PDF...' : 'Generate Bonafide Certificate PDF'}
              </button>
            </div>
          ) : (
            /* TC Generation Form */
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Transfer Certificate - Fill Details</h3>
                  <p className="text-sm text-gray-500">Fields 1-13 are auto-filled from the student profile.</p>
                </div>
                <button onClick={() => setActiveForm(null)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Cancel</button>
              </div>

              <form onSubmit={generateTC} className="space-y-6">
                
                {/* Auto-filled Read Only Fields */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Student Profile Data (Read-Only)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div><span className="text-gray-500">1. Admission No:</span> <span className="font-medium text-gray-800">{selectedStudent.admissionNumber}</span></div>
                    <div><span className="text-gray-500">2. Cumulative Record No:</span> <span className="font-medium text-gray-800">CR-TBD</span></div>
                    <div><span className="text-gray-500">3. Date of Admission:</span> <span className="font-medium text-gray-800">{dayjs(selectedStudent.admissionDate).format('DD-MMM-YYYY')}</span></div>
                    <div><span className="text-gray-500">4. Name of Student:</span> <span className="font-medium text-gray-800 uppercase">{selectedStudent.firstName} {selectedStudent.lastName}</span></div>
                    <div><span className="text-gray-500">5. Sex:</span> <span className="font-medium text-gray-800">{selectedStudent.gender}</span></div>
                    <div><span className="text-gray-500">6. Nationality:</span> <span className="font-medium text-gray-800">{selectedStudent.nationality}</span></div>
                    <div><span className="text-gray-500">7. Religion/Caste:</span> <span className="font-medium text-gray-800">{selectedStudent.religion} / {selectedStudent.caste}</span></div>
                    <div><span className="text-gray-500">8. Father's Name:</span> <span className="font-medium text-gray-800 uppercase">{selectedStudent.fatherName}</span></div>
                    <div><span className="text-gray-500">9. Mother's Name:</span> <span className="font-medium text-gray-800 uppercase">{selectedStudent.motherName}</span></div>
                    <div><span className="text-gray-500">10. Category:</span> <span className="font-medium text-gray-800">{selectedStudent.category}</span></div>
                    <div><span className="text-gray-500">12. Date of Birth:</span> <span className="font-medium text-gray-800">{dayjs(selectedStudent.dateOfBirth).format('DD-MMM-YYYY')}</span></div>
                    <div><span className="text-gray-500">13. Place/District:</span> <span className="font-medium text-gray-800">{selectedStudent.place || 'N/A'} / {selectedStudent.district || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Editable TC Fields */}
                <h4 className="text-sm font-semibold text-gray-700 mb-2 mt-8 uppercase tracking-wider">TC Specific Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">11. Qualified for promotion?</label>
                    <select name="qualifiedForPromotion" value={tcFormData.qualifiedForPromotion} onChange={handleTcChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none">
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">14. Standard at time of leaving</label>
                    <input type="text" name="standardAtLeaving" value={tcFormData.standardAtLeaving} onChange={handleTcChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. Class 7" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">15a. Languages Studied</label>
                    <input type="text" name="languages" value={tcFormData.languages} onChange={handleTcChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. ENGLISH, HINDI, KANNADA" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">15b. Elective Subjects</label>
                    <input type="text" name="electiveSubjects" value={tcFormData.electiveSubjects} onChange={handleTcChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. MATHEMATICS, SCIENCE" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">16. Medium of Instruction</label>
                    <input type="text" name="mediumOfInstruction" value={tcFormData.mediumOfInstruction} onChange={handleTcChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. English" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">17. All fees paid?</label>
                    <select name="allFeesPaid" value={tcFormData.allFeesPaid} onChange={handleTcChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none">
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">18. Free Concession (Nature/Period)</label>
                    <input type="text" name="freeConcession" value={tcFormData.freeConcession} onChange={handleTcChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. NIL" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">19. Scholarship (Nature/Period)</label>
                    <input type="text" name="scholarship" value={tcFormData.scholarship} onChange={handleTcChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. NIL" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">20. Medically Examined?</label>
                    <select name="medicallyExamined" value={tcFormData.medicallyExamined} onChange={handleTcChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none">
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">21. Month of last attendance</label>
                    <input type="text" name="lastAttendanceMonth" value={tcFormData.lastAttendanceMonth} onChange={handleTcChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. March 2026" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">22. TC Application Date</label>
                    <input type="date" name="tcApplicationDate" value={tcFormData.tcApplicationDate} onChange={handleTcChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">23. Number of school days</label>
                    <input type="number" name="schoolDays" value={tcFormData.schoolDays} onChange={handleTcChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. 214" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">24. Total days attended</label>
                    <input type="number" name="daysAttended" value={tcFormData.daysAttended} onChange={handleTcChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. 193" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">25. Character and Conduct</label>
                    <select name="characterAndConduct" value={tcFormData.characterAndConduct} onChange={handleTcChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none">
                      <option value="Good">Good</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Excellent">Excellent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Entry</label>
                    <input type="date" name="dateOfEntry" value={tcFormData.dateOfEntry} onChange={handleTcChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Issue</label>
                    <input type="date" name="dateOfIssue" value={tcFormData.dateOfIssue} onChange={handleTcChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button type="button" onClick={() => setActiveForm(null)} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={isGenerating} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center">
                    {isGenerating ? 'Generating...' : (
                      <>
                        <HiDocumentText className="mr-2 h-5 w-5" />
                        Generate TC PDF
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Certificates;
