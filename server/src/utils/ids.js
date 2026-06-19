const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 

function randomCode(len = 6) {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

export async function generateUid(Model, role) {
  const prefix = role === "instructor" ? "INS" : "STU";
  for (let attempt = 0; attempt < 12; attempt++) {
    const uid = `${prefix}-${randomCode(6)}`;
    const clash = await Model.exists({ uid });
    if (!clash) return uid;
  }
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}
