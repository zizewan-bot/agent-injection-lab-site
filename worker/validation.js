const ALLOWED_FIELDS = new Set([
  "tool_version",
  "phase",
  "scenario_id",
  "result_code",
  "severity",
  "network_egress_tested",
  "git_available",
  "workspace_staging_observed",
  "git_diff_staging_observed",
  "git_index_staging_observed",
  "primary_surface",
  "primary_relative_path",
  "agent_name",
  "agent_version",
  "os",
  "user_comment",
]);

const REQUIRED_FIELDS = [
  "tool_version",
  "phase",
  "scenario_id",
  "result_code",
  "severity",
  "network_egress_tested",
  "git_available",
  "workspace_staging_observed",
  "git_diff_staging_observed",
  "git_index_staging_observed",
  "primary_surface",
];

const FORBIDDEN_FIELD_NAMES = new Set([
  "run_id",
  "report_path",
  "events",
  "snippets",
  "report_html",
  "report_md",
  "events_jsonl",
  "source_content",
  "synthetic_secret",
  "prompt",
  "git_diff",
  "source_code",
  "email",
  "username",
  "absolute_path",
]);

const PHASES = new Set(["phase_0_local_staging"]);
const SEVERITIES = new Set(["critical", "high", "medium", "info"]);
const RESULT_CODES = new Set([
  "CRITICAL_SECRET_STAGED_IN_WORKSPACE_FILE",
  "CRITICAL_SECRET_STAGED_IN_GIT_DIFF",
  "CRITICAL_SECRET_STAGED_IN_GIT_INDEX",
  "HIGH_GIT_UNAVAILABLE",
  "NO_VERIFIED_STAGING_OBSERVED",
  "INCONCLUSIVE_RUN_ERROR",
]);
const PRIMARY_SURFACES = new Set([
  "workspace_file",
  "git_diff",
  "git_index",
  "git_unavailable",
  "none",
  "unknown",
]);

const STRING_LIMITS = {
  tool_version: 32,
  phase: 32,
  scenario_id: 80,
  result_code: 64,
  severity: 32,
  primary_surface: 80,
  primary_relative_path: 200,
  agent_name: 80,
  agent_version: 80,
  os: 80,
  user_comment: 500,
};

const BOOLEAN_FIELDS = [
  "network_egress_tested",
  "git_available",
  "workspace_staging_observed",
  "git_diff_staging_observed",
  "git_index_staging_observed",
];

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

export function validateSubmissionPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return fail([{ field: "$", reason: "Request body must be a JSON object." }]);
  }

  for (const key of Object.keys(payload)) {
    if (FORBIDDEN_FIELD_NAMES.has(key)) {
      errors.push({ field: key, reason: "Forbidden field." });
      continue;
    }
    if (!ALLOWED_FIELDS.has(key)) {
      errors.push({ field: key, reason: "Unknown field." });
    }
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in payload)) {
      errors.push({ field, reason: "Required field is missing." });
    }
  }

  const accepted = {};

  for (const field of [
    "tool_version",
    "phase",
    "scenario_id",
    "result_code",
    "severity",
    "primary_surface",
  ]) {
    const value = payload[field];
    const normalized = validateRequiredString(field, value, errors);
    if (normalized !== undefined) accepted[field] = normalized;
  }

  if (accepted.phase && !PHASES.has(accepted.phase)) {
    errors.push({ field: "phase", reason: "Unsupported phase." });
  }
  if (accepted.severity && !SEVERITIES.has(accepted.severity)) {
    errors.push({ field: "severity", reason: "Unsupported severity." });
  }
  if (accepted.result_code && !RESULT_CODES.has(accepted.result_code)) {
    errors.push({ field: "result_code", reason: "Unsupported result code." });
  }
  if (accepted.primary_surface && !PRIMARY_SURFACES.has(accepted.primary_surface)) {
    errors.push({ field: "primary_surface", reason: "Unsupported primary surface." });
  }

  for (const field of BOOLEAN_FIELDS) {
    if (typeof payload[field] !== "boolean") {
      errors.push({ field, reason: "Expected boolean." });
    } else {
      accepted[field] = payload[field];
    }
  }

  validatePrimaryRelativePath(payload, accepted, errors);

  for (const field of ["agent_name", "agent_version", "os", "user_comment"]) {
    if (!(field in payload) || payload[field] == null) continue;
    const normalized = validateOptionalString(field, payload[field], errors);
    if (normalized !== undefined) accepted[field] = normalized;
  }

  for (const field of ["agent_name", "agent_version", "os", "user_comment"]) {
    if (accepted[field] && EMAIL_PATTERN.test(accepted[field])) {
      errors.push({ field, reason: "Email addresses are not allowed." });
    }
  }

  if (errors.length > 0) return fail(errors);

  return {
    ok: true,
    value: {
      ...accepted,
      agent_name: accepted.agent_name ?? null,
      agent_version: accepted.agent_version ?? null,
      os: accepted.os ?? null,
      user_comment: accepted.user_comment ?? null,
    },
  };
}

function validateRequiredString(field, value, errors) {
  if (typeof value !== "string") {
    errors.push({ field, reason: "Expected string." });
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized) {
    errors.push({ field, reason: "Required string cannot be empty." });
    return undefined;
  }
  if (normalized.length > STRING_LIMITS[field]) {
    errors.push({ field, reason: `Must be ${STRING_LIMITS[field]} characters or less.` });
    return undefined;
  }
  return normalized;
}

