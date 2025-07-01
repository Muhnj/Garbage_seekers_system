import { auth, db } from '@/firebase/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  echoPoints: number;
  password: string;
  confirmPassword: string;
  role: String;
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
};

export default function ResidentRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    echoPoints: 100,
    password: '',
    confirmPassword: '',
    role: 'resident',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { setUser, user } = useAuthStore();

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 0) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      } else if (/[^a-zA-Z\s]/.test(formData.firstName)) {
        newErrors.firstName = 'No symbols allowed';
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      } else if (/[^a-zA-Z\s]/.test(formData.lastName)) {
        newErrors.lastName = 'No symbols allowed';
      }
    }

    if (step === 1) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|icloud|yahoo)\.com$/;
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please use Gmail, iCloud or Yahoo';
      }

      const phoneRegex = /^[0-9]{10,15}$/;
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number';
      }
    }

    if (step === 2) {
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

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please correct the highlighted fields',
      });
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );


      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        echoPoints: 50,
        createdAt: new Date().toISOString(),
        role: 'resident',
      });

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Login to continue!',
        visibilityTime: 5000,
      });

      router.replace('/(auth)/login');

      
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
      title: 'Contact Details',
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
      ],
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
        <View className="mb-8">
          {steps[currentStep].fields.map((field) => (
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
                  value={formData[field.name as keyof FormData]}
                  onChangeText={(text) => handleChange(field.name as keyof FormData, text)}
                  keyboardType={field.keyboardType || 'default'}
                  secureTextEntry={field.secureTextEntry || false}
                  autoCapitalize={field.name === 'email' ? 'none' : 'words'}
                />
              </View>
              {errors[field.name as keyof FormErrors] && (
                <Text className="text-red-500 text-xs mt-1">
                  {errors[field.name as keyof FormErrors]}
                </Text>
              )}
            </View>
          ))}
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
            disabled={loading}
            className={`px-6 py-3 rounded-lg ${loading ? 'bg-emerald-400' : 'bg-emerald-500'}`}
          >
            <Text className="text-white font-medium">
              {currentStep === steps.length - 1
                ? loading ? 'Creating Account...' : 'Create Account'
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
