'use client';
import React, { useState, useRef, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/libs/firebase';
import InputField from './input-field';
import { InfoIcon, User, Upload } from 'lucide-react';
import useModalStore from '@/store/modalStore';
import Image from 'next/image';

const UpdateCollectorModal = ({ collectorId, initialData }) => {
  const { closeModal } = useModalStore();
  const fileInputRef = useRef(null);
  const idFileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const equipments = ['Man Power', 'Bicycle', 'Car', 'Truck', 'Motorcycle'];

  const [collectorInfo, setCollectorInfo] = useState(initialData || {});
  const [photoPreview, setPhotoPreview] = useState(initialData?.collectorPhoto || null);
  const [idPreview, setIdPreview] = useState(initialData?.nationalIdPhoto || null);

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'photo') {
      setCollectorInfo({ ...collectorInfo, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (type === 'nationalId') {
      setCollectorInfo({ ...collectorInfo, nationalId: file });
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
      const updates = {
        firstName: collectorInfo.firstName.trim(),
        lastName: collectorInfo.lastName.trim(),
        email: collectorInfo.email,
        phone: collectorInfo.phone,
        nin: collectorInfo.nin,
        gender: collectorInfo.gender,
        equipmentType: collectorInfo.equipmentType,
        hasCompany: collectorInfo.ownershipStatus === 'Company',
        companyName: collectorInfo.ownershipStatus === 'Company' ? collectorInfo.companyName : null,
      };

      if (!validatePhone(collectorInfo.phone)) {
        throw new Error('Phone must start with +256 and have 13 digits');
      }
      if (!validateNIN(collectorInfo.nin)) {
        throw new Error('NIN must be exactly 14 alphanumeric characters');
      }

      if (collectorInfo.photo instanceof File) {
        updates.collectorPhoto = await uploadFile(collectorInfo.photo, `collectors/${initialData.uid}/photo`);
      }

      if (collectorInfo.nationalId instanceof File) {
        updates.nationalIdPhoto = await uploadFile(collectorInfo.nationalId, `collectors/${initialData.uid}/nationalId`);
      }

      await updateDoc(doc(db, 'collectors', collectorId), updates);
      alert('Collector info updated!');
      closeModal();
    } catch (error) {
      console.error('Update error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="h-full" onSubmit={handleSubmit}>
      <div className="modal-header-section flex flex-col gap-2">
        <h1 className="md:text-xl lg:text-2xl font-bold">Update Collector Information</h1>
        <p className="text-xs font-light text-slate-500">
          Modify any of the existing details of the registered garbage collector.
        </p>
      </div>

      <div className="form-section py-4 overflow-auto h-[90%]">
        {/* Photo Section */}
        <div className="mb-6 flex flex-col items-center">
          <div 
            className="relative w-24 h-24 rounded-full bg-gray-200 mb-2 cursor-pointer overflow-hidden"
            onClick={() => fileInputRef.current.click()}
          >
            {photoPreview ? (
              <Image src={photoPreview} alt="Preview" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <User size={40} />
              </div>
            )}
          </div>
          <button type="button" className="flex items-center gap-2 text-sm text-main" onClick={() => fileInputRef.current.click()}>
            <Upload size={16} />
            {photoPreview ? 'Change Photo' : 'Upload Photo'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e, 'photo')}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="form-area grid grid-cols-12 md:gap-4 lg:gap-8">
          <InputField label="First Name" type="text" value={collectorInfo.firstName || ''} required
            onChange={(e) => setCollectorInfo({ ...collectorInfo, firstName: e.target.value })} />
          
          <InputField label="Last Name" type="text" value={collectorInfo.lastName || ''} required
            onChange={(e) => setCollectorInfo({ ...collectorInfo, lastName: e.target.value })} />

          <InputField label="Email" type="email" value={collectorInfo.email || ''} required
            onChange={(e) => setCollectorInfo({ ...collectorInfo, email: e.target.value })} />

          <InputField label="Phone (+256...)" type="tel" value={collectorInfo.phone || ''} required
            onChange={(e) => setCollectorInfo({ ...collectorInfo, phone: e.target.value })} />

          <InputField label="NIN (14 characters)" type="text" value={collectorInfo.nin || ''} required
            onChange={(e) => setCollectorInfo({ ...collectorInfo, nin: e.target.value })} />

          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={collectorInfo.gender}
              onChange={(e) => setCollectorInfo({ ...collectorInfo, gender: e.target.value })}
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
              onChange={(e) => setCollectorInfo({ ...collectorInfo, equipmentType: e.target.value })}
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
              onChange={(e) => setCollectorInfo({ ...collectorInfo, ownershipStatus: e.target.value })}
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
              value={collectorInfo.companyName || ''}
              onChange={(e) => setCollectorInfo({ ...collectorInfo, companyName: e.target.value })}
              required
            />
          )}

          {/* ID Upload */}
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
              <button type="button" className="flex items-center gap-2 text-sm text-main" onClick={() => idFileInputRef.current.click()}>
                <Upload size={16} />
                Upload National ID
              </button>
              <input
                type="file"
                ref={idFileInputRef}
                onChange={(e) => handleFileUpload(e, 'nationalId')}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-200 py-4 px-8 mt-8 rounded">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm">
              <InfoIcon className="text-emerald-400" />
              <span>You can modify any field</span>
            </div>
            <button
              className="py-2 px-6 rounded-full bg-main text-white hover:bg-emerald-700 transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Collector'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UpdateCollectorModal;
