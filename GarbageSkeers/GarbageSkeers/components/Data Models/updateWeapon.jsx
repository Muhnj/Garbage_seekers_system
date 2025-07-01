'use resident';

import React, { useState, useEffect } from 'react';
import { userManager } from '@/libs/resourceManagement';
import InputField from './input-field';
import useModalStore from '@/store/modalStore';

const UpdateResidentModal = ({ resident, residentId }) => {
  const { closeModal } = useModalStore();

  const [residentType, setResidentType] = useState(resident.residentType || 'individual');

  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(resident);
  }, [resident]);




  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      ...formData,
    };

    try {
      await userManager.updateResource(residentId, updatedData);
      alert('Resident updated successfully!');
      closeModal();
      window.location.reload();
    } catch (error) {
      alert('Failed to update resident.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full">
      <div className="modal-header-section">
        <h1 className="md:text-xl lg:text-2xl font-bold">Update Resident Information</h1>
        <p className="text-sm text-gray-500">Edit the fields and save changes.</p>

        <div className="flex gap-4 mt-4">
          {['individual', 'company'].map((type) => (
            <label key={type}>
              <input
                type="radio"
                name="residentType"
                value={type}
                checked={residentType === type}
                onChange={() => setResidentType(type)}
              />{' '}
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="form-section py-4 overflow-auto h-[90%]">
        
          <div className="grid grid-cols-12 gap-4">
            <InputField label="First Name" name="firstName" value={formData.firstName || ''} onChange={handleChange} />
            <InputField label="Last Name" name="lastName" value={formData.lastName || ''} onChange={handleChange} />
            <InputField label="Email" name="email" value={formData.email || ''} onChange={handleChange} />
            <InputField label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
          </div>
          <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Update Resident
          </button>
        </div>
      </div>
    </form>
  );
};

export default UpdateResidentModal;
