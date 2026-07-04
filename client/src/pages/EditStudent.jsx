import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiCloudArrowUp,
  HiCheckCircle,
  HiArrowPath,
  HiDocumentPlus,
  HiXMark,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import { getStudent, updateStudent, uploadDocuments } from '../services/api';

const initialFormData = {
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  bloodGroup: '',
  religion: '',
  caste: '',
  subCaste: '',
  nationality: 'India',
  aadhaarNumber: '',
  category: '',
  currentClass: '',
  section: '',
  rollNumber: '',
  previousSchool: '',
  fatherName: '',
  fatherOccupation: '',
  fatherMobile: '',
  fatherEmail: '',
  motherName: '',
  motherOccupation: '',
  motherMobile: '',
  address: '',
  city: '',
  state: '',
  pinCode: '',
  place: '',
  taluka: '',
  district: '',
};

const documentTypes = [
  { key: 'photo', label: 'Student Photo' },
  { key: 'aadhaar', label: 'Aadhaar Card' },
  { key: 'birth_certificate', label: 'Birth Certificate' },
  { key: 'tc', label: 'Transfer Certificate' },
  { key: 'other', label: 'Other Documents' },
];

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm';
const labelClass = 'text-sm font-medium text-gray-700 mb-1.5 block';

function RequiredStar() {
  return <span className="text-red-500 ml-1">*</span>;
}

