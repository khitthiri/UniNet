import api from "./client.js";

const readAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(",")[1]);
  reader.onerror = () => reject(new Error("Could not read the file."));
  reader.readAsDataURL(file);
});

// Upload a File object -> returns an attachment ref { kind:"file", fileId, name, mime, size }
export async function uploadFile(file) {
  if (file.size > 4 * 1024 * 1024) throw new Error(`"${file.name}" is larger than 4MB.`);
  const data = await readAsBase64(file);
  const res = await api.post("/api/files", { name: file.name, mime: file.type, size: file.size, data });
  return { kind: "file", fileId: res.data.id, name: res.data.name, mime: res.data.mime, size: res.data.size };
}

// Open/download an attachment (link opens in a tab; file downloads via authenticated fetch)
export async function openAttachment(att) {
  if (att.kind === "link") { window.open(att.url, "_blank", "noopener"); return; }
  const res = await api.get(`/api/files/${att.fileId}`);
  const { name, mime, data } = res.data;
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mime || "application/octet-stream" }));
  const a = document.createElement("a");
  a.href = url; a.download = name || "download";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export const prettySize = (n) => {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};
