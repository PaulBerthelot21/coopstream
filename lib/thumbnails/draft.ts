import type { ThumbnailEditorState } from "./types"

function openDrafts(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("lecalme-studio", 1)
    request.onupgradeneeded = () => request.result.createObjectStore("drafts")
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function readDraft(): Promise<ThumbnailEditorState | undefined> {
  const db = await openDrafts()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("drafts", "readonly")
    const req = tx.objectStore("drafts").get("current")
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    tx.oncomplete = () => db.close()
  })
}

export async function saveDraft(state: ThumbnailEditorState): Promise<void> {
  const db = await openDrafts()
  return new Promise((resolve, reject) => {
    const tx = db.transaction("drafts", "readwrite")
    tx.objectStore("drafts").put(state, "current")
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = () => { db.close(); reject(tx.error) }
    tx.onabort = () => { db.close(); reject(tx.error) }
  })
}
