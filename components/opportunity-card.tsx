import {
  ArrowUpRight,
  Bookmark,
  Check,
  Clock3,
  GraduationCap,
  BriefcaseBusiness,
  Code2,
  FlaskConical,
  Award,
  Cloud,
} from "lucide-react";
import { Notice, Profile, eligibility, daysLeft, dateLabel } from "@/lib/data";
import { impact, deadlineText } from "@/lib/intelligence";
export const categoryIcons = {
  Academic: GraduationCap,
  Placement: BriefcaseBusiness,
  Hackathon: Code2,
  Internship: FlaskConical,
  Scholarship: Award,
  Event: Cloud,
};
export function OpportunityCard({
  notice: n,
  profile,
  saved,
  onSave,
  onOpen,
  compact = false,
}: {
  notice: Notice;
  profile: Profile;
  saved: boolean;
  onSave: () => void;
  onOpen: () => void;
  compact?: boolean;
}) {
  const Icon =
    categoryIcons[n.category as keyof typeof categoryIcons] || GraduationCap;
  const eligible = eligibility(n, profile).status;
  const intelligence = impact(n, profile);
  return (
    <article className={`opportunity-card ${compact ? "compact" : ""}`}>
      <div className="card-top">
        <span className={`category-icon ${n.category.toLowerCase()}`}>
          <Icon size={20} />
        </span>
        <span className="category-label">{n.category}</span>
        <button
          className={`icon-button bookmark ${saved ? "saved" : ""}`}
          aria-label={`${saved ? "Unsave" : "Save"} ${n.title}`}
          onClick={onSave}
        >
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <button className="title-button" onClick={onOpen}>
        <h3>{n.title}</h3>
      </button>
      <p className="org">{n.org}</p>
      <p className="card-description">{n.summary}</p>
      <div className="match-line">
        <span className={eligible === "Eligible" ? "match" : "muted"}>
          {n.informational ? "Information" : `${intelligence.score}/100 impact`}
        </span>
        <span className={eligible === "Eligible" ? "eligible" : "ineligible"}>
          {eligible === "Eligible" && <Check size={12} />} {eligible}
        </span>
      </div>
      <div className="card-priority">
        <span>{intelligence.priority}</span>
        {!n.informational && <span>~{intelligence.effort} min</span>}
      </div>
      <div className="card-bottom">
        <span className={daysLeft(n) <= 2 ? "deadline urgent" : "deadline"}>
          <Clock3 size={14} />
          {daysLeft(n) <= 2 ? deadlineText(n) : dateLabel(n.deadline)}
        </span>
        <button className="text-button" onClick={onOpen}>
          {compact ? "Explore" : n.action}
          <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}
