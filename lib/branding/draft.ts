let database: Promise<IDBDatabase> | undefined
function openDatabase() {
  if (!database) database = new Promise((resolve, reject) => {
    const request = indexedDB.open("coopstream-branding", 1)
    request.onupgradeneeded = () => request.result.createObjectStore("drafts")
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => { database = undefined; reject(request.error) }
  })
  return database
}
export async function readBrandingDraft(key: string): Promise<unknown> {
  try {
    const db = await openDatabase()
    const result = await new Promise<unknown>((resolve, reject) => {
      const request = db.transaction("drafts").objectStore("drafts").get(key)
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error)
    })
    if (result !== undefined) return result
  } catch { /* Read the original browser draft if the database is unavailable. */ }
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : undefined
}
export async function saveBrandingDraft(key: string, design: unknown) {
  try {
    const db = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("drafts", "readwrite")
      tx.objectStore("drafts").put(design, key)
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error)
    })
  } catch { localStorage.setItem(key, JSON.stringify(design)) }
}
