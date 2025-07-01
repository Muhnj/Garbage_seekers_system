'use client';

import React, { useEffect, useState } from 'react';
import InputField from './input-field';
import useModalStore from '@/store/modalStore';
import { db } from '@/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { InfoIcon } from 'lucide-react';


const UpdateResidentModal= ({ residentId }) => {
  const { closeModal } = useModalStore();

  const [residentInfo, setResidentInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    client_address: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResidentData = async () => {
      try {
        const docRef = doc(db, 'residents', residentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setResidentInfo({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            client_address: data.client_address || '',
          });
        } else {
          alert('Resident data not found.');
          closeModal();
        }
      } catch (error) {
        alert('Failed to fetch resident data.');
        closeModal();
      }
    };

    fetchResidentData();
  }, [residentId, closeModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResidentInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, phone, client_address } = residentInfo;

    if (!firstName || !lastName || !phone || !client_address) {
      alert('Please fill all required fields');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'residents', residentId);
      await updateDoc(docRef, {
        firstName: firstName.toUpperCase(),
        lastName: lastName.toUpperCase(),
        phone,
        client_address,
        updatedAt: new Date().toISOString(),
      });

      alert('Resident updated successfully!');
      closeModal();
      window.location.reload();
    } catch (error) {
      alert(error.message || 'Error updating resident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="h-full" onSubmit={handleSubmit}>
      <div className="modal-header-section flex flex-col gap-2">
        <h1 className="md:text-xl lg:text-2xl font-bold">Update Resident</h1>
        <p className="text-xs font-light text-slate-500">Update the selected resident's profile information below.</p>
      </div>

      <div className="form-section py-4 overflow-auto h-[90%]">
        <div className="profile-section-header flex gap-2 items-center mb-4">
          <span className="font-bold text-2xl lg:text-3xl text-slate-300">RESIDENT PROFILE</span>
        </div>

        <div className="form-area grid grid-cols-12 md:gap-4 lg:gap-8">
          <InputField label="First Name" name="firstName" value={residentInfo.firstName} onChange={handleChange} />
          <InputField label="Last Name" name="lastName" value={residentInfo.lastName} onChange={handleChange} />
          <InputField label="Email" name="email" value={residentInfo.email} disabled /> {/* Email can't be edited */}
          <InputField label="Phone" name="phone" value={residentInfo.phone} onChange={handleChange} />
          <InputField label="Address" name="client_address" value={residentInfo.client_address} onChange={handleChange} />
        </div>

        <div className="w-full flex flex-col gap-4 items-center justify-between bg-slate-200 py-12 px-8 mt-8">
          <div className="flex justify-start gap-2 md:text-lg items-start font-medium">
            <InfoIcon className="text-blue-500" />
            <p>Only editable fields are updated. Email remains unchanged.</p>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-4 hover:bg-blue-700 transition relative"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm text-white">Saving...</span>
            ) : (
              'Update'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default UpdateResidentModal;
