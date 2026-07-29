import { useEffect, useMemo, useState } from 'react';
import { X, Sparkles, Check, Download } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { generateUniqueHandle } from '../../lib/handle';

// ==== NEW: A2HS image for onboarding ====
const A2HS_IMAGE =
  'https://static.wixstatic.com/media/4e16d8_ee0c8258c0d042728bfab6455d4c6d99~mv2.png';

// ==== Your avatar URLs ====
const AVATAR_URLS = [
  "https://static.wixstatic.com/media/4e16d8_78ae0e6f090c464a942d0b4bde0ccc1a~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_5a82753f4fd14dd3bdd4ca19c7b676fe~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_54bb88c8f1854acd8e588de305d83b86~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_2e46ea288bf5456cb6101e3956cc7bda~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_5a9cbc9fd22a485e93d72d906c2a7d69~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_6d862bcde3b141a184b97ed1fab848cf~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_c05c5d82570b4e88b9eca0da00028f1b~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_05c72f6f934347e3b9d690a16b16911e~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_ec94751b988848ee8eb9021a30d3492a~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_6108ce85d7fe488595c4e72c2db04de8~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_61cf3da1b8214597a510d69cc4fa545d~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_1734e98936be4fb398f80ef61a161dd1~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_7ff00fd1deda429a8b3dca16334f5b44~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_16df2b8dff1444d09b08d0afc3fc7daf~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_c87a2cb5762c4568be30287919bd9145~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_f23c90e4417e4baf94758365ee61b5c0~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_a48cea13cd994a70b216130e9633a6b9~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_8e218afc432448869dce6f0b7e0cd2d9~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_ae21b8502d8e47babd96927fab91b363~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_05417ad44b81465a9f22ebb02e1f0fcf~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_50059ca5b9474668a754da51d63c4509~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_21ec723f4b2e48138e2b2c78e6c99bf1~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_5fc366d62fa744d5b2c47edc7641d29c~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_e6f0f9ce550845a5bdac7cf44564af9b~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_ffc8c933eebb43fdad6f70782e7b2c68~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_88feb75724ff449386364c7e694e60ca~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_05e3b3b6994f479db913a460cb8affdf~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_a46992d8db4440f894dc9de7e4eb56e7~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_b8361753df32490d88bddaa58b04ad04~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_7e3404bcacb14ba1939b54933a3001cb~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_a1973105792b42aa8176001f89d4a7e9~mv2.png",
  "https://static.wixstatic.com/media/4e16d8_1f05810b3c0b444a921844d4dcf011e5~mv2.png",
];

type Props = {
  open: boolean;
  onClose: () => void;
  onCompleted?: () => void; // parent can refresh context or redirect
};

const FOCUS_OPTIONS = [
  { id: 'stress',        label: 'Reduce stress' },
  { id: 'relationships', label: 'Improve relationships' },
  { id: 'mindfulness',   label: 'Mindfulness & presence' },
  { id: 'sleep',         label: 'Better sleep' },
  { id: 'mood',          label: 'Mood balance' },
  { id: 'other',         label: 'Other' },
];

// Simple UA helpers
const isIOS = () =>
  typeof navigator !== 'undefined' &&
  /iphone|ipad|ipod/i.test(navigator.userAgent);

const isStandaloneDisplay = () => {
  // iOS Safari exposes navigator.standalone, others use matchMedia
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyNav = navigator as any;
  const iosStandalone = typeof anyNav !== 'undefined' && anyNav.standalone === true;
  const mql = typeof window !== 'undefined'
    ? window.matchMedia?.('(display-mode: standalone)')?.matches
    : false;
  return iosStandalone || !!mql;
};

