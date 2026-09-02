import {
  CANDIDATE_ROWS,
  type BoardTableGroup,
  type BoardTableRow,
} from "./nikeScanFlow";

export const HR_PIPELINE_BOARD_TITLE = "HR recruitment pipeline";
export const HR_PIPELINE_DOC_TITLE = "How to transcribe your interviews";
export const HR_PIPELINE_HIRE_ROLE = "3D Footwear Designer";
export const HR_PIPELINE_PLACEHOLDER_ROLE = "Role title";

/** Replace Jade's "Candidates board" wording so chat matches the live board. */
export function rewriteCandidatesBoardName(
  text: string,
  boardTitle = HR_PIPELINE_BOARD_TITLE,
): string {
  return text.replaceAll("Candidates board", `${boardTitle} board`);
}

export const HR_PIPELINE_BOARD_GROUPS: BoardTableGroup[] = [
  {
    id: "schedule-interviews",
    title: "Schedule interviews",
    color: "#0073ea",
    lastColumnLabel: "Email address",
    variant: "pipeline",
    rows: [
      {
        name: "John Doe",
        location: "Applied",
        timeline: "",
        company: "john.doe@email.com",
        stage: "Applied",
        stageColor: "#323338",
        email: "john.doe@email.com",
        role: HR_PIPELINE_PLACEHOLDER_ROLE,
        personActive: true,
      },
      {
        name: "Jane Doe",
        location: "Offered",
        timeline: "",
        company: "jane.doe@email.com",
        stage: "Offered",
        stageColor: "#00c875",
        email: "jane.doe@email.com",
        role: HR_PIPELINE_PLACEHOLDER_ROLE,
      },
      {
        name: "John Smith",
        location: "Interviewing",
        timeline: "",
        company: "john.smith@email.com",
        stage: "Interviewing",
        stageColor: "#fdab3d",
        email: "john.smith@email.com",
        role: HR_PIPELINE_PLACEHOLDER_ROLE,
      },
    ],
  },
];

/** Real shortlist Max found — appended to the live board after the user approves. */
export const PACKAGED_APPROVED_CANDIDATES: BoardTableRow[] =
  CANDIDATE_ROWS.map((row, index) => ({
    name: row.name,
    location: "Applied",
    timeline: "",
    company: `${row.name.toLowerCase().replace(/\s+/g, ".")}@email.com`,
    stage: "Applied",
    stageColor: "#323338",
    email: `${row.name.toLowerCase().replace(/\s+/g, ".")}@email.com`,
    role: HR_PIPELINE_HIRE_ROLE,
    personActive: index === 0,
  }));

export function buildPackagedBoardUpdateMessage(boardTitle: string): string {
  const names = PACKAGED_APPROVED_CANDIDATES.map((row) => row.name);
  const nameList =
    names.length <= 1
      ? (names[0] ?? "these candidates")
      : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;

  return `I've added ${nameList} to your ${boardTitle} board — watch them land in the table behind us.`;
}
