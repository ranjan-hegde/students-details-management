import React, { useState, useEffect } from 'react';
import { HiOutlineSave, HiTrash, HiPlus } from 'react-icons/hi';
import toast from 'react-hot-toast';
import * as api from '../services/api';

const SchoolSettings = () => {
  const [settings, setSettings] = useState({
    schoolName: '',
    schoolAddress: '',
    schoolStrength: '',
    defaultFee: '',
    yearlyResults: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.getSchoolSettings();
      if (response.data && response.data.data) {
        setSettings({
          schoolName: response.data.data.schoolName || '',
          schoolAddress: response.data.data.schoolAddress || '',
          schoolStrength: response.data.data.schoolStrength || '',
          defaultFee: response.data.data.defaultFee || '',
          yearlyResults: response.data.data.yearlyResults || []
        });
      }
    } catch (error) {
      toast.error('Failed to load school settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleResultChange = (index, field, value) => {
    const newResults = [...settings.yearlyResults];
    newResults[index][field] = value;
    setSettings(prev => ({ ...prev, yearlyResults: newResults }));
  };

  const addResultRow = () => {
    setSettings(prev => ({
      ...prev,
      yearlyResults: [...prev.yearlyResults, { year: '', passPercentage: '' }]
    }));
  };

  const removeResultRow = (index) => {
    const newResults = settings.yearlyResults.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, yearlyResults: newResults }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSchoolSettings({
        schoolName: settings.schoolName,
        schoolAddress: settings.schoolAddress,
        schoolStrength: Number(settings.schoolStrength),
        defaultFee: Number(settings.defaultFee),
        yearlyResults: settings.yearlyResults
      });
      toast.success('School settings updated successfully');
    } catch (error) {
      toast.error('Failed to save school settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">School Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage global configuration for your school</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSave}>
          <div className="p-6 md:p-8 space-y-8">
            
            {/* General Profile */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">General Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                  <input
                    type="text"
                    name="schoolName"
                    value={settings.schoolName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="e.g. St. Joseph's High School"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Address</label>
                  <input
                    type="text"
                    name="schoolAddress"
                    value={settings.schoolAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="e.g. 123 Education Lane, Learning City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total School Strength (Max Capacity)</label>
                  <input
                    type="number"
                    name="schoolStrength"
                    value={settings.schoolStrength}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="e.g. 1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Class Fee (₹)</label>
                  <input
                    type="number"
                    name="defaultFee"
                    value={settings.defaultFee}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>
            </div>

            {/* Academic Results */}
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Yearly Academic Results</h3>
                <button
                  type="button"
                  onClick={addResultRow}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition"
                >
                  <HiPlus className="w-4 h-4 mr-1" /> Add Year
                </button>
              </div>
              
              {settings.yearlyResults.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500 text-sm">No yearly results added yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {settings.yearlyResults.map((result, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Academic Year</label>
                        <input
                          type="text"
                          required
                          value={result.year}
                          onChange={(e) => handleResultChange(index, 'year', e.target.value)}
                          placeholder="e.g. 2023-24"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Pass Percentage (%)</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          max="100"
                          value={result.passPercentage}
                          onChange={(e) => handleResultChange(index, 'passPercentage', e.target.value)}
                          placeholder="e.g. 98.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="pt-5">
                        <button
                          type="button"
                          onClick={() => removeResultRow(index)}
                          className="p-2 text-rose-500 hover:bg-rose-100 rounded-md transition"
                          title="Remove Row"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
          
          <div className="px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center"
            >
              <HiOutlineSave className="w-5 h-5 mr-2" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolSettings;
