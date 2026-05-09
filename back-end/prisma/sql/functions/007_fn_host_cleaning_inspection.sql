CREATE OR REPLACE FUNCTION fn_host_cleaning_inspection_tasks(
  p_host_id uuid,
  p_effective_status text DEFAULT NULL,
  p_only_at_risk boolean DEFAULT NULL,
  p_limit integer DEFAULT 200
)
RETURNS TABLE(
  task_id uuid,
  place jsonb,
  previous_booking jsonb,
  next_booking jsonb,
  last_checkout timestamp,
  next_checkin timestamp,
  deadline_at timestamp,
  deadline_label text,
  cleaning_status text,
  cleaning_status_label text,
  inspection_status text,
  inspection_status_label text,
  overall_status text,
  overall_status_label text,
  effective_overall_status text,
  effective_overall_status_label text,
  cleaning_assignee jsonb,
  inspection_assignee jsonb,
  assignee jsonb,
  notes text,
  requires_photo_evidence boolean,
  minimum_required_evidence_count integer,
  checklist_items_count bigint,
  required_checklist_items_count bigint,
  incomplete_required_checklist_items_count bigint,
  failed_checklist_items_count bigint,
  total_evidence_count bigint,
  missing_required_evidence_count integer,
  is_required_checklist_complete boolean,
  has_minimum_required_evidence boolean,
  is_ready_for_approval boolean,
  next_checkin_at_risk boolean,
  cleaning_duration_minutes numeric,
  cleaning_checklist jsonb,
  inspection_checklist jsonb,
  photos_before jsonb,
  photos_after jsonb,
  photos_inspection jsonb,
  photos_issue jsonb,
  photos_general jsonb,
  created_at timestamp,
  updated_at timestamp
)
LANGUAGE sql
STABLE
AS $$
  WITH filtered_tasks AS (
    SELECT *
    FROM v_cleaning_inspection_task_health t
    WHERE t.host_id = p_host_id
      AND (
        p_effective_status IS NULL
        OR lower(t.effective_overall_status) = lower(p_effective_status)
      )
      AND (
        p_only_at_risk IS NULL
        OR t.next_checkin_at_risk = p_only_at_risk
      )
    ORDER BY
      t.next_checkin_at_risk DESC,
      CASE t.effective_overall_status
        WHEN 'OVERDUE' THEN 0
        WHEN 'BLOCKED' THEN 1
        WHEN 'REJECTED' THEN 2
        WHEN 'AWAITING_INSPECTION' THEN 3
        WHEN 'CLEANING_IN_PROGRESS' THEN 4
        WHEN 'AWAITING_CLEANING' THEN 5
        WHEN 'APPROVED' THEN 6
        ELSE 7
      END,
      t.deadline_at NULLS LAST,
      t.next_checkin NULLS LAST,
      t.updated_at DESC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 200), 1), 500)
  )
  SELECT
    t.task_id,
    jsonb_build_object(
      'id', t.place_id,
      'title', t.place_title,
      'city', t.place_city,
      'status', lower(t.place_status),
      'photo', t.place_photo_url
    ) AS place,
    (
      SELECT jsonb_build_object(
        'id', b.id,
        'guest', guest.name,
        'guestEmail', guest.email,
        'checkin', b.check_in,
        'checkout', b.check_out,
        'status', lower(b.status::text),
        'guests', b.guests
      )
      FROM bookings b
      LEFT JOIN users guest ON guest.id = b.guest_id
      WHERE b.id = t.previous_booking_id
    ) AS previous_booking,
    (
      SELECT jsonb_build_object(
        'id', b.id,
        'guest', guest.name,
        'guestEmail', guest.email,
        'checkin', b.check_in,
        'checkout', b.check_out,
        'status', lower(b.status::text),
        'guests', b.guests
      )
      FROM bookings b
      LEFT JOIN users guest ON guest.id = b.guest_id
      WHERE b.id = t.next_booking_id
    ) AS next_booking,
    t.last_checkout,
    t.next_checkin,
    t.deadline_at,
    CASE
      WHEN t.deadline_at IS NULL THEN NULL
      WHEN t.deadline_at < CURRENT_TIMESTAMP THEN 'Prazo vencido'
      ELSE 'Até ' || to_char(t.deadline_at, 'DD/MM HH24:MI')
    END AS deadline_label,
    lower(t.cleaning_status),
    t.cleaning_status_label,
    lower(t.inspection_status),
    t.inspection_status_label,
    lower(t.overall_status),
    t.overall_status_label,
    lower(t.effective_overall_status),
    t.effective_overall_status_label,
    CASE
      WHEN t.cleaning_assignee_id IS NULL AND t.cleaning_assignee_name IS NULL THEN NULL
      ELSE jsonb_build_object(
        'id', t.cleaning_assignee_id,
        'name', t.cleaning_assignee_name,
        'contact', t.cleaning_assignee_contact
      )
    END AS cleaning_assignee,
    CASE
      WHEN t.inspection_assignee_id IS NULL AND t.inspection_assignee_name IS NULL THEN NULL
      ELSE jsonb_build_object(
        'id', t.inspection_assignee_id,
        'name', t.inspection_assignee_name,
        'contact', t.inspection_assignee_contact
      )
    END AS inspection_assignee,
    CASE
      WHEN t.current_responsible_id IS NULL AND t.current_responsible_name IS NULL THEN NULL
      ELSE jsonb_build_object(
        'id', t.current_responsible_id,
        'name', t.current_responsible_name
      )
    END AS assignee,
    t.notes,
    t.requires_photo_evidence,
    t.minimum_required_evidence_count,
    t.checklist_items_count,
    t.required_checklist_items_count,
    t.incomplete_required_checklist_items_count,
    t.failed_checklist_items_count,
    t.total_evidence_count,
    t.missing_required_evidence_count,
    t.is_required_checklist_complete,
    t.has_minimum_required_evidence,
    t.is_ready_for_approval,
    t.next_checkin_at_risk,
    t.cleaning_duration_minutes,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', cci.id,
          'area', lower(cci.area::text),
          'label', cci.label,
          'description', cci.description,
          'required', cci.is_required,
          'status', CASE
            WHEN cci.status IN ('FAILED', 'ISSUE') THEN 'failed'
            ELSE lower(cci.status::text)
          END,
          'notes', cci.notes,
          'completedAt', cci.completed_at,
          'completedBy', CASE
            WHEN u.id IS NULL THEN NULL
            ELSE jsonb_build_object('id', u.id, 'name', u.name)
          END,
          'sortOrder', cci.sort_order
        )
        ORDER BY cci.sort_order, cci.id
      )
      FROM cleaning_checklist_items cci
      LEFT JOIN users u ON u.id = cci.completed_by_user_id
      WHERE cci.cleaning_inspection_id = t.task_id
    ), '[]'::jsonb) AS cleaning_checklist,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', ici.id,
          'area', lower(ici.area::text),
          'label', ici.label,
          'description', ici.description,
          'required', ici.is_required,
          'status', CASE
            WHEN ici.status IN ('FAILED', 'ISSUE') THEN 'failed'
            ELSE lower(ici.status::text)
          END,
          'notes', ici.notes,
          'completedAt', ici.completed_at,
          'completedBy', CASE
            WHEN u.id IS NULL THEN NULL
            ELSE jsonb_build_object('id', u.id, 'name', u.name)
          END,
          'sortOrder', ici.sort_order
        )
        ORDER BY ici.sort_order, ici.id
      )
      FROM inspection_checklist_items ici
      LEFT JOIN users u ON u.id = ici.completed_by_user_id
      WHERE ici.cleaning_inspection_id = t.task_id
    ), '[]'::jsonb) AS inspection_checklist,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', cip.id,
          'url', cip.url,
          'label', cip.label,
          'description', cip.description,
          'area', CASE WHEN cip.area IS NULL THEN NULL ELSE lower(cip.area::text) END,
          'type', lower(cip.type::text),
          'uploadedAt', cip.uploaded_at,
          'uploadedBy', CASE
            WHEN uploader.id IS NULL THEN NULL
            ELSE jsonb_build_object('id', uploader.id, 'name', uploader.name)
          END
        )
        ORDER BY cip.sort_order, cip.id
      )
      FROM cleaning_inspection_photos cip
      LEFT JOIN users uploader ON uploader.id = cip.uploaded_by_user_id
      WHERE cip.cleaning_inspection_id = t.task_id
        AND cip.type = 'BEFORE'
    ), '[]'::jsonb) AS photos_before,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', cip.id,
          'url', cip.url,
          'label', cip.label,
          'description', cip.description,
          'area', CASE WHEN cip.area IS NULL THEN NULL ELSE lower(cip.area::text) END,
          'type', lower(cip.type::text),
          'uploadedAt', cip.uploaded_at,
          'uploadedBy', CASE
            WHEN uploader.id IS NULL THEN NULL
            ELSE jsonb_build_object('id', uploader.id, 'name', uploader.name)
          END
        )
        ORDER BY cip.sort_order, cip.id
      )
      FROM cleaning_inspection_photos cip
      LEFT JOIN users uploader ON uploader.id = cip.uploaded_by_user_id
      WHERE cip.cleaning_inspection_id = t.task_id
        AND cip.type = 'AFTER'
    ), '[]'::jsonb) AS photos_after,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', cip.id,
          'url', cip.url,
          'label', cip.label,
          'description', cip.description,
          'area', CASE WHEN cip.area IS NULL THEN NULL ELSE lower(cip.area::text) END,
          'type', lower(cip.type::text),
          'uploadedAt', cip.uploaded_at,
          'uploadedBy', CASE
            WHEN uploader.id IS NULL THEN NULL
            ELSE jsonb_build_object('id', uploader.id, 'name', uploader.name)
          END
        )
        ORDER BY cip.sort_order, cip.id
      )
      FROM cleaning_inspection_photos cip
      LEFT JOIN users uploader ON uploader.id = cip.uploaded_by_user_id
      WHERE cip.cleaning_inspection_id = t.task_id
        AND cip.type = 'INSPECTION'
    ), '[]'::jsonb) AS photos_inspection,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', cip.id,
          'url', cip.url,
          'label', cip.label,
          'description', cip.description,
          'area', CASE WHEN cip.area IS NULL THEN NULL ELSE lower(cip.area::text) END,
          'type', lower(cip.type::text),
          'uploadedAt', cip.uploaded_at,
          'uploadedBy', CASE
            WHEN uploader.id IS NULL THEN NULL
            ELSE jsonb_build_object('id', uploader.id, 'name', uploader.name)
          END
        )
        ORDER BY cip.sort_order, cip.id
      )
      FROM cleaning_inspection_photos cip
      LEFT JOIN users uploader ON uploader.id = cip.uploaded_by_user_id
      WHERE cip.cleaning_inspection_id = t.task_id
        AND cip.type = 'ISSUE'
    ), '[]'::jsonb) AS photos_issue,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', cip.id,
          'url', cip.url,
          'label', cip.label,
          'description', cip.description,
          'area', CASE WHEN cip.area IS NULL THEN NULL ELSE lower(cip.area::text) END,
          'type', lower(cip.type::text),
          'uploadedAt', cip.uploaded_at,
          'uploadedBy', CASE
            WHEN uploader.id IS NULL THEN NULL
            ELSE jsonb_build_object('id', uploader.id, 'name', uploader.name)
          END
        )
        ORDER BY cip.sort_order, cip.id
      )
      FROM cleaning_inspection_photos cip
      LEFT JOIN users uploader ON uploader.id = cip.uploaded_by_user_id
      WHERE cip.cleaning_inspection_id = t.task_id
        AND cip.type = 'GENERAL'
    ), '[]'::jsonb) AS photos_general,
    t.created_at,
    t.updated_at
  FROM filtered_tasks t;
