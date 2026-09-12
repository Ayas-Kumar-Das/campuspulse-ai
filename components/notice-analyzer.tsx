"use client";
import { useState } from "react";
import { ArrowRight, Check, FileText } from "lucide-react";
import { Extraction, extractionSchema, toNotice } from "@/lib/analyzer";
import { Notice, Profile } from "@/lib/data";
import { ImpactPanel } from "./intelligence-panels";
const sample =
  "TCS Digital Hiring 2026\nEligible: CSE and IT, 3rd year. Minimum CGPA 7.5, no active backlogs. Registration closes 16 September 2026 at 5 PM IST. Register, upload resume, complete online assessment, and attend interview if shortlisted.";
export function NoticeAnalyzer({
  profile,
  onAdd,
}: {
  profile: Profile;
  onAdd: (n: Notice) => void;
}) {
  const [text, setText] = useState("");
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [source, setSource] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  async function analyze() {
    setBusy(true);
    setError("");
    setExtraction(null);
    setConfirmed(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setExtraction(extractionSchema.parse(body.extraction));
      setSource(text);
      setMode(body.mode);
      setWarning(body.warning);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  let preview: Notice | undefined;
  try {
    if (extraction) preview = toNotice(extraction, source);
  } catch {}
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>From notice to next step.</h1>
          <p>
            Understand the requirements, see your impact, and build an action
            plan.
          </p>
        </div>
      </div>
      <div className="analyzer-layout">
        <section className="panel">
          <h2>Paste a college notice</h2>
          <p className="muted">
            Keep the original dates, eligibility and action instructions.
          </p>
          <textarea
            aria-label="College notice"
            rows={12}
            value={text}
            maxLength={15000}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your college notice here…"
          />
          <div className="analyzer-buttons">
            <button className="text-button" onClick={() => setText(sample)}>
              Use demo hiring notice
            </button>
            <button
              className="primary-button"
              disabled={busy || text.trim().length < 30}
              onClick={analyze}
            >
              {busy ? "Understanding notice…" : "Analyze notice"}
              <ArrowRight size={16} />
            </button>
          </div>
          {busy && (
            <div className="processing-state" role="status">
              <span className="processing-dot" />
              Extracting requirements and preparing structured fields…
            </div>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <p className="file-privacy">
            Live mode sends only this notice to the configured AI provider. Your
            resume is never included.
          </p>
        </section>
        <section className="panel">
          <h2>Review the extracted facts</h2>
          {extraction ? (
            <>
              <p className="notice-info">
                {mode} · {warning}
              </p>
              <label>
                Title
                <input
                  value={extraction.title}
                  onChange={(e) =>
                    setExtraction({ ...extraction, title: e.target.value })
                  }
                />
              </label>
              <label>
                Organization
                <input
                  value={extraction.organization || ""}
                  onChange={(e) =>
                    setExtraction({
                      ...extraction,
                      organization: e.target.value || null,
                    })
                  }
                />
              </label>
              <label>
                Category
                <select
                  value={extraction.category}
                  onChange={(e) =>
                    setExtraction({
                      ...extraction,
                      category: e.target.value as Extraction["category"],
                    })
                  }
                >
                  {[
                    "Placement",
                    "Internship",
                    "Scholarship",
                    "Academic",
                    "Hackathon",
                    "Event",
                    "Administrative",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Deadline (ISO date with timezone, blank if unknown)
                <input
                  value={extraction.deadline || ""}
                  onChange={(e) =>
                    setExtraction({
                      ...extraction,
                      deadline: e.target.value || null,
                    })
                  }
                />
              </label>
              <label>
                Event date (ISO with timezone, blank if unknown)
                <input
                  value={extraction.event_date || ""}
                  onChange={(e) =>
                    setExtraction({
                      ...extraction,
                      event_date: e.target.value || null,
                    })
                  }
                />
              </label>
              <label>
                Summary
                <textarea
                  value={extraction.summary}
                  onChange={(e) =>
                    setExtraction({ ...extraction, summary: e.target.value })
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
                    value={extraction.minimum_cgpa ?? ""}
                    onChange={(e) =>
                      setExtraction({
                        ...extraction,
                        minimum_cgpa:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Maximum backlogs
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={extraction.maximum_backlogs ?? ""}
                    onChange={(e) =>
                      setExtraction({
                        ...extraction,
                        maximum_backlogs:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
              <label>
                Eligible branches (comma separated)
                <input
                  value={extraction.branches.join(", ")}
                  onChange={(e) =>
                    setExtraction({
                      ...extraction,
                      branches: e.target.value
                        .split(",")
                        .map((v) => v.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <label>
                Eligible years (comma separated)
                <input
                  value={extraction.years.join(", ")}
                  onChange={(e) =>
                    setExtraction({
                      ...extraction,
                      years: e.target.value
                        .split(",")
                        .map((v) => Number(v.trim()))
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <label>
                Unresolved requirements
                <textarea
                  value={extraction.other_requirements.join("\n")}
                  onChange={(e) =>
                    setExtraction({
                      ...extraction,
                      other_requirements: e.target.value
                        .split("\n")
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <details>
                <summary>
                  {extraction.actions.length} extracted actions · review
                  dependencies
                </summary>
                {extraction.actions.map((action, index) => (
                  <div className="analyzer-action" key={action.id}>
                    <label>
                      Action {index + 1}
                      <input
                        value={action.title}
                        onChange={(e) =>
                          setExtraction({
                            ...extraction,
                            actions: extraction.actions.map((a, i) =>
                              i === index ? { ...a, title: e.target.value } : a,
                            ),
                          })
                        }
                      />
                    </label>
                    <div className="form-grid">
                      <label>
                        Estimated minutes
                        <input
                          type="number"
                          min="1"
                          max="480"
                          value={action.estimated_minutes}
                          onChange={(e) =>
                            setExtraction({
                              ...extraction,
                              actions: extraction.actions.map((a, i) =>
                                i === index
                                  ? {
                                      ...a,
                                      estimated_minutes: Number(e.target.value),
                                    }
                                  : a,
                              ),
                            })
                          }
                        />
                      </label>
                      <label>
                        Depends on action IDs
                        <input
                          value={action.depends_on.join(", ")}
                          onChange={(e) =>
                            setExtraction({
                              ...extraction,
                              actions: extraction.actions.map((a, i) =>
                                i === index
                                  ? {
                                      ...a,
                                      depends_on: e.target.value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                    }
                                  : a,
                              ),
                            })
                          }
                        />
                      </label>
                    </div>
                    <small className="muted">Action ID: {action.id}</small>
                  </div>
                ))}
              </details>
              <p className="file-privacy">
                Extraction confidence: {Math.round(extraction.confidence * 100)}
                %. Confidence is not proof of correctness. Unknown conditions
                keep eligibility uncertain.
              </p>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                I reviewed these fields against the source.
              </label>
              <button
                className="primary-button"
                disabled={!confirmed}
                onClick={() => {
                  try {
                    onAdd(toNotice(extractionSchema.parse(extraction), source));
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Add to my opportunities
                <Check size={16} />
              </button>
            </>
          ) : (
            <div className="review-empty">
              <FileText size={30} />
              <h3>One notice. A clear plan.</h3>
              <p>
                Analyze a notice to review its requirements and see what it
                means for you.
              </p>
            </div>
          )}
        </section>
      </div>
      {preview && (
        <div className="analyzer-preview">
          <ImpactPanel notice={preview} profile={profile} />
        </div>
      )}
    </>
  );
}
