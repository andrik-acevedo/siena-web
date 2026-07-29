// src/components/settings/DisplayNameSettings.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { generateDisplayName, randomEmoji } from '../../lib/usernameGenerator';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';

export default function DisplayNameSettings() {
  const { updateUserData } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current display name
  useEffect(() => {
    (async () => {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_emoji')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Load handle error:', error);
        setError('Could not load your handle.');
        return;
      }

      if (data) {
        setDisplayName(data.display_name ?? '');
        setEmoji(data.avatar_emoji ?? '');
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user: authUser },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!authUser) throw new Error('No authenticated user');

      // 1) ensure uniqueness (excluding my own row)
      let name = (displayName || '').trim() || generateDisplayName();
      for (let i = 0; i < 5; i++) {
        const { data: existing, error } = await supabase
          .from('profiles')
          .select('id')
          .ilike('display_name', name)
          .neq('id', authUser.id)
          .maybeSingle();
        if (error) throw error;
        if (!existing) break; // unique
        name = generateDisplayName();
      }

      const chosenEmoji = emoji || randomEmoji();

      // 2) does my row exist?
      const { data: row, error: loadErr } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', authUser.id)
        .maybeSingle();
      if (loadErr) throw loadErr;

      if (row) {
        // 3a) UPDATE path
        const { error: updErr } = await supabase
          .from('profiles')
          .update({
            display_name: name,
            avatar_emoji: chosenEmoji,
            onboarding_completed: true, // harmless if column doesn’t exist
          })
          .eq('id', authUser.id);
        if (updErr) throw updErr;
      } else {
        // 3b) INSERT path (must include NOT NULL columns like email)
        const email = authUser.email?.toLowerCase() || '';
        if (!email) {
          // if your schema requires email NOT NULL, we must send it
          throw new Error('Email missing; cannot create profile row.');
        }
        const { error: insErr } = await supabase.from('profiles').insert([
          {
            id: authUser.id,
            email,
            display_name: name,
            avatar_emoji: chosenEmoji,
            onboarding_completed: true,
            // optional safe defaults:
            subscription_status: 'active',
            subscription_tier: 'basic',
            timezone: 'America/New_York',
          },
        ]);
        if (insErr) throw insErr;
      }

      // 4) reflect immediately in context so the header updates
      await updateUserData({
        display_name: name,
        avatar_emoji: chosenEmoji,
        onboarding_completed: true,
      });

      setDisplayName(name);
      setEmoji(chosenEmoji);
    } catch (e: any) {
      console.error('Save handle error:', e);
      setError(e?.message || 'Failed to save your handle.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">Public Display Name</h2>
        <p className="mt-1 text-sm text-gray-500">
          This is the fun username and emoji that others (or your partner) may see.
          It’s separate from your email or real name.
        </p>

        <div className="mt-4 flex gap-2 items-center">
          <input
            className="flex-1 border rounded p-2 text-gray-900"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g., SereneSloth"
          />
          <Button onClick={() => setDisplayName(generateDisplayName())} variant="outline">
            Shuffle
          </Button>
          <Button onClick={() => setEmoji(randomEmoji())} variant="outline">
            {emoji || '🙂'}
          </Button>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-4">
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </section>
  );
}
