"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Inbox,
  Mail,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { Extraction, extractionSchema, toNotice } from "@/lib/analyzer";
import { Notice, Profile, dateLabel } from "@/lib/data";

type CollegeMessage = {
  id: string;
  sender: string;
  address: string;
  subject: string;
  received: string;
  preview: string;
  body: string;
  label: "Placement" | "Academic" | "Event" | "Scholarship";
};

const messages: CollegeMessage[] = [
  {
    id: "mail-tcs",
    sender: "Training & Placement Cell",
    address: "placements@campus.edu",
    subject: "TCS Digital Hiring 2026 — registrations open",
    received: "Today, 9:12 AM",
    preview: "Eligible CSE and IT students can register until 18 September.",
    label: "Placement",
    body: "TCS Digital Hiring 2026\nEligible: CSE and IT, final-year students. Minimum CGPA 7.0 with no active backlogs. Registration closes 18 September 2026 at 5 PM IST. Register on the placement portal, upload your resume, and complete the online assessment. Shortlisted candidates will attend an interview.",
  },
  {
    id: "mail-exam",
    sender: "Examination Cell",
    address: "examcell@campus.edu",
    subject: "Semester examination form closes tomorrow",
    received: "Yesterday, 4:30 PM",
    preview: "Confirm your subjects and submit the examination form before 5 PM.",
    label: "Academic",
    body: "Semester examination registration\nAll students must confirm their subjects and submit the examination form. The deadline is 17 September 2026 at 5 PM IST. No action is required from students who have already submitted the form.",
  },
  {
    id: "mail-scholarship",
    sender: "Student Welfare Office",
    address: "welfare@campus.edu",
    subject: "Applications invited: Merit Scholarship 2026",
    received: "15 Sep, 11:05 AM",
    preview: "Students with a CGPA of 8.0 or above may apply this month.",
    label: "Scholarship",
    body: "Merit Scholarship 2026\nStudents from all branches and years with a minimum CGPA of 8.0 may apply. Submit your marksheet and income certificate by 26 September 2026 at 5 PM IST. Backlog policy is not specified.",
  },
  {
    id: "mail-workshop",
    sender: "AWS Cloud Club",
    address: "cloudclub@campus.edu",
    subject: "Build and deploy: cloud workshop this Saturday",
    received: "14 Sep, 2:18 PM",
    preview: "A hands-on session for students from every branch and year.",
    label: "Event",
    body: "Cloud Computing Workshop\nOpen to all branches and years. Join a hands-on cloud deployment session on 22 September 2026 at 10 AM IST. Registration closes 20 September 2026 at 11:59 PM IST. Bring your laptop and campus ID.",
  },
];

