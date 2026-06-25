import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiArrowLeft,
  HiPencilSquare,
  HiTrash,
  HiArrowDownTray,
  HiDocumentText,
  HiCurrencyRupee,
  HiUserCircle,
  HiAcademicCap,
  HiMapPin,
  HiPhone,
  HiEnvelope,
  HiCheckCircle,
  HiXMark,
  HiArrowPath,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Header from '../components/layout/Header';
import {
  getStudent,
  getDocuments,
  getFeeRecord,
  getPayments,
  createPayment,
  getCertificates,
  generateBonafide,
  generateTC,
  deleteDocument,
} from '../services/api';

const tabs = ['Profile Info', 'Documents', 'Fee Details', 'Certificates'];

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-medium text-gray-800 mt-1">{value || '—'}</p>
  </div>
);

const statusBadge = (status) => {
  const styles = {
    Active: 'bg-green-100 text-green-700',
    Inactive: 'bg-red-100 text-red-700',
    Transferred: 'bg-orange-100 text-orange-700',
  };
  return styles[status] || 'bg-gray-100 text-gray-700';
};

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [feeRecord, setFeeRecord] = useState(null);
  const [payments, setPayments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: '', paymentMode: 'cash', remarks: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  useEffect(() => {
    if (student) {
      if (activeTab === 1) fetchDocuments();
      if (activeTab === 2) fetchFeeDetails();
      if (activeTab === 3) fetchCertificates();
    }
  }, [activeTab, student]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const res = await getStudent(id);
      setStudent(res.data.data || res.data);
    } catch (error) {
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await getDocuments(id);
      setDocuments(res.data.documents || res.data || []);
    } catch {
      setDocuments([]);
    }
  };

  const fetchFeeDetails = async () => {
    try {
      const [feeRes, payRes] = await Promise.all([getFeeRecord(id), getPayments(id)]);
      setFeeRecord(feeRes.data.feeRecord || feeRes.data);
      setPayments(payRes.data.payments || payRes.data || []);
    } catch {
      setFeeRecord(null);
      setPayments([]);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await getCertificates(id);
      setCertificates(res.data.certificates || res.data || []);
    } catch {
      setCertificates([]);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentData.amount || Number(paymentData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      await createPayment({ studentId: id, ...paymentData, amount: Number(paymentData.amount) });
      toast.success('Payment recorded successfully');
      setShowPaymentForm(false);
      setPaymentData({ amount: '', paymentMode: 'cash', remarks: '' });
      fetchFeeDetails();
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateBonafide = async () => {
    try {
      const res = await generateBonafide(id);
      toast.success('Bonafide certificate generated');
      fetchCertificates();
      if (res.data.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
      }
    } catch {
      toast.error('Failed to generate certificate');
    }
  };

  const handleGenerateTC = async () => {
    try {
      const res = await generateTC(id, {});
      toast.success('Transfer certificate generated');
      fetchCertificates();
      if (res.data.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
      }
    } catch {
      toast.error('Failed to generate TC');
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(docId);
      toast.success('Document deleted');
      fetchDocuments();
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  if (loading) {
    return (
      <div>
        <Header title="Student Details" />
        <div className="bg-white rounded-xl shadow-sm p-8 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full" />
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div>
        <Header title="Student Details" />
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <HiUserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Student not found</p>
          <Link to="/students" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
            ← Back to Students
          </Link>
        </div>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalFee = feeRecord?.totalFee || 0;
  const pendingAmount = totalFee - totalPaid;

  return (
    <div>
      <Header title="Student Details" subtitle={`${student.firstName} ${student.lastName}`} />

      {/* Back Button */}
      <Link to="/students" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-6 transition">
        <HiArrowLeft className="w-4 h-4" />
        Back to Students
      </Link>

      {/* Student Header Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {(student.firstName?.[0] || '')}{(student.lastName?.[0] || '')}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">
              {student.firstName} {student.lastName}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">Adm No:</span> {student.admissionNumber}
              </span>
              <span className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">Class:</span> {student.currentClass}-{student.section || 'N/A'}
              </span>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(student.status)}`}>
                {student.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`pb-3 text-sm font-medium transition border-b-2 ${
                activeTab === index
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 0 && (
        <div className="space-y-6">
          {/* Student Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HiUserCircle className="w-5 h-5 text-blue-600" />
              Student Information
            </h3>
            <div className="grid grid-cols-4 gap-6">
              <InfoField label="First Name" value={student.firstName} />
              <InfoField label="Last Name" value={student.lastName} />
              <InfoField label="Date of Birth" value={student.dob ? dayjs(student.dob).format('DD MMM YYYY') : ''} />
              <InfoField label="Gender" value={student.gender} />
              <InfoField label="Blood Group" value={student.bloodGroup} />
              <InfoField label="Religion" value={student.religion} />
              <InfoField label="Caste" value={student.caste} />
              <InfoField label="Sub-Caste" value={student.subCaste} />
              <InfoField label="Nationality" value={student.nationality} />
              <InfoField label="Aadhaar" value={student.aadhaarNumber} />
              <InfoField label="Category" value={student.category} />
              <InfoField label="Roll Number" value={student.rollNumber} />
            </div>
          </div>

          {/* Parent Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HiPhone className="w-5 h-5 text-blue-600" />
              Parent / Guardian Information
            </h3>
            <div className="grid grid-cols-4 gap-6">
              <InfoField label="Father's Name" value={student.fatherName} />
              <InfoField label="Father's Occupation" value={student.fatherOccupation} />
              <InfoField label="Father's Mobile" value={student.fatherMobile} />
              <InfoField label="Father's Email" value={student.fatherEmail} />
              <InfoField label="Mother's Name" value={student.motherName} />
              <InfoField label="Mother's Occupation" value={student.motherOccupation} />
              <InfoField label="Mother's Mobile" value={student.motherMobile} />
            </div>
          </div>

          {/* Address Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HiMapPin className="w-5 h-5 text-blue-600" />
              Address Details
            </h3>
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-2">
                <InfoField label="Address" value={student.address} />
              </div>
              <InfoField label="City" value={student.city} />
              <InfoField label="State" value={student.state} />
              <InfoField label="PIN Code" value={student.pinCode} />
              <InfoField label="Place" value={student.place} />
              <InfoField label="Taluka" value={student.taluka} />
              <InfoField label="District" value={student.district} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div>
          {documents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center">
              <HiDocumentText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No documents uploaded</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc._id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium uppercase">
                      {doc.type || doc.documentType || 'Document'}
                    </span>
                    <button
                      onClick={() => handleDeleteDoc(doc._id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                  {doc.url && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      <img src={doc.url} alt={doc.type} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 truncate">{doc.filename || doc.originalName || 'Document'}</p>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 mt-2 font-medium"
                    >
                      <HiArrowDownTray className="w-4 h-4" />
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-6">
          {/* Fee Summary Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Total Fee</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalFee)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500">Pending Amount</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(pendingAmount)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {totalFee > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Payment Progress</span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round((totalPaid / totalFee) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalPaid / totalFee) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Record Payment Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
            >
              <HiCurrencyRupee className="w-5 h-5" />
              Record Payment
            </button>
          </div>

          {/* Payment Form */}
          {showPaymentForm && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Record New Payment</h3>
              <form onSubmit={handlePayment} className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount (₹)</label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                    placeholder="Enter amount"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Payment Mode</label>
                  <select
                    value={paymentData.paymentMode}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Remarks</label>
                  <input
                    type="text"
                    value={paymentData.remarks}
                    onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
                    placeholder="Optional remarks"
                  />
                </div>
                <div className="col-span-3 flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <HiArrowPath className="w-4 h-4 animate-spin" /> : <HiCheckCircle className="w-4 h-4" />}
                    Submit Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
            </div>
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <HiCurrencyRupee className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No payments recorded yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Receipt No</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Mode</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600">{dayjs(payment.createdAt || payment.date).format('DD MMM YYYY')}</td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{payment.receiptNumber || payment._id?.slice(-6)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{payment.paymentMode}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{payment.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div className="space-y-6">
          {/* Generate Buttons */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Bonafide Certificate</h3>
              <p className="text-sm text-gray-500 mb-4">Generate a bonafide certificate confirming the student's enrollment.</p>
              <button
                onClick={handleGenerateBonafide}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
              >
                <HiDocumentText className="w-5 h-5" />
                Generate Bonafide
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Transfer Certificate</h3>
              <p className="text-sm text-gray-500 mb-4">Generate a transfer certificate for the student leaving the school.</p>
              <button
                onClick={handleGenerateTC}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
              >
                <HiDocumentText className="w-5 h-5" />
                Generate TC
              </button>
            </div>
          </div>

          {/* Generated Certificates List */}
          {certificates.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Generated Certificates</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {certificates.map((cert) => (
                  <div key={cert._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <HiDocumentText className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{cert.type || 'Certificate'}</p>
                        <p className="text-xs text-gray-500">Generated on {dayjs(cert.createdAt).format('DD MMM YYYY')}</p>
                      </div>
                    </div>
                    {cert.downloadUrl && (
                      <a
                        href={cert.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1.5 text-sm font-medium"
                      >
                        <HiArrowDownTray className="w-4 h-4" />
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
