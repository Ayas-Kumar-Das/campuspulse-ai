"use client";
import { useState } from "react";
import { Upload, FileText, Download, Trash2, Check } from "lucide-react";
import { ResumeRecord, saveResume, removeResume } from "@/lib/resume-store";
export function ResumeUpload({
  student,
  resume,
  onChange,
}: {
  student: string;
  resume: ResumeRecord | undefined;
  onChange: (r: ResumeRecord | undefined) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      onChange(await saveResume(student, file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel resume-panel">
      <h2>Your resume</h2>
      <p className="muted">Ready when the right opportunity comes along.</p>
      <label
        className="upload-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!busy) void upload(e.dataTransfer.files[0]);
        }}
      >
        <Upload size={24} />
        <strong>
          {busy
            ? "Saving your resume…"
            : resume
              ? "Drop a new resume to replace it"
              : "Drop your resume here"}
        </strong>
        <span>PDF, DOCX or TXT · up to 5 MB</span>
        <input
          aria-label="Upload resume"
          type="file"
          accept=".pdf,.docx,.txt"
          disabled={busy}
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {resume && (
        <div className="resume-file">
          <FileText size={23} />
          <div>
            <strong>{resume.name}</strong>
            <small>
              {Math.ceil(resume.size / 1024)} KB · Saved{" "}
              {new Date(resume.updatedAt).toLocaleDateString()}
            </small>
            <span className="eligible">
              <Check size={13} />
              Available for your action plans
            </span>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Download resume"
            onClick={() => {
              const url = URL.createObjectURL(resume.file);
              const a = document.createElement("a");
              a.href = url;
              a.download = resume.name;
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            <Download size={17} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Remove resume"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await removeResume(student);
                onChange(undefined);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Trash2 size={17} />
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <p className="file-privacy">
        Stored only in this browser for {student}. The file is not sent to AI or
        employers. Uploading does not certify skills or submit an application.
      </p>
    </section>
  );
}
