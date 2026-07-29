// -----------------------------
// src/lib/usernameGenerator.ts
// -----------------------------
const ADJECTIVES = [
"Serene","Mindful","Curious","Steady","Gentle","Brave","Playful","Patient","Present","Resilient",
"Grounded","Open","Warm","Clever","Calm","Candid","Kind","Centered","Grateful","Hopeful",
];


const THERAPY_NOUNS = [
"Sloth","Mongoose","Zebra","Otter","Alpaca","Cactus","Koala","Lantern","Compass","Anchor",
"Whisperer","Listener","Reflector","Explorer","Boundary","Repair","Insight","Breath","Journaling","Affirmation"
];


const FUN_SUFFIXES = ["Dr","Coach","Prof","Guru", null];


function randomItem<T>(arr: T[]) { return arr[Math.floor(Math.random()*arr.length)]; }


export function generateDisplayName(seed?: number) {
if (typeof seed === "number") {
// tiny deterministic LCG for optional repeatability
let s = (seed >>> 0) || 1;
const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const adj = ADJECTIVES[Math.floor(rnd() * ADJECTIVES.length)];
const noun = THERAPY_NOUNS[Math.floor(rnd() * THERAPY_NOUNS.length)];
const suffix = FUN_SUFFIXES[Math.floor(rnd() * FUN_SUFFIXES.length)];
return suffix ? `${suffix}. ${adj} ${noun}` : `${adj} ${noun}`;
}
const adj = randomItem(ADJECTIVES);
const noun = randomItem(THERAPY_NOUNS);
const suffix = randomItem(FUN_SUFFIXES);
return suffix ? `${suffix}. ${adj} ${noun}` : `${adj} ${noun}`;
}


export const EMOJIS = ["🦥","🦓","🦙","🦫","🧠","💚","🪴","🧭","🪞","🌿","🫁","📝","🧩","🫶","🔄","🏷️","🪺","🪷"];


export function randomEmoji(){ return EMOJIS[Math.floor(Math.random()*EMOJIS.length)]; }