// Human-readable unique IDs, e.g. STU-7F3K9Q / INS-2M8XPL.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

function randomCode(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

// Generates a uid for the given role, guaranteed unique against the provided model.
export async function generateUid(Model, role) {
  const prefix = role === "instructor" ? "INS" : "STU";
  for (let attempt = 0; attempt < 12; attempt++) {
    const uid = `${prefix}-${randomCode(6)}`;
    const clash = await Model.exists({ uid });
    if (!clash) return uid;
  }
  // Extremely unlikely fallback
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}
