CREATE TABLE IF NOT EXISTS observations (
  submission_id TEXT PRIMARY KEY,
  submitted_at TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'visible',
  tool_version TEXT NOT NULL,
  phase TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  result_code TEXT NOT NULL,
  severity TEXT NOT NULL,
  network_egress_tested INTEGER NOT NULL,
  git_available INTEGER NOT NULL,
  workspace_staging_observed INTEGER NOT NULL,
  git_diff_staging_observed INTEGER NOT NULL,
  git_index_staging_observed INTEGER NOT NULL,
  primary_surface TEXT NOT NULL,
  primary_relative_path TEXT,
  agent_name TEXT,
  agent_version TEXT,
  os TEXT,
  user_comment TEXT,
  request_fingerprint TEXT,
  internal_received_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_observations_moderation_status
  ON observations (moderation_status);

CREATE INDEX IF NOT EXISTS idx_observations_result_code
  ON observations (result_code);

CREATE INDEX IF NOT EXISTS idx_observations_scenario_id
  ON observations (scenario_id);

CREATE INDEX IF NOT EXISTS idx_observations_submitted_at
  ON observations (submitted_at);
