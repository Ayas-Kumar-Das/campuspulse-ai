export type ResumeRecord = {
  student: string;
  name: string;
  size: number;
  type: string;
  updatedAt: string;
  file: Blob;
};
async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("campuspulse-files", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("resumes", { keyPath: "student" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Local file storage is unavailable."));
  });
}
export async function getResume(student: string) {
  const db = await database();
  return new Promise<ResumeRecord | undefined>((resolve, reject) => {
    const tx = db.transaction("resumes", "readonly");
    const req = tx.objectStore("resumes").get(student);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new Error("Could not read the saved resume."));
    tx.oncomplete = () => db.close();
  });
}
export async function saveResume(student: string, file: File) {
  if (!/\.(pdf|docx|txt)$/i.test(file.name))
    throw new Error("Choose a PDF, DOCX, or TXT resume.");
  if (file.size > 5 * 1024 * 1024 || file.size === 0)
    throw new Error("Choose a nonempty resume up to 5 MB.");
  const record: ResumeRecord = {
    student,
    name: file.name,
    size: file.size,
    type: file.type,
    updatedAt: new Date().toISOString(),
    file,
  };
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("resumes", "readwrite");
    tx.objectStore("resumes").put(record);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () =>
      reject(
        new Error(
          "Could not save the resume. Your previous file is unchanged.",
        ),
      );
  });
  return record;
}
export async function removeResume(student: string) {
  const db = await database();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("resumes", "readwrite");
    tx.objectStore("resumes").delete(student);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(new Error("Could not remove your resume."));
  });
}
