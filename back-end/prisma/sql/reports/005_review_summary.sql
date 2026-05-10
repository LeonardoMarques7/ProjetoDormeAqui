-- Resumo de avaliacoes por acomodacao.

SELECT
  p.owner_id AS host_id,
  u.name AS host_name,
  p.id AS place_id,
  p.title AS place_title,
  p.city,
  COUNT(r.id) AS reviews_count,
  ROUND(AVG(r.rating)::numeric, 2) AS average_rating,
  COUNT(*) FILTER (WHERE r.rating = 5) AS rating_5_count,
  COUNT(*) FILTER (WHERE r.rating = 4) AS rating_4_count,
  COUNT(*) FILTER (WHERE r.rating = 3) AS rating_3_count,
  COUNT(*) FILTER (WHERE r.rating = 2) AS rating_2_count,
  COUNT(*) FILTER (WHERE r.rating = 1) AS rating_1_count,
  MIN(r.created_at) AS first_review_at,
  MAX(r.created_at) AS last_review_at
FROM places p
JOIN users u ON u.id = p.owner_id
LEFT JOIN reviews r ON r.place_id = p.id
GROUP BY p.owner_id, u.name, p.id, p.title, p.city
ORDER BY average_rating DESC NULLS LAST, reviews_count DESC, place_title;
