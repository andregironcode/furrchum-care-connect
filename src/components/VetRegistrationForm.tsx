  const validateForm = () => {
    const requiredFields = [
      { value: formData.firstName, name: 'First Name' },
      { value: formData.lastName, name: 'Last Name' },
      { value: formData.specialization, name: 'Specialization' },
      { value: formData.consultationFee, name: 'Consultation Fee' },
      { value: formData.about, name: 'About' },
      { value: formData.clinicName, name: 'Clinic Name' },
      { value: formData.clinicLocation, name: 'Clinic Location' },
      { value: formData.zipCode, name: 'Zip Code' },
      { value: formData.yearsExperience, name: 'Years of Experience' },
      { value: formData.licenseNumber, name: 'License Number' },
      { value: formData.licenseExpiry, name: 'License Expiry Date' },
    ];

    let errorMessage = '';
    for (const field of requiredFields) {
      if (!field.value) {
        errorMessage = `${field.name} is required.`;
        break;
      }
    }

    if (!errorMessage && (!profileImageFile && !formData.profileImageUrl)) {
      errorMessage = 'Profile picture is required.';
    }

    if (!errorMessage && (!licenseFile && !formData.licenseUrl)) {
      errorMessage = 'Vet license document is required.';
    }

    setFormError(errorMessage);
    return !errorMessage;
