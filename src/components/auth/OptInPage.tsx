import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft, Bell, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';

export default function OptInPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!consent) {
      setError('You must consent to receive messages');
      return;
    }

    try {
      // In a real implementation, you would send this data to your backend
      // For this example, we'll just simulate a successful submission
      console.log('Consent data:', {
        email,
        phone,
        consent,
        timestamp: new Date().toISOString(),
      });
      
      // Show success message
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting consent:', err);
      setError('Failed to submit your consent. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
            Thank You!
          </h2>
          <p className="mt-1 text-center text-sm text-gray-600">
            You've successfully opted in to receive messages from us.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> {email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>Phone:</strong> {phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <strong>Consent Date:</strong> {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-brand-green hover:text-brand-green/80"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-brand-green/10">
          <Bell className="h-8 w-8 text-brand-green" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
          Opt-in to Text Messages
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600">
          Stay updated with important information and reminders
        </p>
      </div>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm"
              placeholder="(123) 456-7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="consent" className="font-medium text-gray-700">
                  I consent to receive messages
                </label>
                <p className="text-gray-500">
                  By checking this box, you agree to receive marketing messages via SMS and email from Siena. Message and data rates may apply. You can opt out at any time.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-gray-400" />
            <p className="text-xs text-gray-500">
              Your information is protected by our{' '}
              <Link to="/privacy" className="text-brand-green hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full"
          >
            Submit
          </Button>
          <div className="text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-brand-green hover:text-brand-green/80"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </form>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <div className="text-sm text-gray-500">
          <p className="mb-2">
            <strong>Why opt in?</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Receive appointment reminders</li>
            <li>Get notified about new features</li>
            <li>Stay updated on your wellness journey</li>
            <li>Receive medication reminders</li>
          </ul>
        </div>
      </div>
    </div>
  );
}