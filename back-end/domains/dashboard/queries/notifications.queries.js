import { Prisma } from "@prisma/client";

export const getUnreadMessageCountQuery = ({ hostId }) => Prisma.sql`
  SELECT COUNT(*)::int AS unread_message_count
  FROM notifications
  WHERE user_id = ${hostId}
    AND type = 'message_received'
    AND read = false
    AND dismissed = false;
`;

