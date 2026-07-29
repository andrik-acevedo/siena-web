import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import { Shield, User, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export default function MakeAdminPage() {
  const { userData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeCurrentUserAdmin = async () => {
    if (!userData?.id) {
      setError('No user logged in');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userData.id);

      if (error) throw error;

      setSuccess(true);
      toast.success('You are now an admin! Refresh the page to see admin features.');
    } catch (err) {
      console.error('Error making user admin:', err);
      setError(err instanceof Error ? err.message : 'Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#03274B]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Not Logged In</h1>
          <p className="text-gray-300">Please log in first to use this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#03274B] px-4">
      <div className="max-w-md w-full bg-[#021E3C] rounded-lg p-8 text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-brand-green/20 mb-6">
          <Shield className="h-8 w-8 text-brand-green" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">Make Admin</h1>
        
        <div className="bg-white/5 p-4 rounded-lg mb-6 text-left">
          <h3 className="text-white font-medium mb-2">Current User:</h3>
          <p className="text-gray-300 text-sm">Email: {userData.email}</p>
          <p className="text-gray-300 text-sm">Role: {userData.role}</p>
          <p className="text-gray-300 text-sm">ID: {userData.id}</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center text-green-400">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-white">Success!</h2>
            <p className="text-gray-300">You are now an admin. Refresh the page or navigate to /dashboard/admin</p>
            <Button 
              onClick={() => window.location.href = '/dashboard/admin'}
              className="w-full bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
            >
              Go to Admin Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              This will promote your current account to admin role, giving you access to the admin dashboard and affiliate management.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              onClick={makeCurrentUserAdmin}
              disabled={isLoading || userData.role === 'admin'}
              className="w-full bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
            >
              {isLoading ? (
                'Updating...'
              ) : userData.role === 'admin' ? (
                'Already Admin'
              ) : (
                'Make Me Admin'
              )}
            </Button>

            {userData.role === 'admin' && (
              <p className="text-green-400 text-sm">
                You're already an admin! Go to /dashboard/admin
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}