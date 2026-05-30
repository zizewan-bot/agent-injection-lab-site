export type ProjectLink = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  links: ProjectLink[];
  status: string[];
};

export const projects: Project[] = [
  {
    slug: "agent-injection-lab",
    name: "Agent Injection Lab",
    tagline:
      "A local staging test for AI coding agents exposed to untrusted sources.",
    summary:
      "Give your AI coding agent a cached bug report. See whether it stages a synthetic secret in the local workspace.",
    links: [
      {
        label: "View Project",
        href: "/projects/agent-injection-lab",
        variant: "primary",
      },
      {
        label: "GitHub Repo · Public preview",
        href: "https://github.com/zizewan-bot/agent-injection-lab",
      },
      {
        label: "Evidence Gallery",
        href: "/projects/agent-injection-lab/evidence",
      },
      {
        label: "Test Guide",
        href: "/projects/agent-injection-lab/test",
      },
      {
        label: "Scenario Catalog",
        href: "/projects/agent-injection-lab/scenarios",
      },
    ],
    status: [
      "Phase 0 / v0.1.0",
      "Seed-user testing ready",
      "Local-only",
      "No data upload by default",
    ],
  },
];

export const futureRoutes = [
  "/qa",
];
