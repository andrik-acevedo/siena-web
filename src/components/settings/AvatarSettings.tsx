import { useEffect, useState } from 'react';
import { Check, Image as ImageIcon } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import toast from 'react-hot-toast';

// Keep in sync with OnboardingModal
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

export default function AvatarSettings() {
  const { userData, updateUserData } = useUser();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // optional: allow a custom URL
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    setSelected((userData as any)?.avatar_url || null);
  }, [userData?.id, (userData as any)?.avatar_url]);

  const save = async (nextUrl: string | null) => {
    setSaving(true);
    setError(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error('No authenticated user.');

      const { error: updErr } = await supabase
        .from('profiles')
        .update({ avatar_url: nextUrl })
        .eq('id', uid);
      if (updErr) throw updErr;

      await updateUserData({ avatar_url: nextUrl });
      toast.success(nextUrl ? 'Avatar updated!' : 'Avatar cleared (emoji will be used).');
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Could not save avatar.');
    } finally {
      setSaving(false);
    }
  };

  const onSaveClick = () => save(selected);
  const onClear = () => { setSelected(null); save(null); };
  const onUseCustom = () => {
    const url = (customUrl || '').trim();
    if (!url) return;
    setSelected(url);
  };

  return (
    <section className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2 text-[#01B1AF]" />
          Avatar
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Pick an avatar for your account. This shows next to your wellness name across the app.
        </p>

        {/* Current */}
        <div className="mt-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
            {selected ? (
              <img src={selected} alt="Current avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl">{userData?.avatar_emoji || '🌿'}</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {selected ? 'Using a custom image avatar.' : 'No image selected — using emoji fallback.'}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-5 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {AVATAR_URLS.map((url) => {
            const isSel = selected === url;
            return (
              <button
                key={url}
                onClick={() => setSelected(url)}
                className={[
                  'relative rounded-xl border bg-white p-1 shadow-sm transition focus:outline-none',
                  isSel ? 'border-[#01B1AF] ring-2 ring-[#01B1AF]/30' : 'border-gray-200 hover:border-gray-300'
                ].join(' ')}
                aria-label="Select avatar"
              >
                <img
                  src={url}
                  alt="Avatar option"
                  className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-lg mx-auto"
                  loading="lazy"
                />
                {isSel && (
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#01B1AF] text-white flex items-center justify-center shadow">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom URL (optional) */}
        <div className="mt-5 flex gap-2">
          <input
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Or paste a custom image URL…"
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
          />
          <Button variant="outline" onClick={onUseCustom}>Use</Button>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <Button onClick={onSaveClick} disabled={saving}>
            {saving ? 'Saving…' : 'Save Avatar'}
          </Button>
          <Button variant="outline" onClick={onClear} disabled={saving}>
            Use Emoji Instead
          </Button>
        </div>
      </div>
    </section>
  );
}
