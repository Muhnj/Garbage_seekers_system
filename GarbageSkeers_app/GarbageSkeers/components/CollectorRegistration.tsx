import { auth, db, storage } from '@/firebase/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Link, router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nin: string;
  hasCompany: boolean;
  companyName?: string;
  equipmentType: string;
  password: string;
  confirmPassword: string;
  role: string;
  echoPoints: number;
  wallet: number;
  equipmentPhoto?: string;
  lc1LetterPhoto?: string;
  companyRegPhoto?: string;
  collectorPhoto?: string;
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nin?: string;
  companyName?: string;
  equipmentType?: string;
  password?: string;
  confirmPassword?: string;
  equipmentPhoto?: string;
  lc1LetterPhoto?: string;
  companyRegPhoto?: string;
  collectorPhoto?: string;
};

const equipmentOptions = ['man_power', 'bicycle', 'motocycle', 'car', 'truck'];

export default function CollectorRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nin: '',
    hasCompany: false,
    equipmentType: '',
    password: '',
    confirmPassword: '',
    role: 'collector',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { setUser, user } = useAuthStore();

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    }

    if (step === 1) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[a-zA-Z0-9._%+-]+@(gmail|icloud|yahoo)\.com$/.test(formData.email)) {
        newErrors.email = 'Please use Gmail, iCloud or Yahoo';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[0-9]{10,15}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number';
      }

      if (!formData.nin.trim()) {
        newErrors.nin = 'NIN is required';
      } else if (!/^[A-Za-z0-9]{14}$/.test(formData.nin)) {
        newErrors.nin = 'Must be 14 characters';
      }
    }

    if (step === 2) {
      if (!formData.equipmentType) {
        newErrors.equipmentType = 'Equipment type is required';
      } else if (formData.equipmentType !== 'man_power' && !formData.equipmentPhoto) {
        newErrors.equipmentPhoto = 'Photo evidence required';
      }

      if (!formData.lc1LetterPhoto) newErrors.lc1LetterPhoto = 'LC1 recommendation letter required';

      if (formData.hasCompany && !formData.companyRegPhoto) {
        newErrors.companyRegPhoto = 'Company registration required';
      }
      
      if (!formData.collectorPhoto) newErrors.collectorPhoto = 'Your photo is required';
    }

    if (step === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Minimum 8 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const takePhoto = async (field: keyof FormData) => {
    setUploading(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Camera access is needed to take photos',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const storageRef = ref(storage, `collector-docs/${Date.now()}_${filename}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        
        setFormData(prev => ({ ...prev, [field]: downloadURL }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: 'Failed to capture image',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please complete all required fields',
      });
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Prepare collector data
      const collectorData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        nin: formData.nin,
        hasCompany: formData.hasCompany,
        companyName: formData.companyName || null,
        equipmentType: formData.equipmentType,
        equipmentPhoto: formData.equipmentPhoto || null,
        lc1LetterPhoto: formData.lc1LetterPhoto,
        companyRegPhoto: formData.companyRegPhoto || null,
        collectorPhoto: formData.collectorPhoto,
        status: 'pending_approval',
        wallet: 0,
        currentLoaction: '',
        createdAt: new Date().toISOString(),
        role: 'collector',
      };

      // Save to Firestore
      await setDoc(doc(db, 'collectors', userCredential.user.uid), collectorData);

      // Update store
      setUser({
        id: userCredential.user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'collector',
      });
      console.log(user);
      

      

      router.replace('/(auth)/login');

      Toast.show({
        type: 'success',
        text1: 'Application Submitted',
        text2: 'Your collector account is under review',
      });
      
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Personal Information',
      fields: [
        {
          name: 'firstName',
          label: 'First Name',
          placeholder: 'Enter your first name',
          icon: 'account-circle',
        },
        {
          name: 'lastName',
          label: 'Last Name',
          placeholder: 'Enter your last name',
          icon: 'account-circle',
        },
      ],
    },
    {
      title: 'Contact & Identification',
      fields: [
        {
          name: 'email',
          label: 'Email Address',
          placeholder: 'yourname@gmail.com',
          icon: 'email',
          keyboardType: 'email-address',
        },
        {
          name: 'phone',
          label: 'Phone Number',
          placeholder: '07XXXXXXXX',
          icon: 'phone',
          keyboardType: 'phone-pad',
        },
        {
          name: 'nin',
          label: 'National ID Number (NIN)',
          placeholder: '14 character NIN',
          icon: 'credit-card',
          maxLength: 14,
        },
      ],
    },
    {
      title: 'Collection Details',
      render: () => (
        <ScrollView>
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Do you represent a company?
            </Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className={`flex-1 py-3 border rounded-lg ${formData.hasCompany ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                onPress={() => handleChange('hasCompany', true)}
              >
                <Text className={`text-center ${formData.hasCompany ? 'text-emerald-600 font-medium' : 'text-gray-600'}`}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 border rounded-lg ${!formData.hasCompany ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                onPress={() => handleChange('hasCompany', false)}
              >
                <Text className={`text-center ${!formData.hasCompany ? 'text-emerald-600 font-medium' : 'text-gray-600'}`}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {formData.hasCompany && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Company Name
              </Text>
              <View className={`border rounded-lg px-4 py-3 ${errors.companyName ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                <TextInput
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChangeText={(text) => handleChange('companyName', text)}
                />
              </View>
              {errors.companyName && (
                <Text className="text-red-500 text-xs mt-1">{errors.companyName}</Text>
              )}
            </View>
          )}

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Primary Collection Equipment
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {equipmentOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  className={`px-4 py-2 border rounded-full ${formData.equipmentType === option ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                  onPress={() => handleChange('equipmentType', option)}
                >
                  <Text className={`${formData.equipmentType === option ? 'text-emerald-600 font-medium' : 'text-gray-600'}`}>
                    {option.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.equipmentType && (
              <Text className="text-red-500 text-xs mt-1">{errors.equipmentType}</Text>
            )}
          </View>

          {formData.equipmentType && formData.equipmentType !== 'man_power' && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Equipment Photo Evidence
              </Text>
              <TouchableOpacity
                className={`border rounded-lg p-4 items-center ${errors.equipmentPhoto ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
                onPress={() => takePhoto('equipmentPhoto')}
                disabled={uploading}
              >
                {formData.equipmentPhoto ? (
                  <Image 
                    source={{ uri: formData.equipmentPhoto }} 
                    className="w-full h-40 rounded" 
                    resizeMode="contain"
                  />
                ) : (
                  <View className="items-center">
                    <FontAwesome name="camera" size={24} color="#9ca3af" />
                    <Text className="text-gray-500 mt-2">Take Photo of Equipment</Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.equipmentPhoto && (
                <Text className="text-red-500 text-xs mt-1">{errors.equipmentPhoto}</Text>
              )}
            </View>
          )}

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              LC1 Chairperson Recommendation Letter
            </Text>
            <TouchableOpacity
              className={`border rounded-lg p-4 items-center ${errors.lc1LetterPhoto ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
              onPress={() => takePhoto('lc1LetterPhoto')}
              disabled={uploading}
            >
              {formData.lc1LetterPhoto ? (
                <Image 
                  source={{ uri: formData.lc1LetterPhoto }} 
                  className="w-full h-40 rounded" 
                  resizeMode="contain"
                />
              ) : (
                <View className="items-center">
                  <FontAwesome name="camera" size={24} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">Take Photo of Letter</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.lc1LetterPhoto && (
              <Text className="text-red-500 text-xs mt-1">{errors.lc1LetterPhoto}</Text>
            )}
          </View>

          {formData.hasCompany && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Company Registration Document
              </Text>
              <TouchableOpacity
                className={`border rounded-lg p-4 items-center ${errors.companyRegPhoto ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
                onPress={() => takePhoto('companyRegPhoto')}
                disabled={uploading}
              >
                {formData.companyRegPhoto ? (
                  <Image 
                    source={{ uri: formData.companyRegPhoto }} 
                    className="w-full h-40 rounded" 
                    resizeMode="contain"
                  />
                ) : (
                  <View className="items-center">
                    <FontAwesome name="camera" size={24} color="#9ca3af" />
                    <Text className="text-gray-500 mt-2">Take Photo of Document</Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.companyRegPhoto && (
                <Text className="text-red-500 text-xs mt-1">{errors.companyRegPhoto}</Text>
              )}
            </View>
          )}

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              {formData.hasCompany ? 'Company Logo/Your Photo' : 'Your Photo'}
            </Text>
            <TouchableOpacity
              className={`border rounded-lg p-4 items-center ${errors.collectorPhoto ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
              onPress={() => takePhoto('collectorPhoto')}
              disabled={uploading}
            >
              {formData.collectorPhoto ? (
                <Image 
                  source={{ uri: formData.collectorPhoto }} 
                  className="w-full h-40 rounded" 
                  resizeMode="contain"
                />
              ) : (
                <View className="items-center">
                  <FontAwesome name="camera" size={24} color="#9ca3af" />
                  <Text className="text-gray-500 mt-2">
                    {formData.hasCompany ? 'Take Logo/Photo' : 'Take Your Photo'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {errors.collectorPhoto && (
              <Text className="text-red-500 text-xs mt-1">{errors.collectorPhoto}</Text>
            )}
          </View>
        </ScrollView>
      ),
    },
    {
      title: 'Account Security',
      fields: [
        {
          name: 'password',
          label: 'Password',
          placeholder: 'At least 8 characters',
          icon: 'lock',
          secureTextEntry: true,
        },
        {
          name: 'confirmPassword',
          label: 'Confirm Password',
          placeholder: 'Re-enter your password',
          icon: 'lock',
          secureTextEntry: true,
        },
      ],
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50"
    >
      <SafeAreaView className="flex-1 p-6">
        {/* Progress Indicator */}
        <View className="flex-row justify-between mb-8">
          {steps.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full flex-1 mx-1 ${index <= currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`}
            />
          ))}
        </View>

        {/* Form Header */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900">
            {steps[currentStep].title}
          </Text>
          <Text className="text-gray-500 mt-2">
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>

        {/* Form Fields */}
        <View className="mb-8 flex-1">
          {steps[currentStep].fields ? (
            steps[currentStep].fields.map((field) => (
              <View key={field.name} className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </Text>
                <View
                  className={`flex-row items-center border rounded-lg px-4 py-3 ${errors[field.name as keyof FormErrors] ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}
                >
                  <MaterialIcons
                    name={field.icon as any}
                    size={20}
                    color={errors[field.name as keyof FormErrors] ? '#ef4444' : '#9ca3af'}
                    className="mr-3"
                  />
                  <TextInput
                    className="flex-1 text-gray-800"
                    placeholder={field.placeholder}
                    value={formData[field.name as keyof FormData] as string}
                    onChangeText={(text) => handleChange(field.name as keyof FormData, text)}
                    keyboardType={field.keyboardType || 'default'}
                    secureTextEntry={field.secureTextEntry || false}
                    autoCapitalize={field.name === 'email' ? 'none' : 'words'}
                    maxLength={field.maxLength}
                  />
                </View>
                {errors[field.name as keyof FormErrors] && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors[field.name as keyof FormErrors]}
                  </Text>
                )}
              </View>
            ))
          ) : (
            steps[currentStep].render?.()
          )}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row justify-between">
          {currentStep > 0 ? (
            <TouchableOpacity
              onPress={handlePrev}
              className="px-6 py-3 border border-gray-300 rounded-lg"
            >
              <Text className="text-gray-700 font-medium">Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <TouchableOpacity
            onPress={handleNext}
            disabled={loading || uploading}
            className={`px-6 py-3 rounded-lg ${loading || uploading ? 'bg-emerald-400' : 'bg-emerald-500'}`}
          >
            <Text className="text-white font-medium">
              {currentStep === steps.length - 1
                ? loading ? 'Submitting...' : 'Submit Application'
                : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Link */}
        <View className="mt-6 items-center">
          <Text className="text-gray-500">
            Already have an account?{' '}
            <Link href="/(auth)/login" className="text-emerald-600 font-medium">
              Sign in
            </Link>
          </Text>
        </View>
      </SafeAreaView>

      {/* Toast Component */}
      <Toast />
    </KeyboardAvoidingView>
  );
}