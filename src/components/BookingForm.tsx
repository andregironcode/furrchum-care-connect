  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingError('');
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!selectedDate || !selectedTime || !selectedConsultationType) {
        setBookingError('Please fill out all required fields');
        setIsSubmitting(false);
        return;
      }

      // Validate booking date and time are not in the past
      const now = new Date();
      const [hours, minutes] = selectedTime.split(':').map(Number);

      const bookingDateTime = new Date(selectedDate);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      if (bookingDateTime <= now) {
        setBookingError('Booking time must be in the future');
        setIsSubmitting(false);
        return;
      }

      // Process the times
      const [startHour, startMinute] = selectedTime.split(':').map(Number);

      // Create end time (30 min appointment)
      let endHour = startHour;
      let endMinute = startMinute + 30;

      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }

      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
