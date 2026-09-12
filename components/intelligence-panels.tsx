"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  LockKeyhole,
  Clock3,
  Target,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { Notice, Profile } from "@/lib/data";
import {
  Progress,
  impact,
  workflow,
  progressKey,
  focusPlan,
  consequences,
  unlocks,
  deadlineText,
} from "@/lib/intelligence";
export function ImpactPanel({
  notice,
  profile,
}: {
  notice: Notice;
  profile: Profile;
}) {
  const info = impact(notice, profile);
  return (
    <section className="panel intelligence-panel">
      <div className="impact-heading">
        <div>
          <h2>Opportunity impact</h2>
          <p>Why this deserves your attention.</p>
        </div>
        <div className="impact-score">
          <strong>{info.score}</strong>
          <span>/ 100</span>
        </div>
      </div>
      <div className="impact-summary">
        <span className="status-badge green">{info.label}</span>
        <span>{deadlineText(notice)}</span>
        <span>About {info.effort} min to start</span>
      </div>
      <details>
        <summary>Why am I seeing this?</summary>
        <div className="score-breakdown">
          {info.breakdown.map((b) => (
            <div key={b.label}>
              <span>{b.label}</span>
              <meter min="0" max="100" value={b.value} aria-label={b.label} />
              <strong>{b.value}/100</strong>
            </div>
          ))}
        </div>
        <p className="muted">
          {info.hits.length
            ? `Matches your profile: ${info.hits.join(", ")}.`
            : "Few direct skill or interest matches yet."}{" "}
          {info.careerFit ? "Fits your career goal." : ""} Effort and career
          impact are planning estimates, not guarantees.
        </p>
      </details>
    </section>
  );
}
export function ActionGraph({
  notice,
  profile,
  progress,
  resume,
  shortlist,
  onToggle,
  onShortlist,
}: {
  notice: Notice;
  profile: Profile;
  progress: Progress;
  resume: boolean;
  shortlist: string;
  onToggle: (id: string) => void;
  onShortlist: (value: string) => void;
}) {
  const steps = workflow(notice, profile, progress, resume, shortlist);
  return (
    <section id="action-plan" className="panel intelligence-panel">
      <div className="rail-heading">
        <h2>Your action plan</h2>
        <span className="muted">
          {steps.filter((s) => s.status === "completed").length}/{steps.length}{" "}
          complete
        </span>
      </div>
      <p className="muted">
        Each step unlocks the next. Estimated times help you plan.
      </p>
      {!steps.length ? (
        <p className="notice-info">
          Information only. There’s nothing you need to complete.
        </p>
      ) : (
        <ol className="action-stepper">
          {steps.map((s, i) => (
            <li key={s.id} className={`step-${s.status}`}>
              <span className="step-number">
                {s.status === "completed" ? (
                  <Check size={17} />
                ) : s.status === "locked" ? (
                  <LockKeyhole size={14} />
                ) : (
                  i + 1
                )}
              </span>
              <div>
                <strong>{s.title}</strong>
                <small>
                  {s.minutes} min ·{" "}
                  {s.status === "ready"
                    ? "Ready to start"
                    : s.status === "needs-resume"
                      ? "Upload your resume first"
                      : s.status === "conditional"
                        ? "Only if shortlisted"
                        : s.status === "locked"
                          ? "Complete requirements and previous steps"
                          : s.status === "skipped"
                            ? "Not shortlisted — this path ends here"
                            : "Completed"}
                </small>
                {s.status === "needs-resume" && (
                  <Link href="/profile" className="text-button">
                    Upload resume
                    <ArrowUpRight size={14} />
                  </Link>
                )}
                {s.conditional && (
                  <label className="shortlist-label">
                    Shortlist result
                    <select
                      aria-label="Shortlist result"
                      disabled={s.status === "locked"}
                      value={shortlist}
                      onChange={(e) => onShortlist(e.target.value)}
                    >
                      <option value="pending">Awaiting result</option>
                      <option value="yes">Shortlisted</option>
                      <option value="no">Not shortlisted</option>
                    </select>
                  </label>
                )}
              </div>
              {["ready", "completed"].includes(s.status) && (
                <button
                  className="secondary-button"
                  onClick={() => onToggle(s.id)}
                >
                  {s.status === "completed" ? "Undo" : "Mark done"}
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
      <p className="file-privacy">
        Track work you complete outside CampusPulse. “Attach resume” records
        your preparation; it does not send a file to an employer.
      </p>
    </section>
  );
}
export function ConsequencePanel({ notice }: { notice: Notice }) {
  const [scenario, setScenario] = useState("skip");
  return (
    <section className="panel intelligence-panel">
      <h2>What if…?</h2>
      <div className="scenario-tabs">
        <button
          className={scenario === "skip" ? "active" : ""}
          onClick={() => setScenario("skip")}
        >
          I skip this
        </button>
        <button
          className={scenario === "act" ? "active" : ""}
          onClick={() => setScenario("act")}
        >
          I act now
        </button>
      </div>
      <ol className="consequence-list">
        {(scenario === "skip"
          ? consequences(notice)
          : notice.informational
            ? ["No action is required. Read the notice when useful."]
            : [
                "Complete the next available step before its deadline.",
                "Keep access to the next stage, subject to the notice requirements.",
                "Selection or funding is not guaranteed.",
              ]
        ).map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <p className="file-privacy">
        Scenario guidance based on this notice. Confirm exceptions with the
        issuing office.
      </p>
    </section>
  );
}
export function FocusMode({
  notices,
  profile,
  progress,
  resume,
  done,
  shortlists,
  onOpen,
  initialMinutes = 30,
}: {
  notices: Notice[];
  profile: Profile;
  progress: Progress;
  resume: boolean;
  done: string[];
  shortlists: Record<string, string>;
  onOpen: (n: Notice) => void;
  initialMinutes?: number;
}) {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [minutesDraft, setMinutesDraft] = useState(String(initialMinutes));
  const commitMinutes = () => {
    const value = Math.max(
      5,
      Math.min(180, Math.round(Number(minutesDraft) || 5)),
    );
    setMinutes(value);
    setMinutesDraft(String(value));
  };
  const plan = focusPlan(
    notices,
    profile,
    progress,
    resume,
    minutes,
    done,
    shortlists,
  );
  return (
    <section className="focus-page">
      <div className="focus-intro">
        <span className="assistant-symbol">
          <Target size={24} />
        </span>
        <h1>Your next {minutes} minutes, sorted.</h1>
        <p>Start with urgent, high-impact actions that fit your time.</p>
        <div className="time-options">
          {[15, 30, 60].map((m) => (
            <button
              key={m}
              className={minutes === m ? "active" : ""}
              aria-pressed={minutes === m}
              onClick={() => {
                setMinutes(m);
                setMinutesDraft(String(m));
              }}
            >
              {m} minutes
            </button>
          ))}
          <label>
            Custom
            <input
              aria-label="Focus minutes"
              type="number"
              min="5"
              max="180"
              value={minutesDraft}
              onChange={(e) => setMinutesDraft(e.target.value)}
              onBlur={commitMinutes}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitMinutes();
                }
              }}
            />
          </label>
        </div>
      </div>
      <section className="panel">
        <div className="rail-heading">
          <h2>Your focus plan</h2>
          <span>
            {plan.used} of {minutes} min planned
          </span>
        </div>
        <p className="muted">
          One next action per opportunity. Finish a step to generate the next
          plan.
        </p>
        {plan.selected.map((item, i) => (
          <div className="focus-row" key={item.notice.id}>
            <span className="focus-order">{i + 1}</span>
            <div>
              <span className="priority-label">
                {i === 0 ? "Do now" : "Do next"} · {item.impact.priority}
              </span>
              <h3>{item.step.title}</h3>
              <p>{item.notice.title}</p>
              <small>
                {deadlineText(item.notice)} · Impact {item.impact.score}/100 ·{" "}
                {item.step.minutes} min
              </small>
            </div>
            <button
              className="primary-button"
              onClick={() => onOpen(item.notice)}
            >
              Start
              <ArrowRight size={15} />
            </button>
          </div>
        ))}
        {!plan.selected.length && (
          <div className="empty-state">
            <Check />
            <h3>No ready actions fit this window.</h3>
            <p>
              Try more time, check eligibility, or upload your resume to unlock
              a step.
            </p>
            <Link href="/profile" className="text-button">
              Review your profile
            </Link>
          </div>
        )}
      </section>
      {plan.later.length > 0 && (
        <section className="panel">
          <h2>Not yet — save these for later</h2>
          {plan.later.map((item) => (
            <button
              className="answer-row"
              key={item.notice.id}
              onClick={() => onOpen(item.notice)}
            >
              <span>
                <strong>{item.notice.title}</strong>
                <small>
                  {item.step.title} · {item.step.minutes} min needed
                </small>
              </span>
              <ArrowUpRight size={17} />
            </button>
          ))}
        </section>
      )}
    </section>
  );
}
export function UnlockPanel({
  notices,
  profile,
}: {
  notices: Notice[];
  profile: Profile;
}) {
  const [cert, setCert] = useState("AWS");
  const result = unlocks(notices, profile, cert);
  return (
    <section className="panel intelligence-panel">
      <h2>What could you unlock?</h2>
      <p className="muted">
        Explore a possible next step without changing your profile.
      </p>
      <label>
        Imagine adding
        <select value={cert} onChange={(e) => setCert(e.target.value)}>
          <option>AWS</option>
          <option>Azure</option>
          <option>Google Cloud</option>
        </select>
      </label>
      <div className="unlock-count">
        <strong>{result.before}</strong>
        <ArrowRight />
        <strong>{result.after}</strong>
        <span>eligible opportunities</span>
      </div>
      {result.newPaths.length ? (
        result.newPaths.map((n) => (
          <Link
            className="answer-row"
            href={`/opportunities/${n.id}`}
            key={n.id}
          >
            <span>
              <strong>{n.title}</strong>
              <small>Meets the recorded rules with {cert}</small>
            </span>
            <ArrowUpRight size={16} />
          </Link>
        ))
      ) : (
        <p className="notice-info">
          No additional opportunities unlock under your current academic profile
          and this certification.
        </p>
      )}
      <p className="file-privacy">
        A deterministic simulation of the current notice pool, not a prediction
        of acceptance.
      </p>
    </section>
  );
}
