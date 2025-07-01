'use client';

import React, { useState } from 'react';
import { userManager } from '@/libs/resourceManagement';
import InputField from './input-field';
import { InfoIcon } from 'lucide-react';
import useModalStore from '@/store/modalStore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '@/libs/firebase';
import { doc, setDoc } from 'firebase/firestore';

const generateSecurityCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

const AddResidentModal = () => {
  const { closeModal } = useModalStore();
  const [loading, setLoading] = useState(false);

  const [residentInfo, setResidentInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    client_address: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResidentInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, phone, firstName, lastName } = residentInfo;
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    const securityCode = generateSecurityCode();
    const fullData = {
      ...residentInfo,
      firstName: firstName.toUpperCase(),
      lastName: lastName.toUpperCase(),
      security_code: securityCode,
      role: 'resident',
    };

    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, 'client123');
      const uid = userCred.user.uid;
      await setDoc(doc(firestore, 'residents', uid), fullData);
      alert('Resident added successfully!');
      closeModal();
      window.location.reload();
    } catch (error) {
      alert('Error creating resident: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="h-full" onSubmit={handleSubmit}>
      <div className="modal-header-section flex flex-col gap-2">
        <h1 className="md:text-xl lg:text-2xl font-bold">Registration Form - Resident</h1>
        <p className="text-xs font-light text-slate-500">
          Fill in the required resident details.
        </p>
      </div>

      <div className="form-section py-4 overflow-auto h-[90%]">
        <div className="profile-section-header flex gap-2 items-center mb-4">
          <span className="font-bold text-2xl lg:text-3xl text-slate-300">RESIDENT PROFILE</span>
        </div>
        <div className="form-area grid grid-cols-12 md:gap-4 lg:gap-8">
          <InputField label="First Name" name="firstName" value={residentInfo.firstName} onChange={handleChange} />
          <InputField label="Last Name" name="lastName" value={residentInfo.lastName} onChange={handleChange} />
          <InputField label="Email" name="email" value={residentInfo.email} onChange={handleChange} />
          <InputField label="Phone" name="phone" value={residentInfo.phone} onChange={handleChange} />
          <InputField label="Address" name="client_address" value={residentInfo.client_address} onChange={handleChange} />
        </div>

        <div className="w-full flex flex-col gap-4 items-center justify-between bg-slate-200 py-12 px-8 mt-8">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex justify-start gap-2 md:text-lg items-start font-medium">
              <InfoIcon className="text-emerald-400" />
              <p>Resident accounts will use default password: <strong>client123</strong>.</p>
            </div>
          </div>

          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg mt-4 hover:bg-emerald-700 transition relative"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm text-white"></span>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddResidentModal;
