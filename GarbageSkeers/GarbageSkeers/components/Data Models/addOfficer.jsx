'use client';
import React, { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/libs/firebase'; // Make sure auth is imported
import { createUserWithEmailAndPassword } from 'firebase/auth';
import InputField from './input-field';
import { InfoIcon, User, Upload } from 'lucide-react';
import useModalStore from '@/store/modalStore';
import Image from 'next/image';

const AddCollectorModal = () => {
  const { closeModal } = useModalStore();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const fileInputRef = useRef(null);
  const idFileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const equipments = ['Man Power', 'Bicycle', 'Car', 'Truck', 'Motorcycle'];

  const [collectorInfo, setCollectorInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nin: '',
    gender: '',
    equipmentType: '',
    companyName: '',
    ownershipStatus: '',
    photo: null,
    nationalId: null
  });

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'photo') {
      setCollectorInfo({...collectorInfo, photo: file});
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } 
    else if (type === 'nationalId') {
      setCollectorInfo({...collectorInfo, nationalId: file});
      const reader = new FileReader();
      reader.onloadend = () => setIdPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file, path) => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const validatePhone = (phone) => /^\+256\d{9}$/.test(phone);
  const validateNIN = (nin) => /^[A-Za-z0-9]{14}$/.test(nin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!collectorInfo.firstName || !collectorInfo.lastName) {
        throw new Error('First and last name are required');
      }
      if (!validatePhone(collectorInfo.phone)) {
        throw new Error('Phone must start with +256 and have 13 total digits');
      }
      if (!validateNIN(collectorInfo.nin)) {
        throw new Error('NIN must be exactly 14 alphanumeric characters');
      }
      if (!collectorInfo.photo || !collectorInfo.nationalId) {
        throw new Error('Photo and National ID are required');
      }

      // Create auth account with default password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        collectorInfo.email,
        'collector123' // Default password
      );
      const uid = userCredential.user.uid;

      // Upload files
      const profilePhoto = await uploadFile(collectorInfo.photo, `collectors/${uid}/photo`);
      const nationalIdURL = await uploadFile(collectorInfo.nationalId, `collectors/${uid}/nationalId`);

      // Save to Firestore
      await addDoc(collection(db, 'collectors'), {
        uid,
        firstName: collectorInfo.firstName.trim(),
        lastName: collectorInfo.lastName.trim(),
        email: collectorInfo.email,
        phone: collectorInfo.phone,
        nin: collectorInfo.nin,
        gender: collectorInfo.gender,
        equipmentType: collectorInfo.equipmentType,
        hasCompany: collectorInfo.ownershipStatus === 'Company',
        companyName: collectorInfo.ownershipStatus === 'Company' ? collectorInfo.companyName : null,
        collectorPhoto: profilePhoto,
        nationalIdPhoto: nationalIdURL,
        status: 'pending_approval',
        createdAt: new Date().toISOString(),
        lastLocation: null,
        wallet: 0,
        pricePerSack: 0 // Will be set during approval
      });

      alert('Collector registered successfully!');
      closeModal();
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="h-full" onSubmit={handleSubmit}>
      <div className="modal-header-section flex flex-col gap-2">
        <h1 className="md:text-xl lg:text-2xl font-bold">Garbage Collector Registration</h1>
        <p className="text-xs font-light text-slate-500">
          All collectors' information must be collected accurately for complete registration.
        </p>
      </div>

      <div className="form-section py-4 overflow-auto h-[90%]">
        {/* Photo Upload Section */}
        <div className="mb-6 flex flex-col items-center">
          <div 
            className="relative w-24 h-24 rounded-full bg-gray-200 mb-2 cursor-pointer overflow-hidden"
            onClick={() => fileInputRef.current.click()}
          >
            {photoPreview ? (
              <Image 
                src={photoPreview} 
                alt="Preview" 
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User size={40} />
              </div>
            )}
          </div>
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-main"
            onClick={() => fileInputRef.current.click()}
          >
            <Upload size={16} />
            {photoPreview ? 'Change Photo' : 'Upload Photo'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e, 'photo')}
            accept="image/*"
            className="hidden"
            required
          />
        </div>

        <div className="form-area grid grid-cols-12 md:gap-4 lg:gap-8">
          <InputField 
            label="First Name" 
            type="text" 
            placeholder="First name" 
            onChange={(e) => setCollectorInfo({...collectorInfo, firstName: e.target.value})} 
            value={collectorInfo.firstName} 
            required 
          />
          
          <InputField 
            label="Last Name" 
            type="text" 
            placeholder="Last name" 
            onChange={(e) => setCollectorInfo({...collectorInfo, lastName: e.target.value})} 
            value={collectorInfo.lastName} 
            required 
          />
          
          <InputField 
            label="Email" 
            type="email" 
            placeholder="Active email" 
            onChange={(e) => setCollectorInfo({...collectorInfo, email: e.target.value})} 
            value={collectorInfo.email} 
            required 
          />
          
          <InputField 
            label="Phone (+256...)" 
            type="tel" 
            placeholder="+256XXXXXXXXX" 
            onChange={(e) => setCollectorInfo({...collectorInfo, phone: e.target.value})} 
            value={collectorInfo.phone} 
            required 
          />
          
          <InputField 
            label="NIN (14 characters)" 
            type="text" 
            placeholder="National Identification Number" 
            onChange={(e) => setCollectorInfo({...collectorInfo, nin: e.target.value})} 
            value={collectorInfo.nin} 
            required 
          />
          
          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={collectorInfo.gender}
              onChange={(e) => setCollectorInfo({...collectorInfo, gender: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-main focus:border-main"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Collection Method</label>
            <select
              value={collectorInfo.equipmentType}
              onChange={(e) => setCollectorInfo({...collectorInfo, equipmentType: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-main focus:border-main"
              required
            >
              <option value="">Select Equipment</option>
              {equipments.map((equip) => (
                <option key={equip} value={equip}>{equip}</option>
              ))}
            </select>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ownership Status</label>
            <select
              value={collectorInfo.ownershipStatus}
              onChange={(e) => setCollectorInfo({...collectorInfo, ownershipStatus: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded focus:ring-main focus:border-main"
              required
            >
              <option value="">Select Status</option>
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
            </select>
          </div>

          {collectorInfo.ownershipStatus === 'Company' && (
            <InputField 
              label="Company Name" 
              type="text" 
              placeholder="Company Name" 
              onChange={(e) => setCollectorInfo({...collectorInfo, companyName: e.target.value})} 
              value={collectorInfo.companyName} 
              required 
            />
          )}

          <div className="col-span-12 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">National ID Photo</label>
            <div className="flex items-center gap-4">
              {idPreview ? (
                <img src={idPreview} alt="ID Preview" className="h-20 w-auto border rounded" />
              ) : (
                <div className="h-20 w-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400">
                  No ID photo
                </div>
              )}
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-main"
                onClick={() => idFileInputRef.current.click()}
              >
                <Upload size={16} />
                Upload National ID
              </button>
              <input
                type="file"
                ref={idFileInputRef}
                onChange={(e) => handleFileUpload(e, 'nationalId')}
                accept="image/*"
                className="hidden"
                required
              />
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-200 py-4 px-8 mt-8 rounded">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm">
              <InfoIcon className="text-emerald-400" />
              <span>Default password: collector123</span>
            </div>
            <button 
              className="py-2 px-6 rounded-full bg-main text-white hover:bg-emerald-700 transition-colors" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Collector'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddCollectorModal;