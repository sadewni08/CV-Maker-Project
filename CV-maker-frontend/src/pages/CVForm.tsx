import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCV,  WorkExperience } from '../contexts/CVContext';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
// import '@types/google.maps';
import {
  Save,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  User,
  Phone,
  // Mail,
  Building,
  Briefcase,
  Camera,
  Upload,
  AlertCircle,
  X
  // Globe,
  // Users
  // BookOpen - new
} from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  age: number;
  phoneNumber: string;
  address: string;
  dateOfBirth: Date | null;
  isActive: boolean;
  nationality: string;
  employmentStatus: string;
  termsAccepted: boolean;
  preferredLanguages: string[];
  workExperience: WorkExperience[];
  profilePicture?: string;
  lat?: number;                // ← NEW
  lng?: number;
  //education: Education[];              // NEW
}
// ─── Regex helpers ─────────────────────────────────────────────
const alphaRegex = /^[A-Za-z\s]*$/; // letters & spaces only
const numericRegex = /^\d*$/; // digits only
// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    initAutocomplete: () => void;
  }
}


const CVForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createCV, updateCV, getCVById } = useCV();
  const isEditing = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    age: 0,
    phoneNumber: '',
    address: '',
    dateOfBirth: null,
    isActive: true,
    nationality: '',
    employmentStatus: '',
    termsAccepted: false,
    preferredLanguages: [],
    workExperience: [],
    profilePicture: '',
    lat: undefined,              // ← NEW
    lng: undefined
    //education: []                       // NEW
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  // const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(false);

  //Google Maps Autocomplete (simplified placeholder)
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (isEditing && id) {
      const cv = getCVById(id);
      if (cv) {
        setFormData({
          firstName: cv.firstName,
          lastName: cv.lastName,
          age: cv.age,
          phoneNumber: cv.phoneNumber,
          address: cv.address,
          dateOfBirth: cv.dateOfBirth ? new Date(cv.dateOfBirth) : null,
          isActive: cv.isActive,
          nationality: cv.nationality,
          employmentStatus: cv.employmentStatus,
          termsAccepted: cv.termsAccepted,
          preferredLanguages: cv.preferredLanguages,
          workExperience: cv.workExperience,
          profilePicture: cv.profilePicture || '',
          // lat: cv.lat,
          // lng: cv.lng,
          // education: cv.education || []            // NEW
        });
      }
    }
  }, [isEditing, id, getCVById]);

  useEffect(() => {
    const initAutocomplete = () => {                           // ✅ keep one name
      if (window.google?.maps?.places && addressInputRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
            addressInputRef.current,
            {
              types: ['address'],
              componentRestrictions: { country: ['lk', 'us', 'gb', 'ca', 'au', 'in'] },
              fields: ['formatted_address', 'geometry'],
            },
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address) {
            setFormData(prev => ({
              ...prev,
              address: place.formatted_address,
              lat: place.geometry?.location?.lat(),
              lng: place.geometry?.location?.lng(),
            }));
            setErrors(prev => ({ ...prev, address: '' }));
          }
        });
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address) {
            setFormData(prev => ({
              ...prev,
              address: place.formatted_address,
              lat: place.geometry?.location?.lat(),   // ← NEW
              lng: place.geometry?.location?.lng()    // ← NEW
            }));
            setErrors(prev => ({ ...prev, address: '' }));
          }
        });
        setMapsError(false);
        return true;
      }
      return false;
                                           // show banner if API never loads
    };

    // // first try immediately
    // if (window.google?.maps?.places) {
    //   initAutocomplete();
    // } else {
    //   // let the script tag call this when it’s ready
    //   // window.initAutocomplete = initAutocomplete;
    //   // fallback error after 10 s
    //   setTimeout(() => !autocompleteRef.current && setMapsError(true), 10_000);
    // }
    // attempt immediately → if success, nothing else to do
    if (initAutocomplete()) return;

    // poll every 400 ms until the API arrives or timeout
    const pollId = setInterval(() =>initAutocomplete() && clearInterval(pollId), 400);
    const timeoutId = setTimeout(() => {
      clearInterval(pollId);
      setMapsError(true);
    }, 10_000);

    return () => {
      clearInterval(pollId);
      clearTimeout(timeoutId);
      if (autocompleteRef.current) {
        window.google?.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);


  const nationalityOptions = [
    'American', 'British', 'Canadian', 'Australian', 'German', 'French',
    'Spanish', 'Italian', 'Japanese', 'Chinese', 'Indian', 'Brazilian',
    'Sri Lankan', 'Other'
  ].map(nationality => ({ value: nationality, label: nationality }));

  const employmentStatusOptions = [
    'Employed', 'Unemployed', 'Self-Employed', 'Student', 'Retired', 'Other'
  ].map(status => ({ value: status, label: status }));

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese', 'Japanese', 'Arabic', 'Russian', 'Dutch', 'Swedish',
    'Sinhala', 'Tamil', 'Other'
  ].map(language => ({ value: language, label: language }));

  // Simulate Google Places Autocomplete
  const handleAddressChange = (value: string) => {
    setFormData({ ...formData, address: value });
    // In a real app, this would call Google Places API
    if (value.length > 2) {
      // setAddressSuggestions([
        // `${value} Street, Colombo, Sri Lanka`,
        // `${value} Road, Kandy, Sri Lanka`,
        // `${value} Avenue, Galle, Sri Lanka`
      // ]);
    } else {
      setAddressSuggestions([]);
    }
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePicture: 'Please select a valid image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePicture: 'Image size should be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, profilePicture: result }));
        setErrors(prev => ({ ...prev, profilePicture: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setFormData(prev => ({ ...prev, profilePicture: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrent: false
    };
    setFormData({
      ...formData,
      workExperience: [...formData.workExperience, newExperience]
    });
  };

  const removeWorkExperience = (id: string) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.filter(exp => exp.id !== id)
    });
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: any) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.map(exp => {
        if (exp.id === id) {
          const updatedExp = { ...exp, [field]: value };
          // If setting isCurrent to true, clear the end date
          if (field === 'isCurrent' && value === true) {
            updatedExp.endDate = '';
          }
          return updatedExp;
        }
        return exp;
      })
    });
  };

  /* ───────────────────── Education helpers ──────────────────── */
  // const addEducation = () => {
  //   const newEdu: Education = {
  //     id: Date.now().toString(),
  //     institution: '',
  //     degree: '',
  //     startDate: '',
  //     endDate: '',
  //     description: '',
  //     isCurrent: false
  //   };
  //   setFormData({ ...formData, education: [...formData.education, newEdu] });
  // };
  //
  // const removeEducation = (eid: string) => {
  //   setFormData({
  //     ...formData,
  //     education: formData.education.filter(edu => edu.id !== eid)
  //   });
  // };
  //
  // const updateEducation = (
  //     eid: string,
  //     field: keyof Education,
  //     value: any
  // ) => {
  //   setFormData({
  //     ...formData,
  //     education: formData.education.map(edu =>
  //         edu.id === eid
  //             ? {
  //               ...edu,
  //               [field]: value,
  //               ...(field === 'isCurrent' && value === true ? { endDate: '' } : {})
  //             }
  //             : edu
  //     )
  //   });
  // };

  /* ───────────────────────── Validation ─────────────────────── */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = 'First name is required';
    else if (!alphaRegex.test(formData.firstName))
      newErrors.firstName = 'Only letters are allowed';

    if (!formData.lastName.trim())
      newErrors.lastName = 'Last name is required';
    else if (!alphaRegex.test(formData.lastName))
      newErrors.lastName = 'Only letters are allowed';


    if (!formData.age || formData.age < 16 || formData.age > 100) {
      newErrors.age = 'Age must be between 16 and 100';
    }
      if (!formData.phoneNumber.trim())
        newErrors.phoneNumber = 'Phone number is required';
      else if (!numericRegex.test(formData.phoneNumber))
        newErrors.phoneNumber = 'Only digits are allowed';


    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.employmentStatus) newErrors.employmentStatus = 'Employment status is required';
    if (formData.preferredLanguages.length === 0) {
      newErrors.preferredLanguages = 'At least one preferred language is required';
    }
    if (formData.workExperience.length === 0) {
      newErrors.workExperience = 'At least one work experience is required';
      // if (formData.education.length === 0)                 // NEW
      //   newErrors.education = 'Add at least one education record';
    }
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions';
    }

    // Validate work experience
    formData.workExperience.forEach((exp, index) => {
      if (!exp.company.trim())
        newErrors[`workExperience.${index}.company`] = 'Company is required';
      if (!exp.position.trim())
        newErrors[`workExperience.${index}.position`] = 'Position is required';
      else if (!alphaRegex.test(exp.position))
        newErrors[`workExperience.${index}.position`] = 'Only letters are allowed';

      if (!exp.startDate)
        newErrors[`workExperience.${index}.startDate`] = 'Start date is required';
      if (!exp.isCurrent && !exp.endDate)
        newErrors[`workExperience.${index}.endDate`] = 'End date is required';
    });
    // formData.education.forEach((edu, i) => {             // NEW
    //   if (!edu.institution.trim()) newErrors[`education.${i}.institution`] = 'Required';
    //   if (!edu.degree.trim())      newErrors[`education.${i}.degree`]      = 'Required';
    //   if (!edu.startDate)          newErrors[`education.${i}.startDate`]   = 'Required';
    //   if (!edu.isCurrent && !edu.endDate)
    //     newErrors[`education.${i}.endDate`] = 'Required';
    // });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const cvData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth?.toISOString() || ''
      };

      if (isEditing && id) {
        updateCV(id, cvData);
      } else {
        createCV(cvData);
      }

      navigate('/cvs');
    } catch (error) {
      console.error('Error saving CV:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.firstName.trim() &&
        formData.lastName.trim() &&
        formData.phoneNumber.trim() &&
        formData.address.trim() &&
        formData.dateOfBirth &&
        formData.nationality &&
        formData.employmentStatus &&
        formData.preferredLanguages.length > 0 &&
        formData.workExperience.length > 0 &&
        //formData.education.length > 0 &&          // NEW
        formData.termsAccepted;
  };

  return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit CV' : 'Create New CV'}
            </h1>
            <p className="text-gray-600 mt-2">
              Fill in your information to create a professional CV
            </p>
          </div>
          {/* Google Maps API Status */}
          {mapsError && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Google Maps API Notice</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Google Maps autocomplete is not available. Please ensure you have a valid API key configured.
                      You can still enter your address manually.
                    </p>
                  </div>
                </div>
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Profile Picture</span>
              </h2>

              <div className="flex items-center space-x-6">
                <div className="relative">
                  {formData.profilePicture ? (
                      <div className="relative">
                        <img
                            src={formData.profilePicture}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                        />
                        <button
                            type="button"
                            onClick={removeProfilePicture}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                  ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Recommended: Square image, max 5MB
                  </p>
                  {errors.profilePicture && (
                      <p className="text-red-500 text-sm">{errors.profilePicture}</p>
                  )}
                </div>
              </div>
            </div>
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                      type="number"
                      min="16"
                      max="100"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                          errors.age ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your age"
                  />
                  {errors.age && (
                      <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                        ref={addressInputRef}
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Start typing your address..."
                    />
                    {addressSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                          {addressSuggestions.map((suggestion, index) => (
                              <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, address: suggestion });
                                    setAddressSuggestions([]);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200"
                              >
                                {suggestion}
                              </button>
                          ))}
                        </div>
                    )}
                  </div>
                  {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Note: In production, this would use Google Maps Places API for autocomplete
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <DatePicker
                        selected={formData.dateOfBirth}
                        onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
                        dateFormat="MM/dd/yyyy"
                        maxDate={new Date()}
                        showYearDropdown
                        yearDropdownItemNumber={50}
                        scrollableYearDropdown
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                            errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholderText="Select your date of birth"
                    />
                  </div>
                  {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only"
                    />
                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                        formData.isActive ? 'bg-purple-600' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 transform ${
                          formData.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                    Active Status
                  </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>Professional Information</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality *
                  </label>
                  <Select
                      value={nationalityOptions.find(option => option.value === formData.nationality)}
                      onChange={(selectedOption) =>
                          setFormData({ ...formData, nationality: selectedOption?.value || '' })
                      }
                      options={nationalityOptions}
                      placeholder="Select your nationality"
                      className={errors.nationality ? 'border-red-300' : ''}
                  />
                  {errors.nationality && (
                      <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Status *
                  </label>
                  <Select
                      value={employmentStatusOptions.find(option => option.value === formData.employmentStatus)}
                      onChange={(selectedOption) =>
                          setFormData({ ...formData, employmentStatus: selectedOption?.value || '' })
                      }
                      options={employmentStatusOptions}
                      placeholder="Select your employment status"
                      className={errors.employmentStatus ? 'border-red-300' : ''}
                  />
                  {errors.employmentStatus && (
                      <p className="text-red-500 text-sm mt-1">{errors.employmentStatus}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Languages * (Select multiple)
                  </label>
                  <Select
                      value={languageOptions.filter(option =>
                          formData.preferredLanguages.includes(option.value)
                      )}
                      onChange={(selectedOptions) =>
                          setFormData({
                            ...formData,
                            preferredLanguages: selectedOptions ? selectedOptions.map(option => option.value) : []
                          })
                      }
                      options={languageOptions}
                      isMulti
                      placeholder="Select your preferred languages"
                      className={errors.preferredLanguages ? 'border-red-300' : ''}
                  />
                  {errors.preferredLanguages && (
                      <p className="text-red-500 text-sm mt-1">{errors.preferredLanguages}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Work Experience *</span>
                </h2>
                <button
                    type="button"
                    onClick={addWorkExperience}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-00 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              </div>

              {errors.workExperience && (
                  <p className="text-red-500 text-sm">{errors.workExperience}</p>
              )}

              {formData.workExperience.map((experience, index) => (
                  <div key={experience.id} className="border border-gray-200 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Experience #{index + 1}</h3>
                      <button
                          type="button"
                          onClick={() => removeWorkExperience(experience.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company *
                        </label>
                        <input
                            type="text"
                            value={experience.company}
                            onChange={(e) => updateWorkExperience(experience.id, 'company', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                errors[`workExperience.${index}.company`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Company name"
                        />
                        {errors[`workExperience.${index}.company`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`workExperience.${index}.company`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position *
                        </label>
                        <input
                            type="text"
                            value={experience.position}
                            onChange={(e) => updateWorkExperience(experience.id, 'position', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                errors[`workExperience.${index}.position`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Job position"
                        />
                        {errors[`workExperience.${index}.position`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`workExperience.${index}.position`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                            type="month"
                            value={experience.startDate}
                            onChange={(e) => updateWorkExperience(experience.id, 'startDate', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                errors[`workExperience.${index}.startDate`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors[`workExperience.${index}.startDate`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`workExperience.${index}.startDate`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date {!experience.isCurrent && '*'}
                        </label>
                        <input
                            type="month"
                            value={experience.endDate}
                            onChange={(e) => updateWorkExperience(experience.id, 'endDate', e.target.value)}
                            disabled={experience.isCurrent}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                                experience.isCurrent ? 'bg-gray-100 cursor-not-allowed' : ''
                            } ${
                                errors[`workExperience.${index}.endDate`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors[`workExperience.${index}.endDate`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`workExperience.${index}.endDate`]}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center space-x-2 mb-4">
                          <input
                              type="checkbox"
                              checked={experience.isCurrent}
                              onChange={(e) => updateWorkExperience(experience.id, 'isCurrent', e.target.checked)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium text-gray-700">
                        I currently work here
                      </span>
                        </label>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                            value={experience.description}
                            onChange={(e) => updateWorkExperience(experience.id, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Describe your responsibilities and achievements..."
                        />
                      </div>
                    </div>
                  </div>
              ))}

              {formData.workExperience.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No work experience added yet</p>
                    <button
                        type="button"
                        onClick={addWorkExperience}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Your First Experience</span>
                    </button>
                  </div>
              )}
            </div>
            {/* 4. Education ─────────────────────────────────────── */}
            {/*<div className="space-y-6">*/}
            {/*  <div className="flex items-center justify-between">*/}
            {/*    <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">*/}
            {/*      <BookOpen className="w-5 h-5" />*/}
            {/*      <span>Education *</span>*/}
            {/*    </h2>*/}
            {/*    <button*/}
            {/*        type="button"*/}
            {/*        onClick={addEducation}*/}
            {/*        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"*/}
            {/*    >*/}
            {/*      <Plus className="w-4 h-4" />*/}
            {/*      <span>Add Education</span>*/}
            {/*    </button>*/}
            {/*  </div>*/}

            {/*  {errors.education && (*/}
            {/*      <p className="text-red-500 text-sm">{errors.education}</p>*/}
            {/*  )}*/}

            {/*  {formData.education.map((edu, idx) => (*/}
            {/*      <div key={edu.id} className="border border-gray-200 rounded-lg p-6 space-y-4">*/}
            {/*        <div className="flex items-center justify-between">*/}
            {/*          <h3 className="font-medium text-gray-900">Education #{idx + 1}</h3>*/}
            {/*          <button*/}
            {/*              type="button"*/}
            {/*              onClick={() => removeEducation(edu.id)}*/}
            {/*              className="text-red-600 hover:text-red-700 p-1"*/}
            {/*          >*/}
            {/*            <Trash2 className="w-4 h-4" />*/}
            {/*          </button>*/}
            {/*        </div>*/}

            {/*        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
            {/*          /!* Institution *!/*/}
            {/*          <div>*/}
            {/*            <label className="block text-sm font-medium text-gray-700 mb-2">*/}
            {/*              Institution **/}
            {/*            </label>*/}
            {/*            <input*/}
            {/*                type="text"*/}
            {/*                value={edu.institution}*/}
            {/*                onChange={e => updateEducation(edu.id, 'institution', e.target.value)}*/}
            {/*                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${*/}
            {/*                    errors[`education.${idx}.institution`] ? 'border-red-300' : 'border-gray-300'*/}
            {/*                }`}*/}
            {/*                placeholder="University / College"*/}
            {/*            />*/}
            {/*            {errors[`education.${idx}.institution`] && (*/}
            {/*                <p className="text-red-500 text-sm mt-1">*/}
            {/*                  {errors[`education.${idx}.institution`]}*/}
            {/*                </p>*/}
            {/*            )}*/}
            {/*          </div>*/}

            {/*          /!* Degree *!/*/}
            {/*          <div>*/}
            {/*            <label className="block text-sm font-medium text-gray-700 mb-2">*/}
            {/*              Degree **/}
            {/*            </label>*/}
            {/*            <input*/}
            {/*                type="text"*/}
            {/*                value={edu.degree}*/}
            {/*                onChange={e => updateEducation(edu.id, 'degree', e.target.value)}*/}
            {/*                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${*/}
            {/*                    errors[`education.${idx}.degree`] ? 'border-red-300' : 'border-gray-300'*/}
            {/*                }`}*/}
            {/*                placeholder="e.g., BSc Computer Science"*/}
            {/*            />*/}
            {/*            {errors[`education.${idx}.degree`] && (*/}
            {/*                <p className="text-red-500 text-sm mt-1">*/}
            {/*                  {errors[`education.${idx}.degree`]}*/}
            {/*                </p>*/}
            {/*            )}*/}
            {/*          </div>*/}

            {/*          /!* Start Date *!/*/}
            {/*          <div>*/}
            {/*            <label className="block text-sm font-medium text-gray-700 mb-2">*/}
            {/*              Start Date **/}
            {/*            </label>*/}
            {/*            <input*/}
            {/*                type="month"*/}
            {/*                value={edu.startDate}*/}
            {/*                onChange={e => updateEducation(edu.id, 'startDate', e.target.value)}*/}
            {/*                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${*/}
            {/*                    errors[`education.${idx}.startDate`] ? 'border-red-300' : 'border-gray-300'*/}
            {/*                }`}*/}
            {/*            />*/}
            {/*            {errors[`education.${idx}.startDate`] && (*/}
            {/*                <p className="text-red-500 text-sm mt-1">*/}
            {/*                  {errors[`education.${idx}.startDate`]}*/}
            {/*                </p>*/}
            {/*            )}*/}
            {/*          </div>*/}

            {/*          /!* End Date *!/*/}
            {/*          <div>*/}
            {/*            <label className="block text-sm font-medium text-gray-700 mb-2">*/}
            {/*              End Date {!edu.isCurrent && '*'}*/}
            {/*            </label>*/}
            {/*            <input*/}
            {/*                type="month"*/}
            {/*                value={edu.endDate}*/}
            {/*                onChange={e => updateEducation(edu.id, 'endDate', e.target.value)}*/}
            {/*                disabled={edu.isCurrent}*/}
            {/*                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${*/}
            {/*                    edu.isCurrent ? 'bg-gray-100 cursor-not-allowed' : ''*/}
            {/*                } ${*/}
            {/*                    errors[`education.${idx}.endDate`] ? 'border-red-300' : 'border-gray-300'*/}
            {/*                }`}*/}
            {/*            />*/}
            {/*            {errors[`education.${idx}.endDate`] && (*/}
            {/*                <p className="text-red-500 text-sm mt-1">*/}
            {/*                  {errors[`education.${idx}.endDate`]}*/}
            {/*                </p>*/}
            {/*            )}*/}
            {/*          </div>*/}

            {/*          /!* Current Checkbox + Description *!/*/}
            {/*          <div className="md:col-span-2">*/}
            {/*            <label className="flex items-center space-x-2 mb-4">*/}
            {/*              <input*/}
            {/*                  type="checkbox"*/}
            {/*                  checked={edu.isCurrent}*/}
            {/*                  onChange={e => updateEducation(edu.id, 'isCurrent', e.target.checked)}*/}
            {/*                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"*/}
            {/*              />*/}
            {/*              <span className="text-sm font-medium text-gray-700">*/}
            {/*              I am currently studying here*/}
            {/*            </span>*/}
            {/*            </label>*/}

            {/*            <label className="block text-sm font-medium text-gray-700 mb-2">*/}
            {/*              Description*/}
            {/*            </label>*/}
            {/*            <textarea*/}
            {/*                value={edu.description}*/}
            {/*                onChange={e => updateEducation(edu.id, 'description', e.target.value)}*/}
            {/*                rows={3}*/}
            {/*                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"*/}
            {/*                placeholder="Honors, coursework, GPA..."*/}
            {/*            />*/}
            {/*          </div>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*  ))}*/}

            {/*  {formData.education.length === 0 && (*/}
            {/*      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">*/}
            {/*        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />*/}
            {/*        <p className="text-gray-500 mb-4">No education records added yet</p>*/}
            {/*        <button*/}
            {/*            type="button"*/}
            {/*            onClick={addEducation}*/}
            {/*            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"*/}
            {/*        >*/}
            {/*          <Plus className="w-4 h-4" />*/}
            {/*          <span>Add Your First Education</span>*/}
            {/*        </button>*/}
            {/*      </div>*/}
            {/*  )}*/}
            {/*</div>*/}


            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                    type="checkbox"
                    id="terms"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className={`mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 ${
                        errors.termsAccepted ? 'border-red-300' : ''
                    }`}
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-700 underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-700 underline">
                    Privacy Policy
                  </a>
                  . *
                </label>
              </div>
              {errors.termsAccepted && (
                  <p className="text-red-500 text-sm">{errors.termsAccepted}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                  type="button"
                  onClick={() => navigate('/cvs')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  disabled={loading || !isFormValid()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-600 text-white rounded-lg hover:from-purple-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Saving...' : isEditing ? 'Update CV' : 'Create CV'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default CVForm;