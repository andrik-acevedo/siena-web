import { Clock, MessageCircle, Star, Zap } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { useMessageLimit } from '../../context/MessageLimitContext';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export default function MessageLimitDisplay() {
  const { currentPlan } = useSubscription();
  const { remainingMessages, totalMessages, isLimitReached, timeUntilReset } = useMessageLimit();
  const navigate = useNavigate();

  console.log('📊 MessageLimitDisplay render:', { 
    currentPlan, 
    remainingMessages, 
    totalMessages, 
    isLimitReached,
    usedMessages: totalMessages - remainingMessages
  });

  // Don't show for non-basic users
  if (currentPlan !== 'basic') {
    return null;
  }

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="bg-gradient-to-r from-[#021E3C] to-[#03274B] border border-gray-200/20 rounded-xl p-5 mb-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-green/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      
      <div className="relative z-10">
        {/* Header with message count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-brand-green/20 rounded-lg">
                <MessageCircle className="h-5 w-5 text-brand-green" />
              </div>
              <div>
                <span className="text-white font-semibold text-lg">
                  Daily Messages
                </span>
                <div className="text-brand-green font-bold text-xl">
                  {totalMessages - remainingMessages}/{totalMessages}
                </div>
              </div>
            </div>
          </div>

          {isLimitReached && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Resets in {timeUntilReset}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span className="font-medium">Messages used today</span>
            <span className="font-bold">{Math.round(((totalMessages - remainingMessages) / totalMessages) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ease-out relative ${
                isLimitReached 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : remainingMessages <= 1 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                    : 'bg-gradient-to-r from-brand-green to-emerald-500'
              }`}
              style={{
                width: `${((totalMessages - remainingMessages) / totalMessages) * 100}%`
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Upgrade Button */}
        <div className="space-y-4">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-brand-green via-teal-600 to-brand-green hover:from-teal-500 hover:via-brand-green hover:to-teal-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border border-brand-green/30 hover:border-brand-green/50"
          >
            <div className="flex items-center justify-center space-x-2">
              <Star className="h-4 w-4 fill-current text-yellow-300" />
              <span className="text-sm font-semibold">Upgrade for Unlimited</span>
              <div className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
                PLUS
              </div>
            </div>
          </Button>

          {isLimitReached && (
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4 mt-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                  <Zap className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-red-400 font-semibold text-sm">
                    Daily message limit reached
                  </p>
                  <p className="text-red-300/80 text-sm leading-relaxed">
                    Upgrade to <span className="font-semibold text-yellow-400">Plus</span> or <span className="font-semibold text-yellow-400">Premium</span> for unlimited AI therapist conversations, or wait {timeUntilReset} for your messages to reset.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 