$$;

CREATE OR REPLACE FUNCTION fn_host_cleaning_inspection_metrics(
  p_host_id uuid
)
RETURNS TABLE(
  host_id uuid,
  host_name text,
  tasks_count bigint,
  pending_tasks_count bigint,
  tasks_in_cleaning_count bigint,
  tasks_awaiting_inspection_count bigint,
  tasks_approved_count bigint,
  tasks_blocked_count bigint,
  tasks_rejected_count bigint,
  tasks_overdue_count bigint,
  tasks_next_checkin_at_risk_count bigint,
  average_cleaning_duration_minutes numeric,
  inspection_approval_rate numeric,
  tasks_with_incomplete_checklist_count bigint,
  incomplete_checklist_items_count bigint,
  tasks_without_evidence_count bigint,
  recurring_problem_events_count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    m.host_id,
    m.host_name,
    m.tasks_count,
    m.pending_tasks_count,
    m.tasks_in_cleaning_count,
    m.tasks_awaiting_inspection_count,
    m.tasks_approved_count,
    m.tasks_blocked_count,
    m.tasks_rejected_count,
    m.tasks_overdue_count,
    m.tasks_next_checkin_at_risk_count,
    m.average_cleaning_duration_minutes,
    m.inspection_approval_rate,
    m.tasks_with_incomplete_checklist_count,
    m.incomplete_checklist_items_count,
    m.tasks_without_evidence_count,
    m.recurring_problem_events_count
  FROM v_host_cleaning_inspection_metrics m
  WHERE m.host_id = p_host_id;
$$;

CREATE OR REPLACE FUNCTION fn_host_cleaning_inspection_problem_places(
  p_host_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE(
  place_id uuid,
  place_title text,
  place_city text,
  tasks_count bigint,
  recurring_problem_count bigint,
  blocked_tasks_count bigint,
  rejected_tasks_count bigint,
  overdue_tasks_count bigint,
  next_checkin_at_risk_count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    t.place_id,
    t.place_title,
    t.place_city,
    COUNT(*) AS tasks_count,
    COALESCE(SUM(t.problem_score), 0)::bigint AS recurring_problem_count,
    COUNT(*) FILTER (WHERE t.effective_overall_status = 'BLOCKED') AS blocked_tasks_count,
    COUNT(*) FILTER (WHERE t.effective_overall_status = 'REJECTED') AS rejected_tasks_count,
    COUNT(*) FILTER (WHERE t.effective_overall_status = 'OVERDUE') AS overdue_tasks_count,
    COUNT(*) FILTER (WHERE t.next_checkin_at_risk) AS next_checkin_at_risk_count
  FROM v_cleaning_inspection_task_health t
  WHERE t.host_id = p_host_id
  GROUP BY t.place_id, t.place_title, t.place_city
  ORDER BY recurring_problem_count DESC, next_checkin_at_risk_count DESC, t.place_title
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 10), 1), 100);
$$;