export default function OnboardingModal({ open, onClose, onCompleted }: Props) {
  const { userData, updateUserData } = useUser();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // required
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // optional
  const [focus, setFocus] = useState<string | null>(null);
  const [goal, setGoal] = useState('');

  // A2HS state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState<boolean>(false);
  const [showA2HS, setShowA2HS] = useState<boolean>(true);

  // "show once" key
  const localOnceKey = useMemo(() => {
    const uid = userData?.id || 'anon';
    return `siena:onboarding:completed:${uid}`;
  }, [userData?.id]);

  // Prefill when opened
  useEffect(() => {
    if (!open) return;
    setError(null);

    setDisplayName((userData as any)?.display_name || '');
    setAvatarUrl((userData as any)?.avatar_url || null);
    // @ts-ignore
    setFocus(userData?.focus_area || null);
    // @ts-ignore
    setGoal(userData?.goal || '');
  }, [open, (userData as any)?.display_name, (userData as any)?.avatar_url]);

  // Auto-close if already completed
  useEffect(() => {
    if (!open) return;

    const serverDone = (userData as any)?.onboarding_completed === true;
    const hasIdentity = Boolean((userData as any)?.display_name && (userData as any)?.avatar_url);

    let localDone = false;
    try {
      localDone = localStorage.getItem(localOnceKey) === 'true';
    } catch {}

    if (serverDone || localDone || hasIdentity) {
      onClose();
    }
  }, [open, onClose, localOnceKey, (userData as any)?.onboarding_completed, (userData as any)?.display_name, (userData as any)?.avatar_url]);

  // A2HS listeners
  useEffect(() => {
    if (!open) return;

    const onBIP = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    setInstalled(isStandaloneDisplay());

    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [open]);

  const canFinish = (displayName?.trim().length ?? 0) >= 3 && Boolean(avatarUrl);

  const suggestHandle = async () => {
    try {
      const handle = await generateUniqueHandle(supabase);
      setDisplayName(handle);
    } catch (e) {
      console.error(e);
    }
  };

  const markCompletedLocally = () => {
    try { localStorage.setItem(localOnceKey, 'true'); } catch {}
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error('No authenticated user.');

      const cleanName = displayName.trim();
      if (cleanName.length < 3) throw new Error('Please choose a wellness name (min 3 chars).');
      if (!avatarUrl) throw new Error('Please pick an avatar.');

      // Ensure unique handle
      const { data: exists, error: checkErr } = await supabase
        .from('profiles')
        .select('id')
        .ilike('display_name', cleanName)
        .neq('id', uid)
        .maybeSingle();
      if (checkErr) throw checkErr;
      if (exists) throw new Error('That wellness name is taken. Try another.');

      const updateObj: Record<string, any> = {
        display_name: cleanName,
        avatar_url: avatarUrl,
        onboarding_completed: true,
      };
      if (focus !== null) updateObj.focus_area = focus;
      if (goal?.trim()) updateObj.goal = goal.trim();

      const { error: profErr } = await supabase.from('profiles').update(updateObj).eq('id', uid);
      if (profErr) throw profErr;

      const { data: fresh, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      updateUserData(fresh as any);

      markCompletedLocally();
      onCompleted?.();
      onClose();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Could not save your details.');
    } finally {
      setSaving(false);
    }
  };

  const handleInstallClick = async () => {
    try {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome !== 'accepted') {
        // user dismissed—no-op
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error(err);
    }
  };

  const showA2HSCard = showA2HS && !installed;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dimmer */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Wrapper */}
      <div className="absolute inset-0 flex items-end md:items-center justify-center p-0 md:p-6">
        <div
          className="
            w-full md:max-w-3xl xl:max-w-4xl
            md:rounded-2xl
            shadow-2xl overflow-hidden
            md:mx-auto
            h-[100svh] md:h-auto
            md:max-h-[90vh]
            flex flex-col
          "
          style={{ background: 'linear-gradient(135deg, #01B1AF 0%, #018A88 100%)' }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5" />
              <span className="uppercase tracking-wide text-xs opacity-90">Quick setup</span>
            </div>
            <button
              className="p-2 rounded hover:bg-white/10 text-white"
              onClick={() => { markCompletedLocally(); onClose(); }}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-28 md:pb-8 [padding-bottom:calc(24px+env(safe-area-inset-bottom))]">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Welcome to Siena!</h2>
              <p className="text-white/85 mt-1">Choose your wellness name and avatar.</p>
            </div>

            {/* === NEW: Add to Home Screen card === */}
            {showA2HSCard && (
              <div className="mt-6 bg-white rounded-2xl p-4 md:p-5 shadow-sm relative">
                <button
                  className="absolute top-3 right-3 p-1.5 rounded hover:bg-gray-100 text-gray-500"
                  onClick={() => setShowA2HS(false)}
                  aria-label="Hide add to home screen tip"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-1">
                    <Download className="h-5 w-5 text-[#01B1AF]" />
                  </div>
                  <div className="grow">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      Add Siena to your Home Screen
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Install Siena like an app for faster access, full-screen, and a smoother experience.
                    </p>

                    {/* Instruction/Image block */}
                    <div className="mt-3">
                      <img
                        src={A2HS_IMAGE}
                        alt="How to add this site to your home screen"
                        className="w-full rounded-xl border border-gray-200 shadow-sm"
                        loading="lazy"
                      />
                    </div>

                    {/* Platform-specific actions */}
                    <div className="mt-4">
                      {!isIOS() && deferredPrompt && (
                        <Button
                          onClick={handleInstallClick}
                          className="bg-[#01B1AF] hover:bg-[#019b99] text-white font-semibold rounded-xl px-4 py-2"
                        >
                          Install now
                        </Button>
                      )}

                      {(!deferredPrompt || isIOS()) && (
                        <div className="text-xs text-gray-600">
                          {isIOS() ? (
                            <ol className="list-decimal pl-4 space-y-1 mt-1">
                              <li>Tap the <span className="font-medium">Share</span> icon in Safari.</li>
                              <li>Select <span className="font-medium">Add to Home Screen</span>.</li>
                              <li>Tap <span className="font-medium">Add</span>.</li>
                            </ol>
                          ) : (
                            <p className="mt-1">
                              If you don’t see an install prompt, open the browser menu and choose
                              <span className="font-medium"> “Add to Home screen.”</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Name card */}
            <div className="mt-6 bg-white rounded-2xl p-4 md:p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">Wellness name</label>
              <div className="flex gap-2">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., ClearWillow"
                  className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
                />
                <Button variant="outline" onClick={suggestHandle} className="whitespace-nowrap rounded-xl">
                  ✨ Suggest
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Min 3 characters. Must be unique.</p>
            </div>

            {/* Avatar grid */}
            <div className="mt-4 bg-white rounded-2xl p-4 md:p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pick an avatar</label>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {AVATAR_URLS.map((url) => {
                  const selected = avatarUrl === url;
                  return (
                    <button
                      key={url}
                      onClick={() => setAvatarUrl(url)}
                      className={[
                        'relative rounded-xl border bg-white p-1 shadow-sm transition focus:outline-none',
                        selected
                          ? 'border-[#01B1AF] ring-2 ring-[#01B1AF]/30'
                          : 'border-gray-200 hover:border-gray-300'
                      ].join(' ')}
                      aria-label="Select avatar"
                    >
                      <img
                        src={url}
                        alt="Avatar"
                        className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-lg mx-auto"
                        loading="lazy"
                      />
                      {selected && (
                        <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#01B1AF] text-white flex items-center justify-center shadow">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {!avatarUrl && (
                <p className="mt-2 text-xs text-gray-500">Please choose one to continue.</p>
              )}
            </div>

            {/* Focus (optional) */}
            <div className="mt-4 bg-white rounded-2xl p-4 md:p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary focus right now <span className="text-gray-400">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFocus(opt.id === focus ? null : opt.id)}
                    className={`rounded-full px-3 py-2 text-sm border transition
                      ${focus === opt.id
                        ? 'border-[#01B1AF] text-[#01B1AF] bg-[#01B1AF]/10'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal (optional) */}
            <div className="mt-4 bg-white rounded-2xl p-4 md:p-5 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                One sentence goal <span className="text-gray-400">(optional)</span>
              </label>
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder='e.g., "Feel calmer during the workweek."'
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="
              md:static md:mt-0
              fixed bottom-0 left-0 right-0
              md:rounded-b-2xl
              px-6 py-4
              flex items-center justify-between
              bg-transparent md:bg-transparent
              [padding-bottom:calc(16px+env(safe-area-inset-bottom))]
            "
          >
            <button
              type="button"
              onClick={() => { markCompletedLocally(); onClose(); }}
              className="text-white/95 hover:text-white underline underline-offset-4"
            >
              Skip for now
            </button>

            <Button
              onClick={saveAll}
              disabled={!canFinish || saving}
              className="bg-white text-[#017f7e] hover:bg-white/90 font-semibold px-5 py-2 rounded-xl"
            >
              {saving ? 'Saving…' : 'Finish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