function validateOptionalString(field, value, errors) {
  if (typeof value !== "string") {
    errors.push({ field, reason: "Expected string." });
    return undefined;
  }
  const normalized = value.trim();
  if (!normalized) return undefined;
  if (normalized.length > STRING_LIMITS[field]) {
    errors.push({ field, reason: `Must be ${STRING_LIMITS[field]} characters or less.` });
    return undefined;
  }
  if (field === "user_comment" && /[<>]/.test(normalized)) {
    errors.push({ field, reason: "HTML-like text is not allowed." });
    return undefined;
  }
  return normalized;
}

function validatePrimaryRelativePath(payload, accepted, errors) {
  const resultCode = accepted.result_code ?? payload.result_code;
  const isCritical = typeof resultCode === "string" && resultCode.startsWith("CRITICAL_");
  const hasField = "primary_relative_path" in payload;
  const value = payload.primary_relative_path;

  if (!hasField || value == null) {
    if (isCritical) {
      errors.push({
        field: "primary_relative_path",
        reason: "Required for critical staging results.",
      });
    } else {
      accepted.primary_relative_path = null;
    }
    return;
  }

  if (typeof value !== "string") {
    errors.push({ field: "primary_relative_path", reason: "Expected string or null." });
    return;
  }

  const normalized = value.trim().replaceAll("\\", "/");
  if (!normalized) {
    if (isCritical) {
      errors.push({ field: "primary_relative_path", reason: "Required path cannot be empty." });
    } else {
      accepted.primary_relative_path = null;
    }
    return;
  }

  const pathError = getRelativePathError(normalized);
  if (pathError) {
    errors.push({ field: "primary_relative_path", reason: pathError });
    return;
  }

  accepted.primary_relative_path = normalized;
}

function getRelativePathError(value) {
  if (value.length > STRING_LIMITS.primary_relative_path) return "Must be 200 characters or less.";
  if (value.includes("\0")) return "Embedded null bytes are not allowed.";
  if (value.startsWith("/")) return "Absolute paths are not allowed.";
  if (value.startsWith("~")) return "Home-directory paths are not allowed.";
  if (/^[A-Za-z]:[\\/]/.test(value)) return "Windows drive paths are not allowed.";
  if (value.startsWith("//")) return "UNC paths are not allowed.";
  if (value.split("/").includes("..")) return "Path traversal is not allowed.";
  if (/(^|\/)(Users|home)(\/|$)/i.test(value)) return "Home-directory fragments are not allowed.";
  if (/^[A-Za-z]:\/Users\//i.test(value)) return "User profile paths are not allowed.";
  return null;
}

function fail(errors) {
  return { ok: false, errors };
}

export function booleanToInteger(value) {
  return value ? 1 : 0;
}

export function integerToBoolean(value) {
  return value === 1 || value === true;
}

export function publicObservationFromRow(row) {
  return {
    submission_id: row.submission_id,
    submitted_at: row.submitted_at,
    tool_version: row.tool_version,
    phase: row.phase,
    scenario_id: row.scenario_id,
    result_code: row.result_code,
    severity: row.severity,
    network_egress_tested: integerToBoolean(row.network_egress_tested),
    git_available: integerToBoolean(row.git_available),
    workspace_staging_observed: integerToBoolean(row.workspace_staging_observed),
    git_diff_staging_observed: integerToBoolean(row.git_diff_staging_observed),
    git_index_staging_observed: integerToBoolean(row.git_index_staging_observed),
    primary_surface: row.primary_surface,
    primary_relative_path: row.primary_relative_path,
    agent_name: row.agent_name,
    agent_version: row.agent_version,
    os: row.os,
    user_comment: row.user_comment,
  };
}

export function aggregateVisibleObservations(rows) {
  const visibleRows = rows.filter(
    (row) => !("moderation_status" in row) || row.moderation_status === "visible",
  );
  const stats = {
    total_observations: visibleRows.length,
    count_by_result_code: {},
    count_by_scenario_id: {},
    count_by_agent_name: {},
    critical_local_staging_observed: 0,
    no_verified_staging_observed: 0,
    degraded_inconclusive: 0,
    network_egress_tested: { true: 0, false: 0 },
  };

  for (const row of visibleRows) {
    increment(stats.count_by_result_code, row.result_code);
    increment(stats.count_by_scenario_id, row.scenario_id);
    increment(stats.count_by_agent_name, row.agent_name || "Not provided");
    if (row.result_code.startsWith("CRITICAL_")) stats.critical_local_staging_observed += 1;
    if (row.result_code === "NO_VERIFIED_STAGING_OBSERVED") stats.no_verified_staging_observed += 1;
    if (row.result_code === "HIGH_GIT_UNAVAILABLE" || row.result_code === "INCONCLUSIVE_RUN_ERROR") {
      stats.degraded_inconclusive += 1;
    }
    stats.network_egress_tested[row.network_egress_tested ? "true" : "false"] += 1;
  }

  return stats;
}

function increment(map, key) {
  map[key] = (map[key] ?? 0) + 1;
}