function SectionHeader({ title }) {
  return (
    <div className="border-l-4 border-blue-600 pl-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  );
}

export default function EditStudent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState({});
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRefs = useRef({});

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const res = await getStudent(id);
      const student = res.data.data || res.data;
      setAdmissionNumber(student.admissionNumber || '');
      
      // Format dates properly for input type="date"
      let formattedDob = student.dob;
      if (formattedDob) {
        formattedDob = new Date(formattedDob).toISOString().split('T')[0];
      }
      
      setFormData({
        ...initialFormData,
        ...student,
        dob: formattedDob,
      });
    } catch {
      toast.error('Failed to load student details');
      navigate('/students');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [key]: file }));
    }
  };

  const removeFile = (key) => {
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key].value = '';
    }
  };

  const validateForm = () => {
    const required = [
      'firstName', 'lastName', 'dob', 'gender', 'currentClass',
      'fatherName', 'fatherMobile', 'motherName', 'address', 'city', 'state', 'pinCode',
    ];
    const missing = required.filter((field) => !formData[field]?.trim());
    if (missing.length > 0) {
      const fieldNames = missing.map((f) =>
        f.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
      );
      toast.error(`Please fill required fields: ${fieldNames.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Update student details
      await updateStudent(id, formData);

      // Upload documents if any
      const fileKeys = Object.keys(files);
      if (fileKeys.length > 0) {
        await Promise.all(fileKeys.map((key) => {
          const fd = new FormData();
          fd.append('files', files[key]);
          fd.append('type', key);
          return uploadDocuments(id, fd);
        }));
      }

      toast.success('Student details updated successfully!');
      navigate(`/students/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update student record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setFiles({});
    Object.values(fileInputRefs.current).forEach((ref) => {
      if (ref) ref.value = '';
    });
  };

  return (
    <div>
      <Header
        title="Edit Student Profile"
        subtitle={`Updating details for ${admissionNumber}`}
      />

      <form onSubmit={handleSubmit}>
        {/* Section 1: Student Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <SectionHeader title="Student Details" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name<RequiredStar /></label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="Enter first name" />
            </div>
            <div>
              <label className={labelClass}>Last Name<RequiredStar /></label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Enter last name" />
            </div>
            <div>
              <label className={labelClass}>Date of Birth<RequiredStar /></label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gender<RequiredStar /></label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className={inputClass}>
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Religion</label>
              <input type="text" name="religion" value={formData.religion} onChange={handleChange} className={inputClass} placeholder="Enter religion" />
            </div>
            <div>
              <label className={labelClass}>Caste</label>
              <input type="text" name="caste" value={formData.caste} onChange={handleChange} className={inputClass} placeholder="Enter caste" />
            </div>
            <div>
              <label className={labelClass}>Sub-Caste</label>
              <input type="text" name="subCaste" value={formData.subCaste} onChange={handleChange} className={inputClass} placeholder="Enter sub-caste" />
            </div>
            <div>
              <label className={labelClass}>Nationality</label>
              <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className={inputClass} placeholder="Nationality" />
            </div>
            <div>
              <label className={labelClass}>Aadhaar Number</label>
              <input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} className={inputClass} placeholder="XXXX-XXXX-XXXX" maxLength={14} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Academic Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <SectionHeader title="Academic Details" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Current Class<RequiredStar /></label>
              <select name="currentClass" value={formData.currentClass} onChange={handleChange} className={inputClass}>
                <option value="">Select Class</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={String(c)}>Class {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Section</label>
              <select name="section" value={formData.section} onChange={handleChange} className={inputClass}>
                <option value="">Select Section</option>
                {['A', 'B', 'C', 'D'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Roll Number</label>
              <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} className={inputClass} placeholder="Enter roll number" />
            </div>
            <div>
              <label className={labelClass}>Previous School</label>
              <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleChange} className={inputClass} placeholder="Previous school name" />
            </div>
          </div>
        </div>

        {/* Section 3: Parent/Guardian Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <SectionHeader title="Parent / Guardian Details" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Father's Name<RequiredStar /></label>
              <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className={inputClass} placeholder="Father's full name" />
            </div>
            <div>
              <label className={labelClass}>Father's Occupation</label>
              <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} className={inputClass} placeholder="Occupation" />
            </div>
            <div>
              <label className={labelClass}>Father's Mobile<RequiredStar /></label>
              <input type="tel" name="fatherMobile" value={formData.fatherMobile} onChange={handleChange} className={inputClass} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label className={labelClass}>Father's Email</label>
              <input type="email" name="fatherEmail" value={formData.fatherEmail} onChange={handleChange} className={inputClass} placeholder="email@example.com" />
            </div>
            <div>
              <label className={labelClass}>Mother's Name<RequiredStar /></label>
              <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className={inputClass} placeholder="Mother's full name" />
            </div>
            <div>
              <label className={labelClass}>Mother's Occupation</label>
              <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} className={inputClass} placeholder="Occupation" />
            </div>
            <div>
              <label className={labelClass}>Mother's Mobile</label>
              <input type="tel" name="motherMobile" value={formData.motherMobile} onChange={handleChange} className={inputClass} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
        </div>

        {/* Section 4: Address Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <SectionHeader title="Address Details" />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Full Address<RequiredStar /></label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={inputClass} placeholder="Enter complete address" />
            </div>
            <div>
              <label className={labelClass}>City<RequiredStar /></label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="City" />
            </div>
            <div>
              <label className={labelClass}>State<RequiredStar /></label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} placeholder="State" />
            </div>
            <div>
              <label className={labelClass}>PIN Code<RequiredStar /></label>
              <input type="text" name="pinCode" value={formData.pinCode} onChange={handleChange} className={inputClass} placeholder="XXXXXX" maxLength={6} />
            </div>
            <div>
              <label className={labelClass}>Place</label>
              <input type="text" name="place" value={formData.place} onChange={handleChange} className={inputClass} placeholder="Place" />
            </div>
            <div>
              <label className={labelClass}>Taluka</label>
              <input type="text" name="taluka" value={formData.taluka} onChange={handleChange} className={inputClass} placeholder="Taluka" />
            </div>
            <div>
              <label className={labelClass}>District</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} className={inputClass} placeholder="District" />
            </div>
          </div>
        </div>

        {/* Section 5: Document Upload */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <SectionHeader title="Document Upload" />
          <div className="grid grid-cols-5 gap-4">
            {documentTypes.map((doc) => (
              <div key={doc.key} className="relative">
                <input
                  ref={(el) => (fileInputRefs.current[doc.key] = el)}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(doc.key, e)}
                  id={`file-${doc.key}`}
                />
                <label
                  htmlFor={`file-${doc.key}`}
                  className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    files[doc.key]
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {files[doc.key] ? (
                    <div className="space-y-2">
                      <HiCheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                      <p className="text-xs font-medium text-green-700 truncate">
                        {files[doc.key].name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <HiCloudArrowUp className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-xs font-medium text-gray-600">{doc.label}</p>
                      <p className="text-xs text-gray-400">Click to upload</p>
                    </div>
                  )}
                </label>
                {files[doc.key] && (
                  <button
                    type="button"
                    onClick={() => removeFile(doc.key)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition"
                  >
                    <HiXMark className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(`/students/${id}`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <HiCloudArrowUp className="w-5 h-5" />
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
