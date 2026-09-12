---
name: CampusPulse AI
description: A calm student workspace for explainable campus actions.
colors:
  primary: "#5147ce"
  primary-hover: "#4137b4"
  attention: "#5149c9"
  background: "#f7f8fa"
  surface: "#fff"
  foreground: "#252735"
  muted: "#697080"
  secondary-ink: "#666b7b"
  assistant-ink: "#70647f"
  border: "#e7e9ef"
  success: "#248365"
  eligible: "#358267"
  ineligible: "#a66931"
  urgent: "#966329"
  focus: "#9f99ee"
  nav-active-background: "#eeecfb"
  nav-active-ink: "#5147b9"
typography:
  headline:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-1px"
  title:
    fontFamily: '"Manrope Variable", sans-serif'
    fontSize: "18px"
    fontWeight: 700
    letterSpacing: "-0.45px"
  body:
    fontFamily: '"DM Sans Variable", sans-serif'
    fontSize: "14px"
  label:
    fontFamily: '"DM Sans Variable", sans-serif'
    fontSize: "13px"
    fontWeight: 500
rounded:
  badge: "4px"
  button: "7px"
  input: "8px"
  card: "10px"
  panel: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  workspace-inline: "36px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "10px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "17px 16px 0"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.input}"
    padding: "11px 12px"
  attention-panel:
    backgroundColor: "{colors.attention}"
    textColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "24px 26px 23px"
---

# Design System: CampusPulse AI

## Overview

CampusPulse is a calm student action workspace in Operate mode: light surfaces, restrained indigo and compact information. This finalizes the provisional new-build direction. Deadlines lead, followed by prioritized opportunities and a weekly agenda. The signature interaction explains eligibility against the selected student's academic profile.

## Colors

The frontmatter records implemented colors. Indigo identifies primary actions and selected navigation; white bordered surfaces sit on a cool off-white canvas. Semantic green and amber accompany text or icons. The final CSS secondary-ink override applies to navigation labels, breadcrumbs, metadata, card descriptions, agenda metadata and footer copy. Assistant copy uses assistant-ink; urgent deadlines use urgent. These override earlier lighter declarations. The base muted variable remains valid elsewhere.

## Typography

Locally hosted Manrope Variable handles headings and DM Sans Variable handles body and controls. Main headings are 32px, weight 700, with 1.35 line height; section headings are 18px. Body defaults to 14px. Desktop card descriptions are 11px with 1.8 line height; card titles are 14px with 1.55 line height. Wide-screen titles rise to 16px and mobile card titles to 17px. At 720px and below, main headings become 26px with -0.7px tracking.

## Layout

The fixed desktop sidebar is 236px with a matching workspace offset. The top bar is 72px. Main content has a 1510px maximum width and 33px 36px 20px padding. Dashboard columns are flexible content plus a 276px agenda rail, separated by 25px. Priority cards use three columns with 13px gaps; recommendations use two columns.

At 1550px and above, the rail is 295px with a 28px gap. At 1250px and below, the sidebar becomes 210px and priority cards stack as horizontal rows. At 1000px and below, the sidebar becomes 190px, the rail moves below content and detail/profile layouts become one column. At 720px and below, navigation becomes a sticky top region with horizontal scrolling links; workspace offset disappears, top bar height is 49px and main padding is 24px 18px 18px. Cards stack vertically.

## Elevation & Depth

Persistent surfaces use borders and tonal separation. Cards shift upward 2px and strengthen their border on hover without shadows. Shadows are reserved for toast (0 8px 30px #28203c20), notification panel (0 8px 30px #28203c12) and command palette (0 20px 70px #14112425). The palette uses a dimmed backdrop.

## Shapes

Use modest rounded rectangles: 7px buttons, 8px fields, 10px opportunity cards and 12px attention panels. Badges use 4px corners. Circular avatars and orbital attention-panel artwork are established exceptions. Borders are generally 1px.

## Components

Primary buttons use indigo and white, 10px 14px padding, 11px medium-weight text and a 36px minimum height. Secondary buttons use white bordered surfaces; attention-panel actions use white with indigo text. Interactive controls expose a 3px focus outline with 3px offset. Disabled buttons use 0.5 opacity.

Opportunity cards group category, title, organization, summary, match explanation and deadline/action footer. Saved state is indigo. Eligibility combines a label with a semantic icon; detail requirements compare against the current profile. Navigation uses pale indigo active backgrounds; filter selection uses weight and a 2px underline. Fields use white backgrounds and subtle borders. Assistant surfaces remain subordinate to the attention panel and retain the local-demo disclosure.

Transitions last 0.18s. Reduced-motion preferences disable transitions and card translation. Lucide icons support actions and labels. Dialogs retain keyboard focus management and restore focus on dismissal.

### Intelligence extensions

These components extend the existing light panels, typography and indigo action hierarchy; base tokens remain unchanged. Opportunity impact pairs a prominent score with deadline and effort metadata. A native disclosure reveals labeled meters, numeric values, profile evidence and a planning-estimate caveat.

The action stepper uses numbered circles and a thin connector. Completed steps show a check, locked steps a lock, and every status has explanatory text: ready, resume required, conditional, locked, skipped or completed. Ready/completed steps expose Mark done/Undo; conditional steps include a shortlist selector. Preparation tracking is explicitly separate from submitting an application.

Focus budget controls offer 15, 30 and 60 minute presets with pressed state and a custom numeric draft. The draft commits on blur or Enter, rounds and clamps to 5–180 minutes; the heading and plan use the committed budget. Ordered action rows show priority, deadline, impact and effort, with a clear empty state and deferred actions below.

Resume controls combine a file picker/drop zone, saving/replacement copy, file metadata and labeled download/remove icon buttons. Long filenames wrap and controls wrap on mobile. Errors use an alert; privacy copy explains browser-only storage and that files are not sent to AI or employers.

Analyzer review places source entry and editable extracted facts in two columns, stacking below 1000px. Users review requirements and actions, see extraction confidence, and confirm source review before adding the notice. A subordinate impact preview follows the form. Processing feedback uses a small pulsing dot that stops under reduced-motion preferences.

## Do's and Don'ts

- Do preserve light surfaces and deadline hierarchy.
- Do use final secondary ink when adding metadata.
- Do explain eligibility with profile evidence and label uncertainty.
- Do retain visible keyboard focus and reduced-motion behavior.
- Don't communicate status through color alone.
- Don't apply attention-panel emphasis to every surface.
- Don't present seeded notices or local retrieval as live university integration.
