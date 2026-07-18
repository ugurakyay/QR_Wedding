import { Zip, ZipPassThrough } from 'fflate';

/**
 * Streams each file directly from its URL (S3, browser-to-S3, no server
 * hop) into a single ZIP blob. Files are processed one at a time to keep
 * peak memory bounded to roughly one file's size plus the zip built so far.
 */
export async function createZipBlob(entries, onProgress) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const zip = new Zip((err, data, final) => {
      if (err) {
        reject(err);
        return;
      }
      chunks.push(data);
      if (final) {
        resolve(new Blob(chunks, { type: 'application/zip' }));
      }
    });

    (async () => {
      for (let i = 0; i < entries.length; i++) {
        onProgress?.(i, entries.length);
        const { url, name } = entries[i];

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`${name}: HTTP ${response.status}`);
        }

        const entry = new ZipPassThrough(name);
        zip.add(entry);

        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            entry.push(new Uint8Array(0), true);
            break;
          }
          entry.push(value);
        }
      }
      zip.end();
    })().catch(reject);
  });
}

/**
 * One folder per uploader inside the zip: Ayse_Yilmaz/Ayse_Yilmaz_1.jpg,
 * Ayse_Yilmaz/Ayse_Yilmaz_2.mp4, ... The per-person counter keeps names
 * unique and the files identifiable even when moved out of their folder.
 */
export function buildZipEntryNames(items) {
  const counters = new Map();
  return items.map((item) => {
    const ext = item.key.includes('.') ? item.key.slice(item.key.lastIndexOf('.') + 1) : '';
    const base = item.uploaderName.replace(/\s+/g, '_');
    const n = (counters.get(base) ?? 0) + 1;
    counters.set(base, n);
    return `${base}/${base}_${n}${ext ? `.${ext}` : ''}`;
  });
}
