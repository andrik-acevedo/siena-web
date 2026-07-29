import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PasswordReset() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [initializing, setInitializing] = useState(true);

  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const validatePassword = (pwd) => {
    return {
      length: pwd.length >= 6,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd)
    };
  };

  const passwordChecks = validatePassword(password);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  useEffect(() => {
    const initialize = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type') || 'recovery';
        const tokenHash = params.get('token_hash');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (!tokenHash && !accessToken) throw new Error('Missing reset token');

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash || undefined,
          token: accessToken || undefined,
          type
        });

        if (error) throw error;

        const session = data.session;
        if (!session) throw new Error('No session created from token');

        setUserEmail(data.user?.email || session.user.email || '');
        setIsRecoveryMode(true);
        setError('');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setIsRecoveryMode(false);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  const handlePasswordUpdate = async () => {
    if (!isPasswordValid) return setError('Password does not meet requirements');
    if (!passwordsMatch) return setError('Passwords do not match');

    setLoading(true);
    setError('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Session expired or not found.');

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Success!</h2>
          <p className="text-gray-600 mt-2">Your password has been updated successfully.</p>
          <p className="text-sm text-gray-500 mt-4">Redirecting to login in 3 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-gray-600">
            {userEmail ? `Setting new password for ${userEmail}` : 'Enter your new password'}
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-6">
          {initializing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-700 text-sm">Processing reset link...</span>
              </div>
            </div>
          )}

          {!initializing && isRecoveryMode && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-700 text-sm">Ready to reset password</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={initializing || !isRecoveryMode}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-3 space-y-1">
                {Object.entries({
                  length: 'At least 6 characters',
                  uppercase: 'One uppercase letter',
                  lowercase: 'One lowercase letter',
                  number: 'One number',
                }).map(([key, label]) => (
                  <div key={key} className={`flex items-center space-x-2 text-sm ${passwordChecks[key] ? 'text-green-600' : 'text-gray-400'}`}>
                    {passwordChecks[key] ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 border border-gray-300 rounded-full" />}
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={initializing || !isRecoveryMode}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword && (
                <div className={`flex items-center space-x-2 text-sm mt-2 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordsMatch ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handlePasswordUpdate}
            disabled={loading || initializing || !isRecoveryMode || !isPasswordValid || !passwordsMatch}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading || initializing || !isRecoveryMode || !isPasswordValid || !passwordsMatch
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating Password...</span>
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
