import React, { useState, useEffect } from 'react';
import { HiOutlineSearch, HiCurrencyRupee, HiCheckCircle, HiExclamationCircle, HiDownload } from 'react-icons/hi';
import { HiDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import dayjs from 'dayjs';
import * as api from '../services/api.js';

const FeeManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeRecord, setFeeRecord] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [defaultFee, setDefaultFee] = useState('');

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Settings
  useEffect(() => {
    api.getSchoolSettings().then((res) => {
      if (res.data?.data?.defaultFee) {
        setDefaultFee(res.data.data.defaultFee);
      }
    }).catch(() => {});
  }, []);

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

  // Load Fee Record
  const loadFeeRecord = async (student) => {
    setSelectedStudent(student);
    setIsLoadingFee(true);
    setSearchQuery('');
    setStudents([]);
    try {
      const response = await api.getFeeRecord(student._id);
      setFeeRecord(response.data.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setFeeRecord(null); // No fee record yet
      } else {
        toast.error('Failed to load fee record');
      }
    } finally {
      setIsLoadingFee(false);
    }
  };

  const handleSetTotalFee = async (e) => {
    e.preventDefault();
    const amount = e.target.totalFee.value;
    try {
      await api.createFeeRecord({ studentId: selectedStudent._id, totalFee: amount });
      toast.success('Fee record created successfully');
      loadFeeRecord(selectedStudent);
    } catch (error) {
      toast.error('Failed to create fee record');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(paymentAmount) || Number(paymentAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createPayment({
        studentId: selectedStudent._id,
        feeRecordId: feeRecord._id,
        amount: Number(paymentAmount),
        paymentMode,
        remarks
      });
      toast.success('Payment recorded successfully');
      setPaymentAmount('');
      setRemarks('');
      setPaymentMode('cash');
      loadFeeRecord(selectedStudent);
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateReceipt = (payment) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: 'Helvetica', sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
        <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #1e3a8a; margin: 0; font-size: 28px;">EduManage School</h1>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">123 Education Lane, Learning City, State - 12345</p>
          <h2 style="margin: 15px 0 0; font-size: 20px; color: #475569;">FEE RECEIPT</h2>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px;">
          <div>
            <p style="margin: 5px 0;"><strong>Receipt No:</strong> ${payment.receiptNumber}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${dayjs(payment.paymentDate).format('DD MMM YYYY')}</p>
          </div>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h3 style="margin-top: 0; color: #1e3a8a; font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px;">Student Details</h3>
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; width: 40%; color: #64748b;">Student Name:</td>
              <td style="padding: 8px 0; font-weight: bold;">${selectedStudent.firstName} ${selectedStudent.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Admission No:</td>
              <td style="padding: 8px 0; font-weight: bold;">${selectedStudent.admissionNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Class & Section:</td>
              <td style="padding: 8px 0; font-weight: bold;">${selectedStudent.currentClass} - ${selectedStudent.section || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Father's Name:</td>
              <td style="padding: 8px 0;">${selectedStudent.fatherName}</td>
            </tr>
          </table>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 40px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead style="background-color: #f1f5f9;">
              <tr>
                <th style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Description</th>
                <th style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">Amount (Rs)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 20px; border-bottom: 1px solid #e2e8f0;">
                  Tuition Fee / Installment Payment
                  <br/>
                  <span style="font-size: 12px; color: #64748b;">Payment Mode: ${payment.paymentMode.toUpperCase()}</span>
                  ${payment.remarks ? `<br/><span style="font-size: 12px; color: #64748b;">Remarks: ${payment.remarks}</span>` : ''}
                </td>
                <td style="padding: 20px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">
                  ₹${payment.amount.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 15px 20px; font-weight: bold; text-align: right; color: #1e3a8a;">Total Paid:</td>
                <td style="padding: 15px 20px; text-align: right; font-weight: bold; font-size: 18px; color: #1e3a8a;">
                  ₹${payment.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 60px; font-size: 14px;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #cbd5e1; padding-top: 10px; width: 200px;">
              Parent's Signature
            </div>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #cbd5e1; padding-top: 10px; width: 200px;">
              Authorized Signatory
            </div>
          </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          This is a computer-generated document and does not require physical signature.
        </div>
      </div>
    `;

    html2pdf().from(element).set({
      margin: 10,
      filename: `Receipt_${payment.receiptNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm relative">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Fee Management</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <HiOutlineSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Search student by name, admission number, or mobile..."
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
                    onClick={() => loadFeeRecord(student)}
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

      {isLoadingFee && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {selectedStudent && !isLoadingFee && (
        <>
          {/* Selected Student Bar */}
          <div className="bg-blue-600 rounded-xl shadow-sm p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                <p className="text-blue-100 text-sm">{selectedStudent.admissionNumber} • Class {selectedStudent.currentClass} {selectedStudent.section ? `- ${selectedStudent.section}` : ''}</p>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedStudent(null); setFeeRecord(null); }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm transition"
            >
              Change Student
            </button>
          </div>

          {!feeRecord ? (
            /* Set Initial Fee Form */
            <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 bg-amber-50/30">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <HiExclamationCircle className="h-6 w-6 text-amber-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">No Fee Record Found</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>This student does not have a fee record yet. Please set the total fee amount to begin tracking payments.</p>
                  </div>
                  <form onSubmit={handleSetTotalFee} className="mt-4 flex max-w-sm gap-3">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                      </div>
                      <input
                        type="number"
                        name="totalFee"
                        required
                        min="1"
                        defaultValue={defaultFee}
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                        placeholder="Total Fee Amount"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Save
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Fee Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Fee</p>
                    <p className="text-2xl font-bold text-gray-800">₹{feeRecord.totalFee?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <HiCurrencyRupee className="h-6 w-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Paid Amount</p>
                    <p className="text-2xl font-bold text-emerald-600">₹{feeRecord.totalPaid?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <HiCheckCircle className="h-6 w-6" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Pending Amount</p>
                    <p className="text-2xl font-bold text-rose-600">₹{feeRecord.pendingFee?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <HiExclamationCircle className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Payment Progress</span>
                  <span className="font-bold text-blue-600">{Math.round((feeRecord.totalPaid / feeRecord.totalFee) * 100)}% Paid</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((feeRecord.totalPaid / feeRecord.totalFee) * 100))}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Record Payment Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Record Payment</h3>
                  <form onSubmit={handleRecordPayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max={feeRecord.pendingFee}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Enter amount"
                      />
                      {feeRecord.pendingFee > 0 && (
                        <p className="text-xs text-gray-500 mt-1">Max: ₹{feeRecord.pendingFee.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                      <select
                        required
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                      <textarea
                        rows="2"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. First installment"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || feeRecord.pendingFee <= 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-medium transition"
                    >
                      {isSubmitting ? 'Processing...' : feeRecord.pendingFee <= 0 ? 'Fully Paid' : 'Record Payment'}
                    </button>
                  </form>
                </div>

                {/* Payment History */}
                <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Payment History</h3>
                  
                  {feeRecord.payments && feeRecord.payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                          <tr>
                            <th className="px-4 py-3 font-medium">Receipt No</th>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Mode</th>
                            <th className="px-4 py-3 font-medium">Amount</th>
                            <th className="px-4 py-3 font-medium text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {feeRecord.payments.map((payment) => (
                            <tr key={payment._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{payment.receiptNumber}</td>
                              <td className="px-4 py-3 text-gray-600">{dayjs(payment.paymentDate).format('DD MMM YYYY')}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                                  {payment.paymentMode.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-emerald-600">₹{payment.amount.toLocaleString('en-IN')}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => generateReceipt(payment)}
                                  className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded inline-flex items-center"
                                  title="Download Receipt"
                                >
                                  <HiDownload className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <HiDocumentText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">No payments recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FeeManagement;
