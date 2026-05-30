import test from "node:test";
import assert from "node:assert/strict";
import {
  aggregateVisibleObservations,
  validateSubmissionPayload,
} from "../worker/validation.js";

const basePayload = {
  tool_version: "0.1.0",
  phase: "phase_0_local_staging",
  scenario_id: "dependency_resolver_staging",
  result_code: "CRITICAL_SECRET_STAGED_IN_WORKSPACE_FILE",
  severity: "critical",
  network_egress_tested: false,
  git_available: true,
  workspace_staging_observed: true,
  git_diff_staging_observed: false,
  git_index_staging_observed: false,
  primary_surface: "workspace_file",
  primary_relative_path: "workspace/diagnostic.log",
};

test("validator accepts critical workspace summary", () => {
  const result = validateSubmissionPayload(basePayload);
  assert.equal(result.ok, true);
  assert.equal(result.value.primary_relative_path, "workspace/diagnostic.log");
});

test("validator accepts clean summary with null path", () => {
  const result = validateSubmissionPayload({
    ...basePayload,
    result_code: "NO_VERIFIED_STAGING_OBSERVED",
    severity: "info",
    workspace_staging_observed: false,
    primary_surface: "none",
    primary_relative_path: null,
  });
  assert.equal(result.ok, true);
  assert.equal(result.value.primary_relative_path, null);
});

test("validator rejects unknown field", () => {
  const result = validateSubmissionPayload({ ...basePayload, extra: true });
  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result.errors), /Unknown field/);
});

test("validator rejects run_id", () => {
  const result = validateSubmissionPayload({ ...basePayload, run_id: "abc" });
  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result.errors), /Forbidden field/);
});

test("validator rejects absolute Unix path", () => {
  const result = validateSubmissionPayload({
    ...basePayload,
    primary_relative_path: "/tmp/workspace/diagnostic.log",
  });
  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result.errors), /Absolute paths/);
});

test("validator rejects Windows path", () => {
  const result = validateSubmissionPayload({
    ...basePayload,
    primary_relative_path: "C:\\Users\\name\\project\\diagnostic.log",
  });
  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result.errors), /Windows drive/);
});

test("validator rejects path traversal", () => {
  const result = validateSubmissionPayload({
    ...basePayload,
    primary_relative_path: "../diagnostic.log",
  });
  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result.errors), /Path traversal/);
});

test("validator rejects long user_comment", () => {
  const result = validateSubmissionPayload({
    ...basePayload,
    user_comment: "x".repeat(501),
  });
  assert.equal(result.ok, false);
  assert.match(JSON.stringify(result.errors), /500 characters/);
});

test("validator rejects email in user_comment or agent fields", () => {
  const commentResult = validateSubmissionPayload({
    ...basePayload,
    user_comment: "contact me at test@example.com",
  });
  const agentResult = validateSubmissionPayload({
    ...basePayload,
    agent_name: "agent@example.com",
  });
  assert.equal(commentResult.ok, false);
  assert.equal(agentResult.ok, false);
  assert.match(JSON.stringify(commentResult.errors), /Email addresses/);
  assert.match(JSON.stringify(agentResult.errors), /Email addresses/);
});

test("aggregation excludes non-visible observations", () => {
  const stats = aggregateVisibleObservations([
    {
      moderation_status: "visible",
      result_code: "NO_VERIFIED_STAGING_OBSERVED",
      scenario_id: "dependency_resolver_staging",
      agent_name: null,
      network_egress_tested: false,
    },
    {
      moderation_status: "hidden",
      result_code: "CRITICAL_SECRET_STAGED_IN_WORKSPACE_FILE",
      scenario_id: "dependency_resolver_staging",
      agent_name: "Hidden Agent",
      network_egress_tested: false,
    },
  ]);

  assert.equal(stats.total_observations, 1);
  assert.equal(stats.no_verified_staging_observed, 1);
  assert.equal(stats.critical_local_staging_observed, 0);
});
