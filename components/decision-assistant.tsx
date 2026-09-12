"use client";
import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Activity } from "lucide-react";
import { Notice, Profile } from "@/lib/data";
import { Progress, impact, deadlineText } from "@/lib/intelligence";
import { answerQuery } from "@/lib/query";
export function DecisionAssistant({
  notices,
  profile,
  progress,
  resume,
  done,
  shortlists,
  onOpen,
  initialQuestion = "",
}: {
  notices: Notice[];
  profile: Profile;
  progress: Progress;
  resume: boolean;
  done: string[];
  shortlists: Record<string, string>;
  onOpen: (n: Notice) => void;
  initialQuestion?: string;
}) {
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState(initialQuestion);
  const [ai, setAi] = useState("");
  const [mode, setMode] = useState("Local decision engine");
  const [busy, setBusy] = useState(false);
  const requestId = useRef(0);
  const answer = answerQuery(
    question,
    notices,
    profile,
    progress,
    resume,
    done,
    shortlists,
  );
  async function ask(q: string) {
    if (!q.trim()) return;
    setQuestion(q);
    setAi("");
    setMode("Local decision engine");
    const decided = answerQuery(
      q,
      notices,
      profile,
      progress,
      resume,
      done,
      shortlists,
    );
    await explain(q, decided);
  }
  async function explain(q = question, decided = answer) {
    const currentRequest = ++requestId.current;
    setBusy(true);
    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          facts: JSON.stringify({
            title: decided.title,
            explanation: decided.explanation,
            notices: decided.results.map((n) => ({
              id: n.id,
              title: n.title,
              source: n.source,
              impact: impact(n, profile),
            })),
          }),
          sourceIds: decided.results.map((n) => n.id),
        }),
      });
      const body = await response.json();
      if (currentRequest !== requestId.current) return;
      setMode(body.mode);
      setAi(
        body.explanation ||
          body.warning ||
          "Live AI is not configured. Your answer above uses the local decision engine.",
      );
    } catch {
      if (currentRequest !== requestId.current) return;
      setAi(
        "Live explanation is unavailable. Your local decision remains available.",
      );
    } finally {
      if (currentRequest === requestId.current) setBusy(false);
    }
  }
  return (
    <div className="assistant-page">
      <div className="assistant-intro">
        <span className="assistant-symbol large">
          <Activity size={28} />
        </span>
        <h1>What should happen next?</h1>
        <p>Your time, your goals, your campus. Let’s make a plan.</p>
        <span className="demo-disclosure">
          Grounded in your profile, action progress and source notices.
        </span>
      </div>
      <div className="suggestions">
        {[
          "What should I do today?",
          "I have 30 minutes. What should I do?",
          "Which placements am I eligible for?",
          "What happens if I skip TCS?",
          "Should I apply for TCS or attend the AWS Student Challenge?",
          "What could an AWS certification unlock?",
        ].map((q) => (
          <button
            key={q}
            className="secondary-button"
            onClick={() => void ask(q)}
          >
            {q}
            <ArrowUpRight size={15} />
          </button>
        ))}
      </div>
      {question && (
        <section className="assistant-answer">
          <div className="user-question">{question}</div>
          <h2>{answer.title}</h2>
          <p className="muted">{answer.explanation}</p>
          {answer.results.map((n) => (
            <button className="answer-row" key={n.id} onClick={() => onOpen(n)}>
              <span>
                <strong>{n.title}</strong>
                <small>
                  {impact(n, profile).score}/100 impact ·{" "}
                  {impact(n, profile).status} · {deadlineText(n)}
                </small>
                <em>Source: {n.org}</em>
              </span>
              <ArrowUpRight size={17} />
            </button>
          ))}
          {!answer.results.length && (
            <p className="notice-info">
              No matching actionable notices. Try another opportunity or review
              your profile.
            </p>
          )}
          <button
            className="text-button"
            disabled={busy}
            onClick={() => void explain()}
          >
            {busy ? "Gemini is writing…" : "Regenerate Gemini explanation"}
          </button>
          {ai && <p className="notice-info">{ai}</p>}
          <small className="demo-disclosure">{mode}</small>
        </section>
      )}
      <form
        className="assistant-input"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
          setInput("");
        }}
      >
        <input
          aria-label="Ask CampusPulse"
          value={input}
          maxLength={1000}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask what to prioritize, compare or skip…"
        />
        <button
          className="primary-button"
          aria-label="Send question"
          disabled={!input.trim()}
        >
          <ArrowRight size={20} />
        </button>
      </form>
      <p className="assistant-footnote">
        Check the original notice. Selection and outcomes are never guaranteed.
      </p>
    </div>
  );
}
