-- Camada de leitura consolidada para tarefas de limpeza e vistoria.

CREATE OR REPLACE VIEW v_cleaning_inspection_task_health AS
WITH first_place_photo AS (
  SELECT
    pp.place_id,
    pp.url,
    ROW_NUMBER() OVER (PARTITION BY pp.place_id ORDER BY pp.sort_order, pp.created_at) AS rn
  FROM place_photos pp
),
checklist_totals AS (
  SELECT
    items.cleaning_inspection_id,
    COUNT(*) AS checklist_items_count,
    COUNT(*) FILTER (WHERE items.area = 'BATHROOM') AS bathroom_items_count,
    COUNT(*) FILTER (WHERE items.area = 'KITCHEN') AS kitchen_items_count,
    COUNT(*) FILTER (WHERE items.area = 'BEDROOM') AS bedroom_items_count,
    COUNT(*) FILTER (WHERE items.area = 'COMMON_AREA') AS common_area_items_count,
    COUNT(*) FILTER (WHERE items.area = 'CONTACT_SURFACES') AS contact_surfaces_items_count,
    COUNT(*) FILTER (WHERE items.area = 'LINENS') AS linens_items_count,
    COUNT(*) FILTER (WHERE items.area = 'SUPPLIES') AS supplies_items_count,
    COUNT(*) FILTER (WHERE items.area = 'BASIC_SAFETY') AS basic_safety_items_count,
    COUNT(*) FILTER (WHERE items.is_required) AS required_checklist_items_count,
    COUNT(*) FILTER (
      WHERE items.is_required
        AND items.status IN ('PENDING', 'FAILED', 'ISSUE')
    ) AS incomplete_required_checklist_items_count,
    COUNT(*) FILTER (
      WHERE items.status IN ('FAILED', 'ISSUE')
    ) AS failed_checklist_items_count,
    COUNT(*) FILTER (
      WHERE items.status = 'DONE'
    ) AS completed_checklist_items_count,
    COUNT(*) FILTER (
      WHERE items.is_required
        AND items.status = 'DONE'
    ) AS completed_required_checklist_items_count
  FROM (
    SELECT
      cci.cleaning_inspection_id,
      cci.area,
      cci.is_required,
      cci.status
    FROM cleaning_checklist_items cci
    UNION ALL
    SELECT
      ici.cleaning_inspection_id,
      ici.area,
      ici.is_required,
      ici.status
    FROM inspection_checklist_items ici
  ) items
  GROUP BY items.cleaning_inspection_id
),
evidence_totals AS (
  SELECT
    cip.cleaning_inspection_id,
    COUNT(*) AS total_evidence_count,
    COUNT(*) FILTER (WHERE cip.type = 'BEFORE') AS before_evidence_count,
    COUNT(*) FILTER (WHERE cip.type = 'AFTER') AS after_evidence_count,
    COUNT(*) FILTER (WHERE cip.type = 'INSPECTION') AS inspection_evidence_count,
    COUNT(*) FILTER (WHERE cip.type = 'ISSUE') AS issue_evidence_count,
    COUNT(*) FILTER (WHERE cip.type = 'GENERAL') AS general_evidence_count
  FROM cleaning_inspection_photos cip
  GROUP BY cip.cleaning_inspection_id
)
SELECT
  ci.id AS task_id,
  ci.host_id,
  host_user.name AS host_name,
  ci.place_id,
  p.title AS place_title,
  p.city AS place_city,
  p.status::text AS place_status,
  place_photo.url AS place_photo_url,
  ci.previous_booking_id,
  ci.next_booking_id,
  ci.cleaning_assignee_id,
  COALESCE(cleaning_assignee.name, ci.assignee_name) AS cleaning_assignee_name,
  COALESCE(cleaning_assignee_profile.phone, ci.assignee_contact) AS cleaning_assignee_contact,
  ci.inspection_assignee_id,
  COALESCE(inspection_assignee.name, ci.inspection_assignee_name) AS inspection_assignee_name,
  COALESCE(inspection_assignee_profile.phone, ci.inspection_assignee_contact) AS inspection_assignee_contact,
  CASE
    WHEN ci.overall_status IN ('AWAITING_INSPECTION', 'BLOCKED', 'REJECTED')
      THEN COALESCE(ci.inspection_assignee_id, ci.cleaning_assignee_id)
    ELSE COALESCE(ci.cleaning_assignee_id, ci.inspection_assignee_id)
  END AS current_responsible_id,
  CASE
    WHEN ci.overall_status IN ('AWAITING_INSPECTION', 'BLOCKED', 'REJECTED')
      THEN COALESCE(inspection_assignee.name, ci.inspection_assignee_name, cleaning_assignee.name, ci.assignee_name)
    ELSE COALESCE(cleaning_assignee.name, ci.assignee_name, inspection_assignee.name, ci.inspection_assignee_name)
  END AS current_responsible_name,
  ci.last_checkout,
  ci.next_checkin,
  ci.deadline_at,
  ci.cleaning_started_at,
  ci.cleaning_completed_at,
  ci.inspection_completed_at,
  ci.cleaning_status::text AS cleaning_status,
  CASE ci.cleaning_status
    WHEN 'AWAITING_CLEANING' THEN 'Aguardando limpeza'
    WHEN 'CLEANING_IN_PROGRESS' THEN 'Em limpeza'
    WHEN 'DONE' THEN 'Limpeza concluída'
    WHEN 'OVERDUE' THEN 'Limpeza atrasada'
    WHEN 'NOT_REQUIRED' THEN 'Limpeza não necessária'
    ELSE ci.cleaning_status::text
  END AS cleaning_status_label,
  ci.inspection_status::text AS inspection_status,
  CASE ci.inspection_status
    WHEN 'AWAITING_INSPECTION' THEN 'Aguardando vistoria'
    WHEN 'APPROVED' THEN 'Aprovado'
    WHEN 'REJECTED' THEN 'Reprovado'
    WHEN 'BLOCKED' THEN 'Bloqueado'
    WHEN 'NOT_REQUIRED' THEN 'Vistoria não necessária'
    ELSE ci.inspection_status::text
  END AS inspection_status_label,
  ci.overall_status::text AS overall_status,
  CASE ci.overall_status
    WHEN 'AWAITING_CLEANING' THEN 'Aguardando limpeza'
    WHEN 'CLEANING_IN_PROGRESS' THEN 'Em limpeza'
    WHEN 'AWAITING_INSPECTION' THEN 'Aguardando vistoria'
    WHEN 'APPROVED' THEN 'Aprovado para entrada'
    WHEN 'REJECTED' THEN 'Reprovado'
    WHEN 'BLOCKED' THEN 'Bloqueado'
    WHEN 'OVERDUE' THEN 'Atrasado'
    ELSE ci.overall_status::text
  END AS overall_status_label,
  CASE
    WHEN ci.overall_status = 'APPROVED' THEN 'APPROVED'
    WHEN ci.overall_status = 'REJECTED' THEN 'REJECTED'
    WHEN ci.overall_status = 'BLOCKED' THEN 'BLOCKED'
    WHEN ci.deadline_at IS NOT NULL
      AND ci.deadline_at < CURRENT_TIMESTAMP
      AND ci.overall_status NOT IN ('APPROVED', 'REJECTED', 'BLOCKED')
      THEN 'OVERDUE'
    ELSE ci.overall_status::text
  END AS effective_overall_status,
  CASE
    WHEN ci.overall_status = 'APPROVED' THEN 'Aprovado para entrada'
    WHEN ci.overall_status = 'REJECTED' THEN 'Reprovado'
    WHEN ci.overall_status = 'BLOCKED' THEN 'Bloqueado'
    WHEN ci.deadline_at IS NOT NULL
      AND ci.deadline_at < CURRENT_TIMESTAMP
      AND ci.overall_status NOT IN ('APPROVED', 'REJECTED', 'BLOCKED')
      THEN 'Atrasado'
    WHEN ci.overall_status = 'AWAITING_CLEANING' THEN 'Aguardando limpeza'
    WHEN ci.overall_status = 'CLEANING_IN_PROGRESS' THEN 'Em limpeza'
    WHEN ci.overall_status = 'AWAITING_INSPECTION' THEN 'Aguardando vistoria'
    ELSE ci.overall_status::text
  END AS effective_overall_status_label,
  ci.requires_photo_evidence,
  ci.minimum_required_evidence_count,
  COALESCE(ct.checklist_items_count, 0) AS checklist_items_count,
  COALESCE(ct.required_checklist_items_count, 0) AS required_checklist_items_count,
  COALESCE(ct.completed_checklist_items_count, 0) AS completed_checklist_items_count,
  COALESCE(ct.completed_required_checklist_items_count, 0) AS completed_required_checklist_items_count,
  COALESCE(ct.incomplete_required_checklist_items_count, 0) AS incomplete_required_checklist_items_count,
  COALESCE(ct.failed_checklist_items_count, 0) AS failed_checklist_items_count,
  COALESCE(ct.bathroom_items_count, 0) AS bathroom_items_count,
  COALESCE(ct.kitchen_items_count, 0) AS kitchen_items_count,
  COALESCE(ct.bedroom_items_count, 0) AS bedroom_items_count,
  COALESCE(ct.common_area_items_count, 0) AS common_area_items_count,
  COALESCE(ct.contact_surfaces_items_count, 0) AS contact_surfaces_items_count,
  COALESCE(ct.linens_items_count, 0) AS linens_items_count,
  COALESCE(ct.supplies_items_count, 0) AS supplies_items_count,
  COALESCE(ct.basic_safety_items_count, 0) AS basic_safety_items_count,
  COALESCE(et.total_evidence_count, 0) AS total_evidence_count,
  COALESCE(et.before_evidence_count, 0) AS before_evidence_count,
  COALESCE(et.after_evidence_count, 0) AS after_evidence_count,
  COALESCE(et.inspection_evidence_count, 0) AS inspection_evidence_count,
  COALESCE(et.issue_evidence_count, 0) AS issue_evidence_count,
  COALESCE(et.general_evidence_count, 0) AS general_evidence_count,
  GREATEST(
    ci.minimum_required_evidence_count - COALESCE(et.total_evidence_count, 0),
    0
  ) AS missing_required_evidence_count,
  (COALESCE(ct.incomplete_required_checklist_items_count, 0) = 0) AS is_required_checklist_complete,
  (
    NOT ci.requires_photo_evidence
    OR COALESCE(et.total_evidence_count, 0) >= ci.minimum_required_evidence_count
  ) AS has_minimum_required_evidence,
  (
    ci.cleaning_status IN ('DONE', 'NOT_REQUIRED')
    AND ci.inspection_status = 'AWAITING_INSPECTION'
    AND COALESCE(ct.incomplete_required_checklist_items_count, 0) = 0
    AND (
      NOT ci.requires_photo_evidence
      OR COALESCE(et.total_evidence_count, 0) >= ci.minimum_required_evidence_count
    )
  ) AS is_ready_for_approval,
  (
    ci.next_checkin IS NOT NULL
    AND ci.next_checkin <= CURRENT_TIMESTAMP + INTERVAL '24 hours'
    AND (
      CASE
        WHEN ci.overall_status = 'APPROVED' THEN FALSE
        ELSE TRUE
      END
      OR ci.inspection_status <> 'APPROVED'
      OR COALESCE(ct.incomplete_required_checklist_items_count, 0) > 0
      OR (
        ci.requires_photo_evidence
        AND COALESCE(et.total_evidence_count, 0) < ci.minimum_required_evidence_count
      )
      OR (
        ci.deadline_at IS NOT NULL
        AND ci.deadline_at <= CURRENT_TIMESTAMP + INTERVAL '2 hours'
      )
    )
  ) AS next_checkin_at_risk,
  CASE
    WHEN ci.cleaning_completed_at IS NOT NULL
      AND COALESCE(ci.cleaning_started_at, ci.last_checkout) IS NOT NULL
      THEN ROUND(EXTRACT(EPOCH FROM (ci.cleaning_completed_at - COALESCE(ci.cleaning_started_at, ci.last_checkout)))::numeric / 60, 2)
    ELSE NULL
  END AS cleaning_duration_minutes,
  (
    COALESCE(ct.failed_checklist_items_count, 0)
    + COALESCE(et.issue_evidence_count, 0)
    + CASE WHEN ci.overall_status = 'BLOCKED' THEN 1 ELSE 0 END
    + CASE WHEN ci.overall_status = 'REJECTED' THEN 1 ELSE 0 END
    + CASE
        WHEN ci.deadline_at IS NOT NULL
          AND ci.deadline_at < CURRENT_TIMESTAMP
          AND ci.overall_status NOT IN ('APPROVED', 'REJECTED', 'BLOCKED')
          THEN 1
        ELSE 0
      END
  ) AS problem_score,
  ci.notes,
  ci.created_at,
  ci.updated_at
FROM cleaning_inspections ci
JOIN users host_user
  ON host_user.id = ci.host_id
JOIN places p
  ON p.id = ci.place_id
LEFT JOIN first_place_photo place_photo
  ON place_photo.place_id = p.id
 AND place_photo.rn = 1
LEFT JOIN users cleaning_assignee
  ON cleaning_assignee.id = ci.cleaning_assignee_id
LEFT JOIN user_profiles cleaning_assignee_profile
  ON cleaning_assignee_profile.user_id = cleaning_assignee.id
LEFT JOIN users inspection_assignee
  ON inspection_assignee.id = ci.inspection_assignee_id
LEFT JOIN user_profiles inspection_assignee_profile
  ON inspection_assignee_profile.user_id = inspection_assignee.id
LEFT JOIN checklist_totals ct
  ON ct.cleaning_inspection_id = ci.id
LEFT JOIN evidence_totals et
  ON et.cleaning_inspection_id = ci.id;
