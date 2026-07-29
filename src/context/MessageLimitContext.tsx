import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';
import { useSubscription } from './SubscriptionContext';

interface MessageUsage {
  id?: string;
  user_id: string;
  date: string;
  message_count: number;
  created_at?: string;
  updated_at?: string;
}

interface MessageLimitContextType {
  remainingMessages: number;
  totalMessages: number;
  isLimitReached: boolean;
  timeUntilReset: string;
  canSendMessage: boolean;
  incrementMessageCount: () => Promise<boolean>;
  refreshUsage: () => Promise<void>;
}

const MessageLimitContext = createContext<MessageLimitContextType | undefined>(undefined);

const DAILY_MESSAGE_LIMIT = 10;

export function MessageLimitProvider({ children }: { children: ReactNode }) {
  const { authState } = useUser();
  const subscriptionContext = useSubscription();
  const { currentPlan, isLoading: subscriptionLoading } = subscriptionContext || { currentPlan: 'basic', isLoading: true };
  const [messageUsage, setMessageUsage] = useState<MessageUsage | null>(null);
  const [localMessageCount, setLocalMessageCount] = useState<number>(0);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];
  const isBasicUser = subscriptionContext && !subscriptionLoading && currentPlan === 'basic';
  const userId = authState.user?.id;

  // Don't load message usage until subscription is loaded
  const shouldLoadUsage = userId && isBasicUser && !subscriptionLoading && subscriptionContext;

  // Calculate time until midnight (reset time)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Load today's message usage
  const loadMessageUsage = useCallback(async () => {
    if (!shouldLoadUsage) {
      setMessageUsage(null);
      setLocalMessageCount(0);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('daily_message_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (error) {
        console.error('Error loading message usage:', error);
        return;
      }

      if (data) {
        setMessageUsage(data);
        setLocalMessageCount(data.message_count);
      } else {
        // Create new record for today
        const newUsage: MessageUsage = {
          user_id: userId,
          date: today,
          message_count: 0
        };
        
        const { data: created, error: createError } = await supabase
          .from('daily_message_usage')
          .insert(newUsage)
          .select()
          .single();

        if (createError) {
          console.error('Error creating message usage record:', createError);
          return;
        }

        setMessageUsage(created);
        setLocalMessageCount(0);
      }
    } catch (error) {
      console.error('Error in loadMessageUsage:', error);
    }
  }, [shouldLoadUsage, userId, today]);

  useEffect(() => {
    loadMessageUsage();
  }, [loadMessageUsage]);

  const refreshUsage = useCallback(async () => {
    await loadMessageUsage();
  }, [loadMessageUsage]);

  const incrementMessageCount = async (): Promise<boolean> => {
    if (!userId || !isBasicUser || !messageUsage || subscriptionLoading) {
      return true; // Allow unlimited messages for non-basic users
    }

    if (localMessageCount >= DAILY_MESSAGE_LIMIT) {
      return false; // Limit reached
    }

    // Update local state immediately for instant UI feedback
    const newCount = localMessageCount + 1;
    console.log('🔢 Incrementing message count:', { from: localMessageCount, to: newCount });
    setLocalMessageCount(newCount);

    // Update database in the background
    try {
      const { error } = await supabase
        .from('daily_message_usage')
        .update({ 
          message_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageUsage.id);

      if (error) {
        console.error('Error updating message count:', error);
        // Revert local state if database update fails
        setLocalMessageCount(localMessageCount);
        return false;
      }

      // Update the messageUsage state to keep it in sync
      setMessageUsage(prev => prev ? { ...prev, message_count: newCount } : null);
      
      return true;
    } catch (error) {
      console.error('Error in incrementMessageCount:', error);
      // Revert local state if database update fails
      setLocalMessageCount(localMessageCount);
      return false;
    }
  };

  // Calculate derived values using local state for immediate updates
  const currentCount = (isBasicUser && !subscriptionLoading && subscriptionContext) ? localMessageCount : 0;
  const remainingMessages = (isBasicUser && !subscriptionLoading && subscriptionContext) ? Math.max(0, DAILY_MESSAGE_LIMIT - currentCount) : Infinity;
  const isLimitReached = (isBasicUser && !subscriptionLoading && subscriptionContext) && currentCount >= DAILY_MESSAGE_LIMIT;
  const canSendMessage = subscriptionLoading || !subscriptionContext || !isBasicUser || !isLimitReached;

  const value: MessageLimitContextType = {
    remainingMessages: (isBasicUser && !subscriptionLoading && subscriptionContext) ? remainingMessages : Infinity,
    totalMessages: (isBasicUser && !subscriptionLoading && subscriptionContext) ? DAILY_MESSAGE_LIMIT : Infinity,
    isLimitReached,
    timeUntilReset,
    canSendMessage,
    incrementMessageCount,
    refreshUsage
  };

  return (
    <MessageLimitContext.Provider value={value}>
      {children}
    </MessageLimitContext.Provider>
  );
}

export function useMessageLimit(): MessageLimitContextType {
  const context = useContext(MessageLimitContext);
  if (context === undefined) {
    throw new Error('useMessageLimit must be used within a MessageLimitProvider');
  }
  return context;
}