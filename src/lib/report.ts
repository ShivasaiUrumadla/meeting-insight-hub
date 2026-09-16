/**
 * Parses the plain-text report returned by the backend into named sections.
 * Nothing is invented: unmatched content is preserved and rendered raw.
 */

export interface ActionItem {
  task: string;
  person: string;
  deadline: string;
}

export interface ParsedReport {
  summary: string;
  topics: string[];
  decisions: string[];
  actionItems: ActionItem[];
  questions: string[];
  missedBrief: string;
  /** Sections we recognised nothing from — shown verbatim. */
  other: { heading: string; body: string }[];
  /** True when no known heading matched at all. */
  raw: boolean;
}

const NOT_SPECIFIED = "Not specified";

const MATCHERS: { key: keyof ParsedReport | "missedBrief"; re: RegExp }[] = [
  { key: "summary", re: /^(meeting\s+)?summary\b|^overview\b|^executive\s+summary\b/i },
  { key: "topics", re: /^key\s+topics\b|^topics\b|^main\s+topics\b|^discussion\s+points\b/i },
  { key: "decisions", re: /^(important\s+|key\s+)?decisions?\b/i },
  { key: "actionItems", re: /^action\s*items?\b|^next\s+steps\b|^tasks\b/i },
  { key: "questions", re: /^open\s+questions\b|^unresolved\b|^questions\b/i },
  {
    key: "missedBrief",
    re: /missed\s+(the\s+)?meeting|if\s+you\s+missed|needs?\s+to\s+know|catch[-\s]?up/i,
  },
];

function cleanHeading(line: string): string {
  return line
    .replace(/^[#*\s]+/, "")
    .replace(/[#*:\s]+$/, "")
    .replace(/^\d+[.)]\s*/, "")
    .trim();
}

function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^#{1,6}\s+\S/.test(trimmed)) return true;
  if (/^\*\*[^*]{2,60}\*\*:?$/.test(trimmed)) return true;
  if (/^[A-Z0-9][A-Za-z0-9 /&'’-]{2,60}:?$/.test(trimmed) && trimmed.split(" ").length <= 8) {
    return /:$/.test(trimmed) || trimmed === trimmed.toUpperCase();
  }
  return false;
}

function toLines(body: string): string[] {
  return body
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-*•‣]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

function parseActionItems(body: string): ActionItem[] {
  const rows = body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^\|?\s*[-:| ]+\|?$/.test(l));

  const items: ActionItem[] = [];

  for (const row of rows) {
    if (row.includes("|")) {
      const cells = row
        .split("|")
        .map((c) => c.trim())
        .filter((c, i, arr) => !(c === "" && (i === 0 || i === arr.length - 1)));
      if (cells.length >= 2) {
        const [task, person, deadline] = cells;
        if (/^task$/i.test(task ?? "")) continue;
        items.push({
          task: task || NOT_SPECIFIED,
          person: normalise(person),
          deadline: normalise(deadline),
        });
        continue;
      }
    }

    const line = row.replace(/^\s*(?:[-*•‣]|\d+[.)])\s*/, "").trim();
    if (!line) continue;

    const owner = line.match(/(?:owner|assignee|person|assigned to)\s*[:–-]\s*([^—|;()]+)/i);
    const due = line.match(/(?:deadline|due|by)\s*[:–-]\s*([^—|;()]+)/i);
    const task = line
      .replace(/(?:owner|assignee|person|assigned to)\s*[:–-]\s*[^—|;()]+/i, "")
      .replace(/(?:deadline|due|by)\s*[:–-]\s*[^—|;()]+/i, "")
      .replace(/[\s—,;|()-]+$/, "")
      .trim();

    items.push({
      task: task || line,
      person: normalise(owner?.[1]),
      deadline: normalise(due?.[1]),
    });
  }

  return items;
}

function normalise(value?: string): string {
  const v = (value ?? "").trim().replace(/^[-–—]$/, "");
  if (!v || /^(n\/?a|none|unknown|unspecified|not specified|tbd|-)$/i.test(v)) {
    return NOT_SPECIFIED;
  }
  return v;
}

export function parseReport(report: string): ParsedReport {
  const result: ParsedReport = {
    summary: "",
    topics: [],
    decisions: [],
    actionItems: [],
    questions: [],
    missedBrief: "",
    other: [],
    raw: false,
  };

  const lines = (report ?? "").split("\n");
  const blocks: { heading: string; body: string }[] = [];
  let current: { heading: string; body: string[] } | null = null;
  const preamble: string[] = [];

  for (const line of lines) {
    if (isHeading(line)) {
      if (current) blocks.push({ heading: current.heading, body: current.body.join("\n").trim() });
      current = { heading: cleanHeading(line), body: [] };
    } else if (current) {
      current.body.push(line);
    } else {
      preamble.push(line);
    }
  }
  if (current) blocks.push({ heading: current.heading, body: current.body.join("\n").trim() });

  if (blocks.length === 0) {
    result.raw = true;
    result.summary = (report ?? "").trim();
    return result;
  }

  let matchedAny = false;

  for (const block of blocks) {
    const match = MATCHERS.find((m) => m.re.test(block.heading));
    if (!match) {
      if (block.body) result.other.push(block);
      continue;
    }
    matchedAny = true;
    switch (match.key) {
      case "summary":
        result.summary = result.summary || block.body;
        break;
      case "missedBrief":
        result.missedBrief = result.missedBrief || block.body;
        break;
      case "topics":
        result.topics = toLines(block.body);
        break;
      case "decisions":
        result.decisions = toLines(block.body);
        break;
      case "questions":
        result.questions = toLines(block.body);
        break;
      case "actionItems":
        result.actionItems = parseActionItems(block.body);
        break;
      default:
        break;
    }
  }

  if (!matchedAny) {
    result.raw = true;
    result.summary = (report ?? "").trim();
    return result;
  }

  if (!result.summary) result.summary = preamble.join("\n").trim();

  return result;
}

export const NOT_SPECIFIED_LABEL = NOT_SPECIFIED;
