"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Compass,
  CheckCheck,
  CalendarDays,
  MessageSquare,
  BriefcaseBusiness,
  FlaskConical,
  Award,
  Code2,
  Cloud,
  UserRound,
  ChevronDown,
  Search,
  Bell,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Check,
  X,
  Clock3,
  SlidersHorizontal,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  Upload,
  FileText,
  ShieldCheck,
  LogOut,
  Settings2,
  CircleHelp,
  PanelLeftClose,
  ExternalLink,
} from "lucide-react";
import {
  initialNotices,
  profiles,
  Notice,
  Profile,
  eligibility,
  dateLabel,
  calendarDownload,
  daysLeft,
} from "@/lib/data";
import { OpportunityCard } from "./opportunity-card";
import { AdminPanel } from "./notice-admin";
import {
  ImpactPanel,
  ActionGraph,
  ConsequencePanel,
  FocusMode,
  UnlockPanel,
} from "./intelligence-panels";
import { NoticeAnalyzer } from "./notice-analyzer";
import { DecisionAssistant } from "./decision-assistant";
import { ResumeUpload } from "./resume-upload";
import { ResumeRecord, getResume } from "@/lib/resume-store";
import {
  demoNotices,
  impact,
  Progress,
  toggleStep,
  workflow,
  progressKey,
  hoursLeft,
  deadlineText,
} from "@/lib/intelligence";
const mainNav = [
  ["Overview", "/dashboard", LayoutDashboard],
  ["Opportunities", "/opportunities", Compass],
  ["My tasks", "/tasks", CheckCheck],
  ["Calendar", "/calendar", CalendarDays],
  ["AI assistant", "/assistant", MessageSquare],
  ["Focus mode", "/focus", Clock3],
  ["Analyze notice", "/analyze", FileText],
] as const;
const explore = [
  ["Placements", "Placement", BriefcaseBusiness],
  ["Internships", "Internship", FlaskConical],
  ["Scholarships", "Scholarship", Award],
  ["Hackathons", "Hackathon", Code2],
  ["Events", "Event", Cloud],
] as const;
type Stored = {
  profile: Profile;
  notices: Notice[];
  saved: string[];
  done: string[];
  reminders: string[];
  hidden: string[];
  progress?: Progress;
  shortlists?: Record<string, string>;
  profileEdits?: Record<string, Profile>;
};
export function CampusApp() {
  const path = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState(profiles[0]);
  const [notices, setNotices] = useState(demoNotices);
  const [progress, setProgress] = useState<Progress>({});
  const [shortlists, setShortlists] = useState<Record<string, string>>({});
  const [profileEdits, setProfileEdits] = useState<Record<string, Profile>>({});
  const [resume, setResume] = useState<ResumeRecord>();
  useEffect(() => {
    let cancelled = false;
    setResume(undefined);
    getResume(profile.name)
      .then((r) => {
        if (!cancelled) setResume(r);
      })
      .catch(() => {
        if (!cancelled)
          setToast("Resume storage is unavailable in this browser.");
      });
    return () => {
      cancelled = true;
    };
  }, [profile.name]);
  const [saved, setSaved] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [reminders, setReminders] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState("All opportunities");
  const [search, setSearch] = useState("");
  const [palette, setPalette] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [toast, setToast] = useState("");
  const [taskTab, setTaskTab] = useState("Priority");
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [month, setMonth] = useState(8);
  const [agenda, setAgenda] = useState(false);
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const paletteRef = useRef<HTMLElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!palette) return;
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = paletteRef.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled), input, a[href]",
      );
      if (!items?.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      searchTriggerRef.current?.focus();
    };
  }, [palette]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("campuspulse-v1");
      if (raw) {
        const s: Stored = JSON.parse(raw);
        if (s.profile && Array.isArray(s.notices)) {
          setProfile(s.profile);
          const seeded = demoNotices();
          setNotices([
            ...seeded.map((n) => {
              const old = s.notices.find((o) => o.id === n.id);
              return old ? { ...old, ...n } : n;
            }),
            ...s.notices.filter(
              (n) => !seeded.some((seed) => seed.id === n.id),
            ),
          ]);
          setProgress(s.progress || {});
          setShortlists(s.shortlists || {});
          setProfileEdits(s.profileEdits || {});
          setSaved(s.saved || []);
          setDone(s.done || []);
          setReminders(s.reminders || []);
          setHidden(s.hidden || []);
        }
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(
          "campuspulse-v1",
          JSON.stringify({
            profile,
            notices,
            saved,
            done,
            reminders,
            hidden,
            progress,
            shortlists,
            profileEdits: { ...profileEdits, [profile.name]: profile },
          }),
        );
      } catch {
        setToast(
          "Changes could not be saved locally. Browser storage may be full.",
        );
      }
  }, [
    profile,
    notices,
    saved,
    done,
    reminders,
    hidden,
    ready,
    progress,
    shortlists,
    profileEdits,
  ]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
      if (e.key === "Escape") {
        setPalette(false);
        setNotifications(false);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  const toggle = (id: string, list: string[], setter: (v: string[]) => void) =>
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const active =
    path === "/"
      ? "Overview"
      : mainNav.find((n) => path.startsWith(n[1]))?.[0] ||
        (path.startsWith("/admin")
          ? "Notice studio"
          : path === "/profile"
            ? "My profile"
            : "Opportunity");
  const selected = path.startsWith("/opportunities/")
    ? notices.find((n) => n.id === path.split("/")[2])
    : undefined;
  const open = (n: Notice) => router.push(`/opportunities/${n.id}`);
  const all = notices
    .filter((n) => !hidden.includes(n.id))
    .sort(
      (a, b) =>
        (impact(b, profile).priority === "Must do" ? 1000 : 0) +
        impact(b, profile).score -
        ((impact(a, profile).priority === "Must do" ? 1000 : 0) +
          impact(a, profile).score),
    );
  const priorities = all.filter(
    (n) =>
      !n.informational &&
      hoursLeft(n) > 0 &&
      daysLeft(n) <= 5 &&
      eligibility(n, profile).status !== "Not eligible" &&
      !done.includes(`${profile.name}:${n.id}`),
  );
  const filtered = all.filter(
    (n) =>
      (filter === "All opportunities" ||
        filter === n.category ||
        (filter === "Saved" && saved.includes(n.id))) &&
      (!onlyEligible || eligibility(n, profile).status === "Eligible") &&
      `${n.title} ${n.org} ${n.category}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const isDone = (n: Notice) => done.includes(`${profile.name}:${n.id}`);
  const visibleTask = (n: Notice) =>
    !n.informational &&
    (taskTab === "Completed"
      ? isDone(n)
      : !isDone(n) &&
        hoursLeft(n) > 0 &&
        eligibility(n, profile).status !== "Not eligible" &&
        (taskTab !== "Today" || hoursLeft(n) <= 24) &&
        (taskTab !== "Priority" ||
          ["Must do", "Recommended"].includes(impact(n, profile).priority)));
  const onStep = (n: Notice, id: string) => {
    const next = toggleStep(n, profile, progress, id);
    setProgress(next);
    const states = workflow(
      n,
      profile,
      next,
      !!resume,
      shortlists[progressKey(profile, n)],
    );
    const complete =
      states.length > 0 &&
      states.every((s) => ["completed", "skipped"].includes(s.status));
    setDone(
      complete
        ? [...new Set([...done, progressKey(profile, n)])]
        : done.filter((k) => k !== progressKey(profile, n)),
    );
  };
  const complete = (n: Notice) => {
    if (n.actions?.length) {
      open(n);
      setToast("Complete the steps in your action plan.");
      return;
    }
    toggle(`${profile.name}:${n.id}`, done, setDone);
    setToast(
      isDone(n)
        ? "Task moved back to upcoming"
        : "Nice work. Task marked complete.",
    );
  };
  const remind = (n: Notice) => {
    if (!n.deadline) {
      setToast("This notice has no deadline to export.");
      return;
    }
    if (!reminders.includes(n.id)) setReminders([...reminders, n.id]);
    calendarDownload(n);
    setToast("Calendar reminder downloaded. Import it into your calendar.");
  };
  const card = (n: Notice, compact = false) => (
    <OpportunityCard
      key={n.id}
      notice={n}
      profile={profile}
      saved={saved.includes(n.id)}
      onSave={() => toggle(n.id, saved, setSaved)}
      onOpen={() => open(n)}
      compact={compact}
    />
  );
  const answerNotices = all
    .filter((n) => !isDone(n))
    .filter((n) => {
      const q = asked.toLowerCase();
      if (q.includes("placement"))
        return (
          n.category === "Placement" &&
          eligibility(n, profile).status !== "Not eligible"
        );
      if (q.includes("scholar")) return n.category === "Scholarship";
      if (q.includes("hackathon")) return n.category === "Hackathon";
      if (q.includes("tomorrow")) return daysLeft(n) === 1;
      if (q.includes("eligible") || q.includes("eligibility"))
        return n.id === "infosys";
      if (q.includes("week") || q.includes("deadline") || q.includes("priorit"))
        return daysLeft(n) <= 7;
      return `${n.title} ${n.summary} ${n.category}`
        .toLowerCase()
        .split(" ")
        .some((w) => w.length > 4 && q.includes(w));
    })
    .slice(0, 4);
  if (!ready)
    return (
      <div className="workspace-loading" role="status">
        <Activity size={25} />
        <p>Preparing your campus workspace…</p>
      </div>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand">
          <span className="brand-mark">
            <Activity size={22} />
          </span>
          CampusPulse<span className="ai-label">AI</span>
        </Link>
        <button
          className="workspace-button"
          onClick={() => router.push("/profile")}
        >
          <span className="campus-symbol">
            <GraduationIcon />
          </span>
          <span>
            My campus<small>Student workspace</small>
          </span>
          <ChevronDown size={14} />
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {mainNav.map(([label, url, Icon]) => (
            <Link
              key={url}
              className={`nav-item ${active === label ? "active" : ""}`}
              href={url}
            >
              <Icon size={18} />
              {label}
              {label === "My tasks" && (
                <span className="nav-count">{priorities.length}</span>
              )}
              {label === "AI assistant" && (
                <span className="tiny-new">NEW</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="nav-label explore-label">EXPLORE</div>
        <nav>
          {explore.map(([label, cat, Icon]) => (
            <button
              className="nav-item"
              key={cat}
              onClick={() => {
                setFilter(cat);
                router.push("/opportunities");
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="small-pulse">
              <Activity size={16} />
            </span>
            <strong>
              A little more you.
              <br />A lot more relevant.
            </strong>
            <p>Fine-tune your profile to find opportunities that fit.</p>
            <Link href="/profile">
              Update your profile <ArrowUpRight size={14} />
            </Link>
          </div>
          <Link className="nav-item" href="/admin">
            <Settings2 size={17} />
            Notice studio<span className="demo-pill">DEMO</span>
          </Link>
          <Link href="/profile" className="student-mini">
            <span className="avatar">
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <span>
              <strong>{profile.name}</strong>
              <small>
                {profile.branch} · Year {profile.year}
              </small>
            </span>
            <ChevronDown size={15} />
          </Link>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <PanelLeftClose size={17} />
            <span className="crumb-divider" />
            Workspace <span>/</span>
            <strong>{active}</strong>
          </div>
          <button
            ref={searchTriggerRef}
            className="search-trigger"
            onClick={() => setPalette(true)}
            aria-label="Search CampusPulse"
          >
            <Search size={16} />
            <span>Search anything...</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="top-actions">
            <button
              className="icon-button notification-bell"
              aria-label="Notifications"
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={19} />
              <i />
            </button>
            <Link className="avatar small" href="/profile">
              {profile.name[0]}
            </Link>
          </div>
        </header>
        <main>
          {selected ? (
            <>
              <button
                className="text-button back"
                onClick={() => router.push("/opportunities")}
              >
                <ChevronLeft size={15} />
                All opportunities
              </button>
              <div className="detail-head">
                <span className="category-label">
                  {selected.category} · {selected.org}
                </span>
                <h1>{selected.title}</h1>
                <p>{selected.summary}</p>
              </div>
              <div className="detail-layout">
                <section className="panel">
                  <h2>Why this matches you</h2>
                  <p className="muted">
                    Evaluated against {profile.name}’s academic profile.
                  </p>
                  <span
                    className={`status-badge ${eligibility(selected, profile).status === "Eligible" ? "green" : "amber"}`}
                  >
                    {eligibility(selected, profile).status}
                  </span>
                  <div className="eligibility-table">
                    <div className="table-heading">
                      <span>Requirement</span>
                      <span>Your profile</span>
                      <span>Result</span>
                    </div>
                    {eligibility(selected, profile).checks.map((c) => (
                      <div key={c.label}>
                        <span>
                          <strong>{c.label}</strong>
                          <small>{c.required}</small>
                        </span>
                        <span>{c.actual}</span>
                        <span className={c.pass ? "eligible" : "ineligible"}>
                          {c.pass ? <Check size={17} /> : <X size={17} />}{" "}
                          {c.pass ? "Meets criteria" : "Does not meet"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {selected.unknown && (
                    <p className="notice-info">
                      Needs confirmation: {selected.unknown}
                    </p>
                  )}
                  <h2 className="source-title">Straight from the source</h2>
                  <p className="muted">
                    <FileText size={14} />{" "}
                    {selected.origin || "Campus circular"} · Source evidence
                  </p>
                  <blockquote>{selected.source}</blockquote>
                  <button
                    className="text-button"
                    onClick={() => {
                      setHidden([...hidden, selected.id]);
                      router.push("/opportunities");
                      setToast("Opportunity hidden from your feed.");
                    }}
                  >
                    Not relevant to me
                  </button>
                </section>
                <aside className="panel action-panel">
                  {selected.eventDate && (
                    <p>Event: {dateLabel(selected.eventDate)}</p>
                  )}
                  {!!selected.documents?.length && (
                    <p>Required documents: {selected.documents.join(", ")}</p>
                  )}
                  <h2>
                    {selected.action === "View opportunity"
                      ? "Review and apply"
                      : selected.action}
                  </h2>
                  <p>
                    <Clock3 size={16} /> Due {dateLabel(selected.deadline)}
                    {selected.deadline ? ", " : ""}
                    {selected.deadline &&
                      new Date(selected.deadline).toLocaleTimeString("en-IN", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "Asia/Kolkata",
                      })}
                  </p>
                  <p className="muted">
                    Demo notice: complete the activity outside CampusPulse, then
                    track it here.
                  </p>
                  <button
                    className="primary-button"
                    onClick={() =>
                      selected.actions?.length
                        ? document
                            .getElementById("action-plan")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            })
                        : complete(selected)
                    }
                    disabled={
                      selected.informational ||
                      eligibility(selected, profile).status !== "Eligible"
                    }
                  >
                    {selected.informational
                      ? "No action needed"
                      : selected.actions?.length
                        ? "View action plan"
                        : isDone(selected)
                          ? "Reopen task"
                          : "Mark action complete"}
                    <Check size={16} />
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => remind(selected)}
                  >
                    <Bell size={16} />
                    Add calendar reminder
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => toggle(selected.id, saved, setSaved)}
                  >
                    <Bookmark size={16} />
                    {saved.includes(selected.id)
                      ? "Saved opportunity"
                      : "Save for later"}
                  </button>
                </aside>
              </div>
              <div className="decision-detail-grid">
                <div>
                  <ImpactPanel notice={selected} profile={profile} />
                  <ActionGraph
                    notice={selected}
                    profile={profile}
                    progress={progress}
                    resume={!!resume}
                    shortlist={
                      shortlists[progressKey(profile, selected)] || "pending"
                    }
                    onToggle={(id) => onStep(selected, id)}
                    onShortlist={(value) => {
                      const key = progressKey(profile, selected);
                      const nextProgress = {
                        ...progress,
                        [key]: (progress[key] || []).filter(
                          (id) =>
                            !selected.actions?.some(
                              (a) => a.conditional && a.id === id,
                            ),
                        ),
                      };
                      setProgress(nextProgress);
                      setShortlists({
                        ...shortlists,
                        [progressKey(profile, selected)]: value,
                      });
                      const states = workflow(
                        selected,
                        profile,
                        nextProgress,
                        !!resume,
                        value,
                      );
                      setDone(
                        states.length > 0 &&
                          states.every((s) =>
                            ["completed", "skipped"].includes(s.status),
                          )
                          ? [...new Set([...done, key])]
                          : done.filter((k) => k !== key),
                      );
                    }}
                  />
                </div>
                <ConsequencePanel notice={selected} />
              </div>
            </>
          ) : active === "Overview" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="date-context">
                    Wednesday, 16 September 2026 <span>·</span> Semester 7
                  </div>
                  <h1>
                    Good morning, {profile.name.split(" ")[0]}
                    <span className="greeting-dot">.</span>
                  </h1>
                  <p>
                    Big possibilities. A little clarity. Here’s your campus,
                    personalized.
                  </p>
                </div>
                <Link className="secondary-button" href="/opportunities">
                  <Compass size={16} />
                  Explore opportunities
                </Link>
              </div>
              <div className="dashboard-columns">
                <div className="main-feed">
                  <section className="attention-panel">
                    <div className="attention-top">
                      <span className="attention-date">16 — 22 SEP</span>
                    </div>
                    <h2>
                      {priorities.length} things deserve
                      <br />
                      your attention this week.
                    </h2>
                    <p>One small step today. One less deadline tomorrow.</p>
                    <div className="attention-bottom">
                      <Link href="/tasks" className="white-button">
                        Let’s get you on track <ArrowRight size={16} />
                      </Link>
                      <span>
                        <span className="light-dot" />{" "}
                        {priorities.filter((n) => daysLeft(n) <= 2).length}{" "}
                        deadlines approaching
                      </span>
                    </div>
                    <div className="hero-orbit" aria-hidden="true">
                      <div />
                      <div />
                      <div />
                      <span>
                        <CheckCheck size={30} />
                      </span>
                    </div>
                  </section>
                  <Link href="/focus" className="focus-launch">
                    <span>
                      <Clock3 size={19} />
                      <strong>I have 30 minutes</strong>
                      <small>A focused plan for the time you have.</small>
                    </span>
                    <ArrowRight size={18} />
                  </Link>
                  <div className="priority-summary">
                    <span>
                      {
                        priorities.filter(
                          (n) => impact(n, profile).priority === "Must do",
                        ).length
                      }{" "}
                      must do
                    </span>
                    <span>
                      {
                        all.filter(
                          (n) => impact(n, profile).priority === "Recommended",
                        ).length
                      }{" "}
                      recommended
                    </span>
                    <span>
                      {all.filter((n) => n.informational).length} information
                      only
                    </span>
                  </div>
                  <div className="section-heading">
                    <div>
                      <h2>
                        For you{" "}
                        <span className="count-label">{priorities.length}</span>
                      </h2>
                      <p>Good opportunities. The right order.</p>
                    </div>
                    <button
                      className="text-button muted"
                      onClick={() => {
                        setOnlyEligible(!onlyEligible);
                        router.push("/opportunities");
                      }}
                    >
                      <SlidersHorizontal size={14} />
                      Personalized for you
                    </button>
                  </div>
                  <div className="filter-tabs">
                    {[
                      "All opportunities",
                      "Placement",
                      "Academic",
                      "Hackathon",
                    ].map((f) => (
                      <button
                        className={filter === f ? "selected" : ""}
                        key={f}
                        onClick={() => setFilter(f)}
                      >
                        {f === "Placement"
                          ? "Placements"
                          : f === "Hackathon"
                            ? "Hackathons"
                            : f}
                      </button>
                    ))}
                  </div>
                  <div className="priority-grid">
                    {priorities
                      .filter(
                        (n) =>
                          filter === "All opportunities" ||
                          filter === n.category,
                      )
                      .map((n) => card(n))}
                  </div>
                  {!priorities.filter(
                    (n) =>
                      filter === "All opportunities" || filter === n.category,
                  ).length && (
                    <div className="empty-state">
                      <CheckCheck />
                      <h3>You’re all caught up here.</h3>
                      <button
                        className="text-button"
                        onClick={() => setFilter("All opportunities")}
                      >
                        Show all priorities
                      </button>
                    </div>
                  )}
                  <div className="section-heading recommended-heading">
                    <div>
                      <h2>Ahead of the curve</h2>
                      <p>A few more possibilities with your name on them.</p>
                    </div>
                    <Link href="/opportunities" className="text-button">
                      View all <ArrowRight size={15} />
                    </Link>
                  </div>
                  <div className="recommendation-grid">
                    {all
                      .filter((n) => daysLeft(n) > 5)
                      .slice(0, 2)
                      .map((n) => card(n, true))}
                  </div>
                </div>
                <aside className="right-rail">
                  <section className="agenda-panel">
                    <div className="rail-heading">
                      <h2>Your week</h2>
                      <Link
                        href="/calendar"
                        className="icon-button"
                        aria-label="Open calendar"
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    </div>
                    <div className="week-month">
                      September 2026 <CalendarDays size={15} />
                    </div>
                    <div className="week-strip">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                        <button
                          key={i}
                          className={i === 2 ? "today" : ""}
                          onClick={() => router.push("/calendar")}
                        >
                          <span>{d}</span>
                          <strong>{14 + i}</strong>
                          <i
                            className={[3, 4, 6].includes(i) ? "has-event" : ""}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="agenda-list">
                      {[...priorities]
                        .sort((a, b) => hoursLeft(a) - hoursLeft(b))
                        .slice(0, 3)
                        .map((n, i) => (
                          <button
                            key={n.id}
                            onClick={() => open(n)}
                            className="agenda-entry"
                          >
                            <span className={`agenda-dot dot-${i}`} />
                            <span>
                              <small>
                                {dateLabel(n.deadline)}{" "}
                                <span>
                                  ·{" "}
                                  {daysLeft(n) === 1 ? "Tomorrow" : "Deadline"}
                                </span>
                              </small>
                              <strong>{n.title.replace(" 2026", "")}</strong>
                              <em>{n.category}</em>
                            </span>
                          </button>
                        ))}
                    </div>
                    <Link href="/calendar" className="rail-footer">
                      Open calendar
                      <ArrowRight size={15} />
                    </Link>
                  </section>
                  <section className="assistant-teaser">
                    <div className="assistant-heading">
                      <span className="assistant-symbol">
                        <Activity size={20} />
                      </span>
                      <span>
                        Your campus copilot
                        <small>A little guidance goes a long way.</small>
                      </span>
                    </div>
                    <h3>
                      Less searching.
                      <br />
                      More doing.
                    </h3>
                    <p>
                      Make sense of what’s next with your personal campus
                      assistant.
                    </p>
                    {[
                      "What should I do this week?",
                      "Which opportunities fit me?",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setAsked(q);
                          router.push("/assistant");
                        }}
                      >
                        {q}
                        <ArrowUpRight size={14} />
                      </button>
                    ))}
                    <Link href="/assistant">
                      Ask CampusPulse <ArrowRight size={15} />
                    </Link>
                  </section>
                  <div className="relevance-note">
                    <ShieldCheck size={17} />
                    <p>
                      Made relevant. Not overwhelming.
                      <br />
                      <span>Your feed is tailored to your profile.</span>
                    </p>
                  </div>
                </aside>
              </div>
              <footer className="page-footer">
                <span>
                  <Activity size={13} /> A little clarity for your next big
                  thing.
                </span>
                <span>Synthetic demo · 16 Sep 2026</span>
              </footer>
            </>
          ) : active === "Opportunities" ? (
            <>
              <PageHeading
                title="Your next opportunity"
                subtitle="Discover what fits. Understand why. Make your move."
              />
              <div className="listing-toolbar">
                <div className="input-with-icon">
                  <Search size={17} />
                  <input
                    aria-label="Search opportunities"
                    placeholder="Search opportunities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={onlyEligible}
                    onChange={(e) => setOnlyEligible(e.target.checked)}
                  />
                  Eligible for me
                </label>
              </div>
              <div className="filter-tabs wrap">
                {[
                  "All opportunities",
                  "Placement",
                  "Internship",
                  "Scholarship",
                  "Academic",
                  "Hackathon",
                  "Event",
                  "Saved",
                ].map((f) => (
                  <button
                    key={f}
                    className={filter === f ? "selected" : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <p className="result-count">
                {filtered.length} opportunities · personalized for{" "}
                {profile.name.split(" ")[0]}
              </p>
              <div className="opportunities-grid">
                {filtered.map((n) => card(n))}
              </div>
              {!filtered.length && (
                <div className="empty-state">
                  <Compass />
                  <h2>No opportunities found</h2>
                  <p>Try another search or clear your filters.</p>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setSearch("");
                      setFilter("All opportunities");
                      setOnlyEligible(false);
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          ) : active === "My tasks" ? (
            <>
              <PageHeading
                title="A little progress, every day."
                subtitle="Your opportunities, turned into a plan."
              />
              <div className="filter-tabs">
                {["Priority", "Today", "Upcoming", "Completed"].map((t) => (
                  <button
                    className={taskTab === t ? "selected" : ""}
                    onClick={() => setTaskTab(t)}
                    key={t}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <section className="panel task-panel">
                {all.filter(visibleTask).map((n) => (
                  <div className="task-row" key={n.id}>
                    <button
                      className={`task-check ${isDone(n) ? "checked" : ""}`}
                      aria-label={`${isDone(n) ? "Reopen" : "Complete"} ${n.title}`}
                      onClick={() => complete(n)}
                    >
                      {isDone(n) && <Check size={16} />}
                    </button>
                    <button className="task-copy" onClick={() => open(n)}>
                      <strong>{n.title}</strong>
                      <span className="task-impact">
                        {impact(n, profile).priority} ·{" "}
                        {impact(n, profile).score}/100 impact · {n.effort || 15}{" "}
                        min
                      </span>
                      <small>
                        {n.category} · {n.org}
                      </small>
                    </button>
                    <span className="deadline">{dateLabel(n.deadline)}</span>
                    <button
                      className="icon-button"
                      aria-label={`Remind me about ${n.title}`}
                      onClick={() => remind(n)}
                    >
                      <Bell size={16} />
                    </button>
                  </div>
                ))}
                {!all.some(visibleTask) && (
                  <div className="empty-state">
                    <CheckCheck />
                    <h2>
                      {taskTab === "Completed"
                        ? "Your progress starts here"
                        : "You’re caught up"}
                    </h2>
                    <p>
                      {taskTab === "Completed"
                        ? "Complete an upcoming action to see it here."
                        : "No tasks need your attention in this view."}
                    </p>
                  </div>
                )}
              </section>
            </>
          ) : active === "Calendar" ? (
            <>
              <PageHeading
                title="Make room for what’s next."
                subtitle="Deadlines, opportunities, and a little peace of mind."
              />
              <section className="panel calendar-panel">
                <div className="calendar-toolbar">
                  <h2>
                    {new Date(2026, month, 1).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <div>
                    <button
                      className="icon-button"
                      aria-label="Previous month"
                      onClick={() => setMonth(month - 1)}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button className="text-button" onClick={() => setMonth(8)}>
                      Today
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Next month"
                      onClick={() => setMonth(month + 1)}
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => setAgenda(!agenda)}
                    >
                      {agenda ? "Month view" : "Agenda view"}
                    </button>
                  </div>
                </div>
                {agenda ? (
                  <div>
                    {all
                      .filter(
                        (n) =>
                          new Date(n.deadline).getMonth() ===
                            ((month % 12) + 12) % 12 &&
                          new Date(n.deadline).getFullYear() ===
                            new Date(2026, month, 1).getFullYear(),
                      )
                      .map((n) => (
                        <button
                          key={n.id}
                          className="agenda-full"
                          onClick={() => open(n)}
                        >
                          <span>{dateLabel(n.deadline)}</span>
                          <strong>{n.title}</strong>
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                  </div>
                ) : (
                  <>
                    <div className="calendar-grid day-names">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (d) => (
                          <span key={d}>{d}</span>
                        ),
                      )}
                    </div>
                    <div className="calendar-grid">
                      {Array.from(
                        { length: new Date(2026, month, 1).getDay() },
                        (_, i) => (
                          <div
                            className="calendar-day blank"
                            key={`blank${i}`}
                          />
                        ),
                      )}
                      {Array.from(
                        { length: new Date(2026, month + 1, 0).getDate() },
                        (_, i) => (
                          <div
                            key={i}
                            className={`calendar-day ${month === 8 && i === 15 ? "current-day" : ""}`}
                          >
                            <span>{i + 1}</span>
                            {all
                              .filter(
                                (n) =>
                                  new Date(n.deadline).toDateString() ===
                                  new Date(2026, month, i + 1).toDateString(),
                              )
                              .map((n) => (
                                <button key={n.id} onClick={() => open(n)}>
                                  {n.title}
                                </button>
                              ))}
                          </div>
                        ),
                      )}
                    </div>
                  </>
                )}
              </section>
            </>
          ) : active === "AI assistant" ? (
            <DecisionAssistant
              notices={all}
              profile={profile}
              progress={progress}
              resume={!!resume}
              done={done}
              shortlists={shortlists}
              onOpen={open}
              initialQuestion={asked}
            />
          ) : active === "Focus mode" ? (
            <FocusMode
              notices={all}
              profile={profile}
              progress={progress}
              resume={!!resume}
              done={done}
              shortlists={shortlists}
              onOpen={open}
            />
          ) : active === "Analyze notice" ? (
            <NoticeAnalyzer
              profile={profile}
              onAdd={(n) => {
                setNotices([...notices, n]);
                setToast(
                  "Notice added. Your impact and action plan are ready.",
                );
                open(n);
              }}
            />
          ) : active === "My profile" ? (
            <>
              <PageHeading
                title="A little more you."
                subtitle="Better details. Better opportunities. Your profile powers your personal feed."
              />
              <div className="profile-layout">
                <section className="panel">
                  <div className="profile-header">
                    <span className="avatar large-avatar">
                      {profile.name[0]}
                    </span>
                    <div>
                      <h2>{profile.name}</h2>
                      <p className="muted">Student workspace · Demo account</p>
                    </div>
                  </div>
                  <h3>Switch demo student</h3>
                  <select
                    aria-label="Demo student"
                    value={
                      profiles.find((p) => p.name === profile.name)?.name || ""
                    }
                    onChange={(e) => {
                      setProfileEdits({
                        ...profileEdits,
                        [profile.name]: profile,
                      });
                      setProfile(
                        profileEdits[e.target.value] ||
                          profiles.find((p) => p.name === e.target.value)!,
                      );
                      setToast("Profile switched. Eligibility updated.");
                    }}
                  >
                    {profiles.map((p) => (
                      <option key={p.name}>{p.name}</option>
                    ))}
                  </select>
                  <p className="muted">
                    Try Aman to see how a 6.6 CGPA changes placement
                    eligibility.
                  </p>
                </section>
                <form
                  className="panel profile-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setToast(
                      "Profile saved. Your opportunities are up to date.",
                    );
                  }}
                >
                  <h2>Academic profile</h2>
                  <div className="form-grid">
                    <label>
                      Branch
                      <select
                        value={profile.branch}
                        onChange={(e) =>
                          setProfile({ ...profile, branch: e.target.value })
                        }
                      >
                        {["CSE", "IT", "ECE", "ME", "CE", "EE"].map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Year
                      <input
                        type="number"
                        min="1"
                        max="5"
                        required
                        value={profile.year}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            year: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                    <label>
                      CGPA
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        required
                        value={profile.cgpa}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            cgpa: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                    <label>
                      Active backlogs
                      <input
                        type="number"
                        min="0"
                        max="30"
                        required
                        value={profile.backlogs}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            backlogs: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                  </div>
                  <h2>Skills & interests</h2>
                  <label>
                    Career goal
                    <input
                      value={profile.careerGoal || "Software Engineering"}
                      onChange={(e) =>
                        setProfile({ ...profile, careerGoal: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Certifications
                    <input
                      placeholder="AWS, Azure…"
                      value={profile.certifications || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          certifications: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Your skills
                    <input
                      value={profile.skills}
                      onChange={(e) =>
                        setProfile({ ...profile, skills: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    What interests you?
                    <input
                      value={profile.interests}
                      onChange={(e) =>
                        setProfile({ ...profile, interests: e.target.value })
                      }
                    />
                  </label>
                  <button className="primary-button">
                    Save profile
                    <Check size={16} />
                  </button>
                </form>
              </div>
              <div className="profile-additions">
                <ResumeUpload
                  key={profile.name}
                  student={profile.name}
                  resume={resume}
                  onChange={setResume}
                />
                <UnlockPanel notices={all} profile={profile} />
              </div>
            </>
          ) : path.startsWith("/admin") ? (
            <AdminPanel
              notices={notices}
              onPublish={(n) => {
                setNotices([...notices, n]);
                setToast("Notice published. Student feeds updated.");
              }}
            />
          ) : (
            <div className="empty-state">
              <h1>Page not found</h1>
              <Link href="/dashboard">Return to overview</Link>
            </div>
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {notifications && (
        <div className="notification-panel panel">
          <div className="rail-heading">
            <h2>Your reminders</h2>
            <button
              className="icon-button"
              aria-label="Close notifications"
              onClick={() => setNotifications(false)}
            >
              <X size={17} />
            </button>
          </div>
          {(reminders.length
            ? notices.filter((n) => reminders.includes(n.id))
            : priorities.slice(0, 2)
          ).map((n) => (
            <button
              className="answer-row"
              key={n.id}
              onClick={() => {
                open(n);
                setNotifications(false);
              }}
            >
              <span>
                <strong>{n.title}</strong>
                <small>
                  Deadline {dateLabel(n.deadline)} ·{" "}
                  {reminders.includes(n.id)
                    ? "Calendar exported"
                    : "Needs your attention"}
                </small>
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      )}
      {palette && (
        <div className="modal-backdrop" onClick={() => setPalette(false)}>
          <section
            className="command-palette"
            ref={paletteRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search CampusPulse"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="command-input">
              <Search size={20} />
              <input
                autoFocus
                placeholder="Search opportunities or jump to a page..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="icon-button"
                onClick={() => setPalette(false)}
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </div>
            <div className="command-results">
              {mainNav
                .filter((n) =>
                  n[0].toLowerCase().includes(search.toLowerCase()),
                )
                .map(([label, url, Icon]) => (
                  <button
                    key={url}
                    onClick={() => {
                      router.push(url);
                      setPalette(false);
                      setSearch("");
                    }}
                  >
                    <Icon size={17} />
                    {label}
                    <ArrowRight size={15} />
                  </button>
                ))}
              {notices
                .filter((n) =>
                  n.title.toLowerCase().includes(search.toLowerCase()),
                )
                .map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      open(n);
                      setPalette(false);
                      setSearch("");
                    }}
                  >
                    <FileText size={17} />
                    {n.title}
                    <ArrowUpRight size={15} />
                  </button>
                ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
function GraduationIcon() {
  return <BriefcaseBusiness size={17} />;
}
function PageHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