CREATE OR REPLACE FUNCTION fn_host_cleaning_inspection_responsibles(
  p_host_id uuid,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  responsible_id uuid,
  responsible_name text,
  tasks_count bigint,
  awaiting_cleaning_count bigint,
  cleaning_in_progress_count bigint,
  awaiting_inspection_count bigint,
  approved_count bigint,
  blocked_count bigint,
  rejected_count bigint,
  overdue_count bigint,
  next_checkin_at_risk_count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(t.current_responsible_id, t.cleaning_assignee_id, t.inspection_assignee_id) AS responsible_id,
    COALESCE(t.current_responsible_name, 'Sem responsável') AS responsible_name,
    COUNT(*) AS tasks_count,
    COUNT(*) FILTER (WHERE t.effective_overall_status = 'AWAITING_CLEANING') AS awaiting_cleaning_count,
    COUNT(*) FILTER (WHERE t.effective_overall_status = 'CLEANING_IN_PROGRESS') AS cleaning_in_progress_count,
    COUNT(*) FILTER (WHERE t.effective_overall_status = 'AWAITING_INSPECTION') AS awaiting_inspection_count,
    COUNT(*) FILTER (WHERE t.effective_overall_status = 'APPROVED') AS approved_count,
    COUNT(*) FILTER (WHERE t.effective_overall_status = 'BLOCKED') AS blocked_count,
    COUNT(*) FILTER (WHERE t.effective_overall_status = 'REJECTED') AS rejected_count,
    COUNT(*) FILTER (WHERE t.effective_overall_status = 'OVERDUE') AS overdue_count,
    COUNT(*) FILTER (WHERE t.next_checkin_at_risk) AS next_checkin_at_risk_count
  FROM v_cleaning_inspection_task_health t
  WHERE t.host_id = p_host_id
  GROUP BY
    COALESCE(t.current_responsible_id, t.cleaning_assignee_id, t.inspection_assignee_id),
    COALESCE(t.current_responsible_name, 'Sem responsável')
  ORDER BY next_checkin_at_risk_count DESC, tasks_count DESC, responsible_name
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 200);
$$;
