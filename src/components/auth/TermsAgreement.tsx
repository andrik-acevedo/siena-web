import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface TermsAgreementProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function TermsAgreement({ onAccept, onDecline }: TermsAgreementProps) {
  const [hasRead, setHasRead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { acceptTerms } = useUser();
  const navigate = useNavigate();

  const handleAccept = async () => {
    console.log('Accept button clicked, hasRead:', hasRead);
    if (!hasRead) {
      console.log('Terms not read, returning');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Starting accept process...');
      if (!onAccept) {
        console.log('Calling acceptTerms...');
        await acceptTerms();
        console.log('acceptTerms completed');
        // Navigate to dashboard after accepting terms
        navigate('/dashboard');
      } else {
        console.log('Calling onAccept prop...');
        await onAccept();
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
      // You might want to show an error message to the user here
      alert('There was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      if (onDecline) {
        await onDecline();
      } else {
        await supabase.auth.signOut();
        navigate('/login');
      }
    } catch (error) {
      console.error('Error declining terms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Siena — Your Digital Wellness Companion</h2>
          <p className="mt-2 text-gray-600">
            Siena is a subscription-based wellness platform developed by Your Life Consulting, LLC. Designed to enhance your journey of self-awareness, growth, and relationship connection, Siena offers daily tools, guided reflections, intimacy challenges, affirmations, and more — all from the comfort of your device.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            {/* Membership & Access */}
            <section>
              <h3 className="font-semibold text-lg text-gray-900">Membership & Access</h3>
              <p className="mt-2 text-gray-600">
                Access to Siena is available through a monthly or annual subscription. Once subscribed, you can explore the full range of features, including guided challenges, exercises, card decks, mood tracking, and personalized insights.
              </p>
              <ul className="mt-4 space-y-2 text-gray-600 list-disc pl-6">
                <li>Our monthly membership plans range from $0 for the Basic plan, to $9.99 USD for Plus, and $14.99 USD for Premium.</li>
                <li>Cancel anytime — no long-term commitment.</li>
                <li>Plans determine access to all current and future wellness tools.</li>
                <li>Membership is not dependent on therapy participation and is available to the public.</li>
              </ul>
            </section>

            {/* Important Things to Know */}
            <section>
              <h3 className="font-semibold text-lg text-gray-900">Important Things to Know</h3>
              <ul className="mt-2 space-y-2 text-gray-600 list-disc pl-6">
                <li>Siena is a non-clinical wellness tool. It is not intended to diagnose, treat, or replace medical or psychological services.</li>
                <li>Using Siena does not create or imply a therapist-client or provider-patient relationship.</li>
                <li>While developed by licensed professionals, this platform is not governed by HIPAA because it is not a healthcare service or EHR system.</li>
                <li>Your personal data is encrypted and securely stored. Identifiable payment and login details are kept separate from your activity data where possible.</li>
              </ul>
            </section>

            {/* Your Agreement */}
            <section>
              <h3 className="font-semibold text-lg text-gray-900">Your Agreement</h3>
              <p className="mt-2 text-gray-600">By continuing, you confirm that:</p>
              <ul className="mt-2 space-y-2 text-gray-600 list-disc pl-6">
                <li>You understand that Siena is a wellness platform, not a clinical service.</li>
                <li>You acknowledge that the tools offered are educational and not substitutes for licensed care.</li>
                <li>You agree to our <a href="/terms-of-service" className="underline text-brand-green" target="_blank" rel="noopener noreferrer">Terms of Use</a> and <a href="/privacy" className="underline text-brand-green" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">
                If you are experiencing a mental health crisis or need immediate help, please contact a licensed mental health provider or dial emergency services in your area. This app is not intended for emergency or crisis use.
              </p>
            </section>
          </div>

          <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-4">
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={hasRead}
                onChange={(e) => setHasRead(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green focus:ring-2 focus:ring-offset-2"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-600 cursor-pointer">
                I have read and agree to the above terms and understand that Siena is a non-clinical, self-guided wellness platform.
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={handleDecline}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Decline'}
              </Button>
              <Button 
                onClick={handleAccept} 
                disabled={!hasRead || isLoading}
                className={`${!hasRead ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Processing...' : 'Accept & Continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}