-- Metricas operacionais consolidadas por anfitriao para limpeza e vistoria.

CREATE OR REPLACE VIEW v_host_cleaning_inspection_metrics AS
SELECT
  t.host_id,
  t.host_name,
  COUNT(*) AS tasks_count,
  COUNT(*) FILTER (
    WHERE t.effective_overall_status IN (
      'AWAITING_CLEANING',
      'CLEANING_IN_PROGRESS',
      'AWAITING_INSPECTION',
      'REJECTED',
      'BLOCKED',
      'OVERDUE'
    )
  ) AS pending_tasks_count,
  COUNT(*) FILTER (
    WHERE t.cleaning_status = 'CLEANING_IN_PROGRESS'
       OR t.effective_overall_status = 'CLEANING_IN_PROGRESS'
  ) AS tasks_in_cleaning_count,
  COUNT(*) FILTER (
    WHERE t.effective_overall_status = 'AWAITING_INSPECTION'
  ) AS tasks_awaiting_inspection_count,
  COUNT(*) FILTER (
    WHERE t.effective_overall_status = 'APPROVED'
  ) AS tasks_approved_count,
  COUNT(*) FILTER (
    WHERE t.effective_overall_status = 'BLOCKED'
  ) AS tasks_blocked_count,
  COUNT(*) FILTER (
    WHERE t.effective_overall_status = 'REJECTED'
  ) AS tasks_rejected_count,
  COUNT(*) FILTER (
    WHERE t.effective_overall_status = 'OVERDUE'
  ) AS tasks_overdue_count,
  COUNT(*) FILTER (
    WHERE t.next_checkin_at_risk
  ) AS tasks_next_checkin_at_risk_count,
  ROUND(AVG(t.cleaning_duration_minutes), 2) AS average_cleaning_duration_minutes,
  ROUND(
    (
      COUNT(*) FILTER (WHERE t.inspection_status = 'APPROVED')::numeric
      / NULLIF(
        COUNT(*) FILTER (
          WHERE t.inspection_status IN ('APPROVED', 'REJECTED', 'BLOCKED')
        )::numeric,
        0
      )
    ) * 100,
    2
  ) AS inspection_approval_rate,
  COUNT(*) FILTER (
    WHERE t.incomplete_required_checklist_items_count > 0
  ) AS tasks_with_incomplete_checklist_count,
  COALESCE(SUM(t.incomplete_required_checklist_items_count), 0) AS incomplete_checklist_items_count,
  COUNT(*) FILTER (
    WHERE t.requires_photo_evidence
      AND t.total_evidence_count = 0
  ) AS tasks_without_evidence_count,
  COALESCE(SUM(t.problem_score), 0) AS recurring_problem_events_count
FROM v_cleaning_inspection_task_health t
GROUP BY t.host_id, t.host_name;
