import crypto from "crypto";
import { getPrismaClient } from "../../config/prisma.js";

const prisma = getPrismaClient();

let ensured = false;

async function ensureFailedPaymentsTable() {
  if (ensured) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS failed_payments (
      id text PRIMARY KEY,
      provider text NOT NULL,
      payment_id text NOT NULL UNIQUE,
      status text,
      status_detail text,
      reason text,
      metadata jsonb,
      payment_info jsonb,
      retry_count integer NOT NULL DEFAULT 0,
      last_retry_at timestamptz,
      received_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  ensured = true;
}

function mapRow(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    provider: row.provider,
    paymentId: row.payment_id,
    status: row.status,
    status_detail: row.status_detail,
    reason: row.reason,
    metadata: row.metadata || {},
    paymentInfo: row.payment_info || {},
    retryCount: row.retry_count || 0,
    lastRetryAt: row.last_retry_at,
    receivedAt: row.received_at,
  };
}

export async function saveFailedPayment({
  provider,
  paymentId,
  status,
  statusDetail = null,
  reason = null,
  metadata = {},
  paymentInfo = {},
}) {
  await ensureFailedPaymentsTable();

  const id = crypto.randomUUID();
  await prisma.$executeRaw`
    INSERT INTO failed_payments (
      id,
      provider,
      payment_id,
      status,
      status_detail,
      reason,
      metadata,
      payment_info
    )
    VALUES (
      ${id},
      ${provider},
      ${String(paymentId)},
      ${status},
      ${statusDetail},
      ${reason},
      ${metadata},
      ${paymentInfo}
    )
    ON CONFLICT (payment_id)
    DO UPDATE SET
      provider = EXCLUDED.provider,
      status = EXCLUDED.status,
      status_detail = EXCLUDED.status_detail,
      reason = EXCLUDED.reason,
      metadata = EXCLUDED.metadata,
      payment_info = EXCLUDED.payment_info,
      received_at = now()
  `;

  return getFailedPaymentByPaymentId(paymentId);
}

export async function listFailedPayments({ page = 0, limit = 50 } = {}) {
  await ensureFailedPaymentsTable();
  const safePage = Math.max(0, Number(page) || 0);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const offset = safePage * safeLimit;

  const rows = await prisma.$queryRaw`
    SELECT *
    FROM failed_payments
    ORDER BY received_at DESC
    OFFSET ${offset}
    LIMIT ${safeLimit}
  `;

  return rows.map(mapRow);
}

export async function getFailedPaymentByPaymentId(paymentId) {
  await ensureFailedPaymentsTable();
  const rows = await prisma.$queryRaw`
    SELECT *
    FROM failed_payments
    WHERE payment_id = ${String(paymentId)}
    LIMIT 1
  `;

  return mapRow(rows[0]);
}

export async function registerFailedPaymentRetry(paymentId) {
  await ensureFailedPaymentsTable();
  await prisma.$executeRaw`
    UPDATE failed_payments
    SET retry_count = retry_count + 1,
        last_retry_at = now()
    WHERE payment_id = ${String(paymentId)}
  `;
}
