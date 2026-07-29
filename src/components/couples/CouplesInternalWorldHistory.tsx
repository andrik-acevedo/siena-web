import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';

interface ReconnectionExercise {
  id: string;
  premium_user_id: string;
  entry_date: string;             // yyyy-MM-dd (week start)
  partner_a_summary: string;      // insight for premium user
  partner_b_summary: string;      // insight for invited partner
  audio_url?: string;
  created_at: string;
}

export default function CouplesInternalWorldHistory() {
  const { userData } = useUser();
  const navigate = useNavigate();

  const [exercises, setExercises] = useState<ReconnectionExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const exercisesPerPage = 5;

  // partner label (safe, public)
  const [partnerLabel, setPartnerLabel] = useState<string>('Partner');

  const isInvitedUser = !!userData?.invited_by;
  const myId = userData?.id || '';
  const premiumUserId = isInvitedUser ? userData!.invited_by : myId;

  useEffect(() => {
    if (!userData?.id) return;
    loadPartnerLabel();
  }, [userData?.id, userData?.invited_by]);

  useEffect(() => {
    if (!userData?.id) return;
    loadExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id, currentPage, userData?.invited_by]);

  const loadPartnerLabel = async () => {
    try {
      // Determine the OTHER user's id (the partner)
      const partnerId = isInvitedUser ? userData!.invited_by : await findInvitedPartnerId(myId);
      if (!partnerId) {
        setPartnerLabel('Partner');
        return;
      }

      // Safe public label
      const { data, error } = await supabase
        .from('public_profiles')
        .select('display_name, avatar_emoji')
        .eq('user_id', partnerId)
        .maybeSingle();
      if (error) throw error;

      const label = `${data?.avatar_emoji ?? '🙂'} ${data?.display_name ?? 'Partner'}`;
      setPartnerLabel(label);
    } catch {
      setPartnerLabel('Partner');
    }
  };

  const findInvitedPartnerId = async (ownerId: string): Promise<string | null> => {
    // We only need the ID; do not pull PII
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('invited_by', ownerId)
      .limit(1);
    if (error) {
      console.warn('profiles invited_by lookup error', error);
      return null;
    }
    return data?.[0]?.id ?? null;
  };

  const loadExercises = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // count for pagination
      const { count, error: countError } = await supabase
        .from('reconnection_exercises')
        .select('id', { count: 'exact', head: false })
        .eq('premium_user_id', premiumUserId);
      if (countError) throw countError;

      setTotalPages(Math.max(1, Math.ceil((count || 0) / exercisesPerPage)));

      // page fetch
      const from = (currentPage - 1) * exercisesPerPage;
      const to = from + exercisesPerPage - 1;

      const { data, error: dataError } = await supabase
        .from('reconnection_exercises')
        .select('*')
        .eq('premium_user_id', premiumUserId)
        .order('entry_date', { ascending: false })
        .range(from, to);

      if (dataError) throw dataError;

      setExercises(data || []);
    } catch (err) {
      console.error('Error loading exercises:', err);
      setError('Failed to load reconnection exercises. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reconnection exercise?')) return;

    try {
      const { error } = await supabase
        .from('reconnection_exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExercises((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error('Error deleting exercise:', err);
      setError('Failed to delete reconnection exercise. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8">
      <div className="mb-6">
        <Link
          to="/dashboard/internal-world"
          className="inline-flex items-center text-sm hover:underline text-brand-green"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Internal World
        </Link>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#ea697c] to-[#b8455c] p-8 mb-12">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">Reconnection History</h1>
          <p className="text-lg text-white/80">Review past reconnection exercises and insights</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {exercises.length === 0 ? (
        <div className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-lg p-8 text-center">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">No Reconnection Exercises Yet</h2>
          <p className="text-gray-400 mb-6">
            Complete your first weekly internal world entry with your partner to generate a reconnection
            exercise.
          </p>
          <Button
            onClick={() => navigate('/dashboard/internal-world')}
            className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
          >
            Start New Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {exercises.map((exercise) => {
            // Map "your" vs "partner" summaries depending on whether you're premium or invited
            const yourSummary = isInvitedUser
              ? exercise.partner_b_summary // invited user's insight
              : exercise.partner_a_summary; // premium user's insight
            const partnerSummary = isInvitedUser
              ? exercise.partner_a_summary
              : exercise.partner_b_summary;

            return (
              <div
                key={exercise.id}
                className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-[#ea697c]/20 p-2 rounded-full mr-3">
                        <Heart className="h-5 w-5 text-[#ea697c]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-white">
                          Week of {format(parseISO(exercise.entry_date), 'MMMM d, yyyy')}
                        </h2>
                        <p className="text-sm text-gray-400">
                          Created {format(parseISO(exercise.created_at), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(exercise.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete exercise"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          setExpandedExercise(
                            expandedExercise === exercise.id ? null : exercise.id
                          )
                        }
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {expandedExercise === exercise.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedExercise === exercise.id && (
                    <div className="mt-6 space-y-4">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-white font-medium mb-2">Your Summary</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{yourSummary}</p>
                      </div>

                      <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-white font-medium mb-2">{partnerLabel}'s Summary</h3>
                        <p className="text-gray-300 whitespace-pre-wrap">{partnerSummary}</p>
                      </div>

                      {exercise.audio_url && (
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h3 className="text-white font-medium mb-2">Audio Version</h3>
                          <audio controls className="w-full" src={exercise.audio_url}>
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex items-center px-4 text-white">
                  Page {currentPage} of {totalPages}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
