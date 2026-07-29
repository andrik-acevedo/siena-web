// src/lib/handle.ts

// Small, friendly list. Add more anytime.
const ADJECTIVES = [
  "Calm","Bright","Kind","Brave","Gentle","Quiet","Happy","Lively","Zen","Steady",
  "Serene","Mindful","Curious","Playful","Patient","Present","Resilient","Grounded",
  "Open","Warm","Clever","Candid","Centered","Grateful","Hopeful","Spry","Mellow",
  "Sunny","True","Clear","Still","Soft","Noble","Wise",
  // fun & wacky adds:
  "Zany","Cheeky","Bubbly","Wiggly","Groovy","Snazzy","Quirky","Whimsical","Goofy",
  "Cosmic","Loopy","Giddy","Funky","Dizzy","Peppy","Spunky","Kooky","Snuggly"
];

const NOUNS = [
  "Otter","Pine","River","Haven","Meadow","Harbor","Oak","Cedar","Willow","Trail",
  "Sloth","Mongoose","Zebra","Alpaca","Cactus","Koala","Lantern","Compass","Anchor",
  "Whisperer","Listener","Reflector","Explorer","Boundary","Repair","Insight","Breath",
  "Journaling","Affirmation","Sky","Sage","Cove","Grove","Pebble","Brook","Dawn",
  "Lake","Vista",
  // fun & wacky adds:
  "Platypus","Banana","Pickle","Muffin","Noodle","Waffle","Taco","Unicorn","Penguin",
  "Marshmallow","DiscoBall","Toaster","Cupcake","Kangaroo","PogoStick","Spaceship",
  "Rainbow","Bubble","Moose","Slime","Donut","Llama","Yeti"
];


// Simple emoji pool for default avatars.
const EMOJIS = [
  "🌿","🌊","✨","🌙","☀️","🦋","🌸","🍃","🪷","🌼","🍀","🌻","🌟","🔥","🌈","🫶","💫","🧘","🪴","🌤️"
];

// --- helpers ---
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// e.g. CalmOtter
function baseHandle(): string {
  return `${pick(ADJECTIVES)}${pick(NOUNS)}`;
}

// Public: grab a random emoji for avatar_emoji
export function randomEmoji(): string {
  return pick(EMOJIS);
}

/**
 * Generate a unique display handle and verify it doesn't exist in `profiles.display_name`.
 * Relies on your UNIQUE index on lower(display_name).
 *
 * Usage:
 *   const handle = await generateUniqueHandle(supabase);
 */
export async function generateUniqueHandle(
  supabase: any,
  { maxTries = 120 }: { maxTries?: number } = {}
): Promise<string> {
  for (let i = 0; i < maxTries; i++) {
    // First try plain "CalmOtter", then add zero-padded number like "CalmOtter07", "CalmOtter342"
    const suffix =
      i === 0 ? "" : String(Math.floor(Math.random() * 1000)).padStart(2, "0");

    const candidate = `${baseHandle()}${suffix}`;

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .ilike("display_name", candidate)
      .maybeSingle();

    if (error) throw error;
    if (!data) return candidate; // free to use
  }

  // worst case — fall back to a timestamped handle
  return `Member${Date.now().toString().slice(-6)}`;
}
