const LEGACY_KEY = "coopstream-planning-editor-v1"
let database: Promise<IDBDatabase> | undefined

function openDatabase() {
  if (!database) database = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("coopstream-planning", 1)
    request.onupgradeneeded = () => request.result.createObjectStore("drafts")
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => { database = undefined; reject(request.error) }
  })
  return database
}

export async function readPlanningDraft(): Promise<unknown> {
  const drafts: { savedAt: number; draft: unknown }[] = []
  const collect = (value: unknown) => {
    if (value === undefined) return
    if (value && typeof value === "object" && "savedAt" in value && "draft" in value && typeof value.savedAt === "number") drafts.push({ savedAt: value.savedAt, draft: value.draft })
    else drafts.push({ savedAt: 0, draft: value })
  }
  try {
    const db = await openDatabase()
    const draft = await new Promise<unknown>((resolve, reject) => {
      const request = db.transaction("drafts").objectStore("drafts").get("current")
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    collect(draft)
  } catch { /* Older browsers can still use the original draft. */ }
  try {
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) collect(JSON.parse(legacy))
  } catch { /* An invalid legacy draft must not hide a valid database draft. */ }
  return drafts.sort((a, b) => b.savedAt - a.savedAt)[0]?.draft
}

export async function savePlanningDraft(draft: unknown) {
  const record = { savedAt: Date.now(), draft }
  try {
    const db = await openDatabase()
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("drafts", "readwrite")
      transaction.objectStore("drafts").put(record, "current")
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } catch {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(record))
  }
}
