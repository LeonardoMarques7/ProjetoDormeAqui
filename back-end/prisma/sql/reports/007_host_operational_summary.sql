-- Resumo operacional por anfitriao.

SELECT
  u.id AS host_id,
  u.name AS host_name,
  COUNT(DISTINCT p.id) AS places_count,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'ACTIVE') AS active_places_count,
  COUNT(DISTINCT b.id) AS bookings_count,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')) AS active_or_completed_bookings_count,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status IN ('CANCELLED', 'REJECTED', 'ARCHIVED')) AS inactive_bookings_count,
  COALESCE(SUM(b.nights) FILTER (WHERE b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')), 0) AS booked_nights,
  COALESCE(SUM(b.total_price) FILTER (WHERE b.status IN ('CONFIRMED', 'IN_PROGRESS', 'EVALUATION', 'REVIEW', 'COMPLETED')), 0) AS booking_gross_revenue,
  COUNT(DISTINCT r.id) AS reviews_count,
  ROUND(AVG(r.rating)::numeric, 2) AS average_rating
FROM users u
JOIN places p ON p.owner_id = u.id
LEFT JOIN bookings b ON b.place_id = p.id
LEFT JOIN reviews r ON r.place_id = p.id
GROUP BY u.id, u.name
ORDER BY booking_gross_revenue DESC, host_name;
