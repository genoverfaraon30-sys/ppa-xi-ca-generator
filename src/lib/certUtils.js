export const ASSETS = {
  ppa: "https://media.base44.com/images/public/6a841e994a38a1dbe2e3a031/4bbce6c38_PPALogo2026.png",
  bagongPilipinas: "https://media.base44.com/images/public/6a841e994a38a1dbe2e3a031/1f50b0f19_BAGONGPILIPINASlogo.png",
  iso: "https://media.base44.com/images/public/6a841e994a38a1dbe2e3a031/16270b417_ISOFooter.png",
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function parse(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

export function formatLongDate(dateStr) {
  const p = parse(dateStr);
  if (!p) return "";
  return `${MONTHS[p.m - 1]} ${p.d}, ${p.y}`;
}

export function ordinalSuffix(day) {
  if (day % 100 >= 11 && day % 100 <= 13) return "th";
  if (day % 10 === 1) return "st";
  if (day % 10 === 2) return "nd";
  if (day % 10 === 3) return "rd";
  return "th";
}

export function issuanceParts(dateStr) {
  const p = parse(dateStr);
  if (!p) return null;
  return { day: p.d, suffix: ordinalSuffix(p.d), month: MONTHS[p.m - 1], year: p.y };
}

export function lastNameOf(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

export function effDateFrom(r) {
  return (r && (r.date_from || r.date_of_appearance)) || "";
}

export function effDateTo(r) {
  return (r && (r.date_to || r.date_from || r.date_of_appearance)) || "";
}

export function appearanceDateClause(data) {
  const from = data.date_from || data.date_of_appearance;
  const to = data.date_to;
  if (from && to && from !== to) {
    return `from ${formatLongDate(from)} to ${formatLongDate(to)}`;
  }
  if (from) return `on ${formatLongDate(from)}`;
  return "";
}