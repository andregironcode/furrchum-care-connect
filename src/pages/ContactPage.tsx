import React, { useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import ReCAPTCHA from 'react-google-recaptcha';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Mail, Phone, MapPin, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Validation schema for the contact form
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
  recaptcha: z.string().min(1, { message: 'Please complete the reCAPTCHA verification.' }),
});

type FormValues = z.infer<typeof formSchema>;

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      recaptcha: '',
    },
  });
  
  // Debug environment variables
  console.log('reCAPTCHA site key:', import.meta.env.VITE_RECAPTCHA_SITE_KEY);
  console.log('Environment variables available:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

  // Handle form submission with real API integration
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Verify reCAPTCHA token
      if (!values.recaptcha) {
        toast.error('Please complete the reCAPTCHA verification.');
        setIsSubmitting(false);
        return;
      }

      // Send contact form data to the backend API
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          recaptchaToken: values.recaptcha,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Message sent successfully! We will get back to you within 24 hours.', {
          duration: 5000,
          action: {
            label: 'Close',
            onClick: () => {},
          },
        });
        form.reset();
        // Reset reCAPTCHA
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast.error('Failed to send message. Please try again or contact us directly via email.', {
        duration: 6000,
        action: {
          label: 'Retry',
          onClick: () => onSubmit(values),
        },
      });
      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      form.setValue('recaptcha', '');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reCAPTCHA change
  const handleRecaptchaChange = (token: string | null) => {
    form.setValue('recaptcha', token || '');
    if (token) {
      form.clearErrors('recaptcha');
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about our services? Need help with your pet's health? 
            We're here to help. Reach out to us using the form below or visit our office.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
                <CardDescription>Reach out to us through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <a href="mailto:abhishekverma@furrchum.com" className="hover:text-primary transition-colors">
                        abhishekverma@furrchum.com
                      </a>
                    </p>
                    <p className="text-sm text-gray-600 mt-2 font-medium">For investors:</p>
                    <p className="text-sm text-gray-600">
                      <a href="mailto:investorcare@furrchum.com" className="hover:text-primary transition-colors">
                        investorcare@furrchum.com
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Phone</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <a href="tel:+918700608887" className="hover:text-primary transition-colors">
                        +91 8700608887
                      </a>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Available 9 AM - 6 PM IST</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Address</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      DCG04/ 2114-17,<br />
                      DLF Corporate Greens,<br />
                      Sector 74A,<br />
                      Gurgaon - 122004,<br />
                      Haryana, INDIA
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Business Hours</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Monday - Friday:</span> 9:00 AM - 6:00 PM</p>
                    <p><span className="font-medium">Saturday:</span> 10:00 AM - 4:00 PM</p>
                    <p><span className="font-medium">Sunday:</span> Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send Us a Message
                </CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="What is this regarding?" {...field} />
                          </FormControl>
                          <FormDescription>
                            Brief description of your inquiry (e.g., "Question about veterinarian services")
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please provide details about your inquiry, question, or feedback..." 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 10 characters. Please be as detailed as possible.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* reCAPTCHA */}
                    <FormField
                      control={form.control}
                      name="recaptcha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Security Verification</FormLabel>
                          <FormControl>
                            <div className="flex justify-center">
                              <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeBH1krAAAAAArOi7RYu8FcZZn1zNxBBaT_ATK9'}
                                onChange={handleRecaptchaChange}
                                onExpired={() => {
                                  form.setValue('recaptcha', '');
                                  form.setError('recaptcha', { message: 'reCAPTCHA has expired. Please verify again.' });
                                }}
                                onError={(err) => {
                                  console.error('reCAPTCHA error:', err);
                                  form.setValue('recaptcha', '');
                                  form.setError('recaptcha', { message: 'reCAPTCHA error. Please try again.' });
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="text-center">
                <p className="text-sm text-gray-500">
                  We typically respond within 24 hours during business days.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="mt-16 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Visit Our Office</h2>
            <p className="text-gray-600">Find us at our corporate office in Gurgaon</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Our Location
              </CardTitle>
              <CardDescription>
                DCG04/ 2114-17, DLF Corporate Greens, Sector 74A, Gurgaon - 122004, Haryana, INDIA
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.1234567890123!2d77.066666!3d28.456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sDLF%20Corporate%20Greens%2C%20Sector%2074A%2C%20Gurugram%2C%20Haryana!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Furrchum Office Location"
                  className="w-full"
                ></iframe>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>🚗 Parking available</p>
                <p>🚇 Nearest Metro: Sector 54 Chowk (Blue Line)</p>
              </div>
              <Button variant="outline" asChild>
                <a 
                  href="https://maps.google.com/?q=DLF+Corporate+Greens,+Sector+74A,+Gurugram,+Haryana+122004" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Open in Maps
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
