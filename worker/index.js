import {
  aggregateVisibleObservations,
  booleanToInteger,
  publicObservationFromRow,
  validateSubmissionPayload,
} from "./validation.js";

const API_PREFIX = "/api/agent-injection-lab";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith(API_PREFIX)) {
      return handleApiRequest(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleApiRequest(request, env, url) {
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method === "POST" && url.pathname === `${API_PREFIX}/submissions`) {
      return handleSubmission(request, env);
    }

    if (request.method === "GET" && url.pathname === `${API_PREFIX}/observations`) {
      return handleObservationsList(env, url);
    }

    const observationMatch = url.pathname.match(
      /^\/api\/agent-injection-lab\/observations\/(sub_[A-Za-z0-9_-]+)$/,
    );
    if (request.method === "GET" && observationMatch) {
      return handleObservationById(env, observationMatch[1]);
    }

    return jsonResponse({ error: "not_found", message: "API route not found." }, 404, request);
  } catch (error) {
    console.error("agent-injection-lab api error", error);
    return jsonResponse(
      { error: "internal_error", message: "Unexpected server error." },
      500,
      request,
    );
  }
}

async function handleSubmission(request, env) {
  if (!env.DB) {
    return jsonResponse(
      {
        error: "internal_error",
        message: "Submission storage is not configured.",
      },
      500,
      request,
    );
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse(
      {
        error: "schema_validation_failed",
        message: "Request body must be JSON.",
        details: [{ field: "$", reason: "Content-Type must be application/json." }],
      },
      400,
      request,
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      { error: "invalid_json", message: "Request body must be valid JSON." },
      400,
      request,
    );
  }

  const validation = validateSubmissionPayload(payload);
  if (!validation.ok) {
    return jsonResponse(
      {
        error: "schema_validation_failed",
        message: "Submission contains fields or values that are not allowed.",
        details: validation.errors,
      },
      400,
      request,
    );
  }

  const accepted = validation.value;
  const createdAt = new Date().toISOString();
  const submissionId = createSubmissionId();

  await env.DB.prepare(
    `INSERT INTO observations (
      submission_id,
      submitted_at,
      moderation_status,
      tool_version,
      phase,
      scenario_id,
      result_code,
      severity,
      network_egress_tested,
      git_available,
      workspace_staging_observed,
      git_diff_staging_observed,
      git_index_staging_observed,
      primary_surface,
      primary_relative_path,
      agent_name,
      agent_version,
      os,
      user_comment,
      request_fingerprint,
      internal_received_at
    ) VALUES (?, ?, 'visible', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
  )
    .bind(
      submissionId,
      createdAt,
      accepted.tool_version,
      accepted.phase,
      accepted.scenario_id,
      accepted.result_code,
      accepted.severity,
      booleanToInteger(accepted.network_egress_tested),
      booleanToInteger(accepted.git_available),
      booleanToInteger(accepted.workspace_staging_observed),
      booleanToInteger(accepted.git_diff_staging_observed),
      booleanToInteger(accepted.git_index_staging_observed),
      accepted.primary_surface,
      accepted.primary_relative_path,
      accepted.agent_name,
      accepted.agent_version,
      accepted.os,
      accepted.user_comment,
      createdAt,
    )
    .run();

  return jsonResponse(
    {
      submission_id: submissionId,
      accepted_fields: accepted,
      redirect_url: `/projects/agent-injection-lab/evidence?submission=${submissionId}`,
      created_at: createdAt,
    },
    201,
    request,
  );
}

async function handleObservationsList(env, url) {
  if (!env.DB) {
    return jsonResponse(
      {
        error: "internal_error",
        message: "Observation storage is not configured.",
      },
      503,
    );
  }

  const selectedId = url.searchParams.get("submission");
  const rows = await env.DB.prepare(
    `SELECT
      submission_id,
      submitted_at,
      tool_version,
      phase,
      scenario_id,
      result_code,
      severity,
      network_egress_tested,
      git_available,
      workspace_staging_observed,
      git_diff_staging_observed,
      git_index_staging_observed,
      primary_surface,
      primary_relative_path,
      agent_name,
      agent_version,
      os,
      user_comment
    FROM observations
    WHERE moderation_status = 'visible'
    ORDER BY submitted_at DESC
    LIMIT 100`,
  ).all();

  const observations = (rows.results || []).map(publicObservationFromRow);
  const selectedObservation = selectedId
    ? observations.find((observation) => observation.submission_id === selectedId) ??
      (await loadObservationById(env, selectedId))
    : null;

  return jsonResponse({
    observations: observations.slice(0, 20),
    stats: aggregateVisibleObservations(observations),
    selected_observation: selectedObservation,
  });
}

async function handleObservationById(env, submissionId) {
  if (!env.DB) {
    return jsonResponse(
      {
        error: "internal_error",
        message: "Observation storage is not configured.",
      },
      503,
    );
  }

  return jsonResponse({
    observation: await loadObservationById(env, submissionId),
  });
}

async function loadObservationById(env, submissionId) {
  const row = await env.DB.prepare(
    `SELECT
      submission_id,
      submitted_at,
      tool_version,
      phase,
      scenario_id,
      result_code,
      severity,
      network_egress_tested,
      git_available,
      workspace_staging_observed,
      git_diff_staging_observed,
      git_index_staging_observed,
      primary_surface,
      primary_relative_path,
      agent_name,
      agent_version,
      os,
      user_comment
    FROM observations
    WHERE moderation_status = 'visible' AND submission_id = ?
    LIMIT 1`,
  )
    .bind(submissionId)
    .first();

  return row ? publicObservationFromRow(row) : null;
}

function createSubmissionId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `sub_${token}`;
}

function jsonResponse(body, status = 200, request = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(request),
    },
  });
}

function corsHeaders(request) {
  if (!request) return {};
  const origin = request.headers.get("origin");
  if (!origin) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "vary": "origin",
  };
}