export function CollegeMail({
  profile,
  onAdd,
}: {
  profile: Profile;
  onAdd: (notice: Notice) => void;
}) {
  const [selectedId, setSelectedId] = useState(messages[0].id);
  const [read, setRead] = useState<string[]>([]);
  const [starred, setStarred] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Extraction | null>(null);
  const [mode, setMode] = useState("");
  const selected = messages.find((message) => message.id === selectedId);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("campuspulse-mail-v1") || "{}");
      setRead(Array.isArray(saved.read) ? saved.read : []);
      setStarred(Array.isArray(saved.starred) ? saved.starred : []);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "campuspulse-mail-v1",
      JSON.stringify({ read, starred }),
    );
  }, [read, starred]);

  const filtered = useMemo(
    () =>
      messages.filter(
        (message) =>
          (!onlyUnread || !read.includes(message.id)) &&
          `${message.sender} ${message.subject} ${message.preview}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [onlyUnread, query, read],
  );

  function openMessage(id: string) {
    setSelectedId(id);
    setResult(null);
    setError("");
    setRead((current) => [...new Set([...current, id])]);
  }

  async function analyze() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `${selected.subject}\nFrom: ${selected.sender}\n\n${selected.body}`,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "The email could not be analyzed.");
      setResult(extractionSchema.parse(body.extraction));
      setMode(body.mode || "AI analysis");
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-heading mail-heading">
        <div>
          <h1>Your college mail, made actionable.</h1>
          <p>Read campus updates, understand the important parts, and turn deadlines into tracked opportunities.</p>
        </div>
        <span className="mail-account"><Mail size={16} /> {profile.name.toLowerCase().replace(/\s+/g, ".")}@campus.edu</span>
      </div>
      <div className="mail-shell panel">
        <aside className="mail-list-pane">
          <div className="mail-list-title">
            <span><Inbox size={18} /> Inbox</span>
            <strong>{messages.length - read.length}</strong>
          </div>
          <label className="mail-search">
            <Search size={16} />
            <input aria-label="Search college mail" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search mail" />
          </label>
          <button className={`mail-filter ${onlyUnread ? "active" : ""}`} aria-pressed={onlyUnread} onClick={() => setOnlyUnread(!onlyUnread)}>
            {onlyUnread ? "Showing unread" : "Show unread only"}
          </button>
          <div className="mail-message-list">
            {filtered.map((message) => (
              <button key={message.id} className={`mail-row ${selectedId === message.id ? "selected" : ""} ${read.includes(message.id) ? "read" : "unread"}`} onClick={() => openMessage(message.id)}>
                <span className="mail-row-top"><strong>{message.sender}</strong><small>{message.received}</small></span>
                <span className="mail-subject">{message.subject}</span>
                <span className="mail-preview">{message.preview}</span>
                <span className="mail-label">{message.label}</span>
              </button>
            ))}
            {!filtered.length && <div className="mail-empty"><Search size={20} /><p>No matching messages.</p></div>}
          </div>
        </aside>
        <section className="mail-reader">
          {selected ? (
            <>
              <div className="mail-reader-actions">
                <button className="icon-button mobile-mail-back" aria-label="Back to inbox" onClick={() => setSelectedId("")}><ArrowLeft size={17} /></button>
                <button className={`icon-button ${starred.includes(selected.id) ? "is-starred" : ""}`} aria-label={starred.includes(selected.id) ? "Remove star" : "Star message"} onClick={() => setStarred((current) => current.includes(selected.id) ? current.filter((id) => id !== selected.id) : [...current, selected.id])}><Star size={17} fill={starred.includes(selected.id) ? "currentColor" : "none"} /></button>
              </div>
              <span className="mail-label">{selected.label}</span>
              <h2>{selected.subject}</h2>
              <div className="mail-sender"><span>{selected.sender[0]}</span><div><strong>{selected.sender}</strong><small>{selected.address} · {selected.received}</small></div></div>
              <div className="mail-body">{selected.body}</div>
              <div className="mail-ai-action">
                <div><strong><Sparkles size={16} /> Find the action in this email</strong><p>Gemini will extract dates, eligibility, documents, and next steps.</p></div>
                <button className="primary-button" disabled={busy} onClick={analyze}>{busy ? "Analyzing…" : "Analyze email"}<ArrowRight size={16} /></button>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              {result && (
                <div className="mail-analysis" aria-live="polite">
                  <div><span className="status-badge green"><Check size={14} /> {mode}</span><h3>{result.title}</h3><p>{result.summary}</p></div>
                  <dl><div><dt>Deadline</dt><dd>{result.deadline ? dateLabel(result.deadline) : "Confirm with sender"}</dd></div><div><dt>Actions</dt><dd>{result.actions.length || "No action"}</dd></div><div><dt>Confidence</dt><dd>{Math.round(result.confidence * 100)}%</dd></div></dl>
                  <button className="secondary-button" onClick={() => onAdd(toNotice(result, `${selected.subject}\n${selected.body}`))}>Add to opportunities <ArrowRight size={15} /></button>
                </div>
              )}
            </>
          ) : <div className="mail-empty"><Inbox size={28} /><p>Select a message to read it.</p></div>}
        </section>
      </div>
      <p className="mail-demo-note">Demo inbox with synthetic campus messages. Email analysis uses the configured AI provider; your resume is never sent.</p>
    </>
  );
}
