import { Prisma } from "@prisma/client";

export const getReviewSummaryByPropertyQuery = ({ hostId }) => Prisma.sql`
  SELECT
    p.id AS place_id,
    COUNT(r.id)::int AS review_count,
    AVG(r.rating)::numeric AS average_review_rating
  FROM places p
  LEFT JOIN reviews r ON r.place_id = p.id
  WHERE p.owner_id = ${hostId}
  GROUP BY p.id
  ORDER BY p.id;
`;

export const getHostReviewSummaryQuery = ({ hostId }) => Prisma.sql`
  SELECT
    COUNT(r.id)::int AS review_count,
    AVG(r.rating)::numeric AS average_review_rating
  FROM places p
  LEFT JOIN reviews r ON r.place_id = p.id
  WHERE p.owner_id = ${hostId};
`;

