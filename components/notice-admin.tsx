"use client";
import { useState } from "react";
import {
  Upload,
  FileText,
  Check,
  ArrowRight,
  Plus,
  Users,
  ChartNoAxesCombined,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Notice,
  profiles,
  eligibility,
  initialNotices,
  dateLabel,
} from "@/lib/data";
export function AdminPanel({
  notices,
  onPublish,
}: {
  notices: Notice[];
  onPublish: (n: Notice) => void;
}) {
  const [tab, setTab] = useState("Notices");
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<Notice | null>(null);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);
  function process() {
    setError("");
    setPublished(false);
    if (text.trim().length < 30) {
      setError("Add a complete notice with a title and its requirements.");
      return;
    }
    if (notices.some((n) => n.source.trim() === text.trim())) {
      setError("This notice has already been published.");
      return;
    }
    const cgpa = text.match(
      /(?:CGPA\s*(?:≥|>=|:|of|minimum)?\s*)(\d(?:\.\d+)?)/i,
    );
    const date = text.match(/2026-\d{2}-\d{2}/);
    const branches = ["CSE", "IT", "ECE", "ME", "CE", "EE"].filter((b) =>
      new RegExp(`\\b${b}\\b`).test(text),
    );
    setDraft({
      id: `notice-${Date.now()}`,
      title: text.split("\n")[0].slice(0, 140),
      summary: text.split("\n").slice(1).join(" ").slice(0, 240) || text,
      source: text,
      org: "Campus Notice Studio",
      category: /hiring|placement/i.test(text)
        ? "Placement"
        : /hackathon/i.test(text)
          ? "Hackathon"
          : /scholarship/i.test(text)
            ? "Scholarship"
            : "Event",
      deadline: date ? `${date[0]}T17:00:00+05:30` : "",
      minCgpa: cgpa ? Number(cgpa[1]) : 0,
      branches,
      year: /final.year/i.test(text) ? 4 : 0,
      backlogs: /no active backlogs|0 backlogs/i.test(text) ? 0 : 99,
      score: 85,
      action: "View opportunity",
      unknown:
        "Rule-based draft. Confirm every eligibility requirement against the original notice.",
    });
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>A notice. A new possibility.</h1>
          <p>Turn campus announcements into student opportunities.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => {
            setTab("Upload notice");
            setPublished(false);
          }}
        >
          <Plus size={16} />
          New notice
        </button>
      </div>
      <div className="filter-tabs">
        {["Notices", "Upload notice", "Analytics"].map((t) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Notices" ? (
        <section className="panel">
          {notices.map((n) => (
            <div className="notice-row" key={n.id}>
              <FileText size={19} />
              <span>
                <strong>{n.title}</strong>
                <small>
                  {n.category} · Due {dateLabel(n.deadline)}
                </small>
              </span>
              <span className="status-badge green">Published</span>
            </div>
          ))}
        </section>
      ) : tab === "Analytics" ? (
        <>
          <div className="admin-stats">
            <div className="panel">
              <span>Published notices</span>
              <strong>{notices.length}</strong>
            </div>
            <div className="panel">
              <span>Demo student profiles</span>
              <strong>{profiles.length}</strong>
            </div>
            <div className="panel">
              <span>Eligible student matches</span>
              <strong>
                {notices.reduce(
                  (total, n) =>
                    total +
                    profiles.filter(
                      (p) => eligibility(n, p).status === "Eligible",
                    ).length,
                  0,
                )}
              </strong>
            </div>
          </div>
          <section className="panel">
            <h2>Opportunities by category</h2>
            <p className="muted">
              Calculated from synthetic notices in this browser.
            </p>
            <div style={{ height: 300, width: "100%" }}>
              <ResponsiveContainer>
                <BarChart
                  data={[
                    "Placement",
                    "Academic",
                    "Hackathon",
                    "Internship",
                    "Scholarship",
                    "Event",
                  ].map((category) => ({
                    category,
                    count: notices.filter((n) => n.category === category)
                      .length,
                  }))}
                >
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#5147ce" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      ) : (
        <>
          <p className="notice-info">
            Local demo parser · Text files and pasted notices are supported.
            Review all fields before publishing. PDF, DOCX, image OCR and live
            AI are not connected.
          </p>
          {published ? (
            <div className="panel empty-state">
              <Check size={32} />
              <h2>A new opportunity is live.</h2>
              <p>Your notice is now available in the student feed.</p>
              <button
                className="primary-button"
                onClick={() => {
                  setPublished(false);
                  setDraft(null);
                  setText("");
                }}
              >
                Add another notice
              </button>
            </div>
          ) : (
            <div className="admin-review">
              <section className="panel">
                <h2>Original notice</h2>
                <label
                  className="upload-zone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && !file.name.endsWith(".txt"))
                      setError(
                        "Use a .txt file or paste the notice text below.",
                      );
                    else if (file) setText(await file.text());
                  }}
                >
                  <Upload size={26} />
                  <strong>Drop a text notice here</strong>
                  <span>or click to choose a .txt file</span>
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) setText(await file.text());
                    }}
                  />
                </label>
                <label>
                  Or paste notice text
                  <textarea
                    rows={10}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      "Campus hiring 2026\nCSE / IT / ECE, final year. Minimum CGPA 7.0, no active backlogs. Deadline: 2026-09-28."
                    }
                  />
                </label>
                <button
                  className="text-button"
                  onClick={() =>
                    setText(
                      "FutureWorks Campus Hiring 2026\nEligible branches: CSE, IT, ECE. Final year. Minimum CGPA 7.0, no active backlogs. Registration closes 2026-09-28 at 5 PM. Apply through the placement cell.",
                    )
                  }
                >
                  Use sample notice
                </button>
                <button className="primary-button" onClick={process}>
                  Prepare review
                  <ArrowRight size={16} />
                </button>
                {error && (
                  <p role="alert" className="form-error">
                    {error}
                  </p>
                )}
              </section>
              <section className="panel">
                <h2>Review & publish</h2>
                {draft ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!draft.deadline) {
                        setError("Set a deadline before publishing.");
                        return;
                      }
                      onPublish({ ...draft, unknown: undefined });
                      setPublished(true);
                    }}
                  >
                    <p className="muted">
                      Confirm the extracted values. This parser does not infer
                      missing facts.
                    </p>
                    <label>
                      Title
                      <input
                        required
                        value={draft.title}
                        onChange={(e) =>
                          setDraft({ ...draft, title: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Category
                      <select
                        value={draft.category}
                        onChange={(e) =>
                          setDraft({ ...draft, category: e.target.value })
                        }
                      >
                        {[
                          "Placement",
                          "Internship",
                          "Scholarship",
                          "Academic",
                          "Hackathon",
                          "Event",
                        ].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Summary
                      <textarea
                        required
                        value={draft.summary}
                        onChange={(e) =>
                          setDraft({ ...draft, summary: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Deadline (campus time, IST)
                      <input
                        required
                        type="datetime-local"
                        value={draft.deadline.slice(0, 16)}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            deadline: `${e.target.value}:00+05:30`,
                          })
                        }
                      />
                    </label>
                    <div className="form-grid">
                      <label>
                        Minimum CGPA
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={draft.minCgpa}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              minCgpa: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                      <label>
                        Minimum year
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={draft.year}
                          onChange={(e) =>
                            setDraft({ ...draft, year: Number(e.target.value) })
                          }
                        />
                      </label>
                    </div>
                    <label>
                      Eligible branches (blank means all)
                      <input
                        value={draft.branches.join(", ")}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            branches: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </label>
                    <label>
                      Maximum backlogs (99 means unrestricted)
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={draft.backlogs}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            backlogs: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                    <p className="notice-info">
                      Audience preview:{" "}
                      {
                        profiles.filter(
                          (p) =>
                            eligibility({ ...draft, unknown: undefined }, p)
                              .status === "Eligible",
                        ).length
                      }{" "}
                      of {profiles.length} demo students meet these rules.
                    </p>
                    <label className="checkbox-label">
                      <input type="checkbox" required />I verified these fields
                      against the notice.
                    </label>
                    <button className="primary-button">
                      Publish notice
                      <Check size={16} />
                    </button>
                  </form>
                ) : (
                  <div className="review-empty">
                    <FileText size={32} />
                    <h3>Clarity starts here.</h3>
                    <p>
                      Add a notice to prepare its structured details and preview
                      who it reaches.
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </>
  );
}
