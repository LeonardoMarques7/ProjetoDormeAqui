/**
 * Mock Notifications Server
 *
 * Servidor mock para desenvolvimento local sem backend.
 * Roda na porta 3001 e serve rotas de notificações.
 *
 * Uso:
 *   node mock-notifications-server.mjs
 *
 * Atualize o vite.config.ts para apontar o proxy /api/notifications para
 * http://localhost:3001 durante o desenvolvimento, ou aponte o proxy /api
 * para este servidor se o backend real não estiver disponível.
 */

import http from "http";

const PORT = 3001;

const notifications = [
	{
		_id: "1",
		type: "success",
		title: "Reserva confirmada",
		message: "Sua reserva no Chalé da Montanha foi confirmada para 15/08.",
		read: false,
		createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
		link: "/account/bookings",
	},
	{
		_id: "2",
		type: "info",
		title: "Nova avaliação recebida",
		message: "João deixou uma avaliação 5 estrelas na sua acomodação.",
		read: false,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
		link: "/account/places",
	},
	{
		_id: "3",
		type: "warning",
		title: "Pagamento pendente",
		message: "Sua reserva aguarda confirmação de pagamento.",
		read: true,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
		link: "/account/bookings",
	},
	{
		_id: "4",
		type: "info",
		title: "Bem-vindo ao DormeAqui!",
		message: "Explore acomodações incríveis e faça sua primeira reserva.",
		read: true,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
		link: "/",
	},
	{
		_id: "5",
		type: "error",
		title: "Pagamento recusado",
		message: "O pagamento da reserva #5678 foi recusado. Verifique seu cartão.",
		read: true,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
		link: "/account/bookings",
	},
];

function sendJson(res, statusCode, data) {
	const body = JSON.stringify(data);
	res.writeHead(statusCode, {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
	});
	res.end(body);
}

const server = http.createServer((req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);
	const method = req.method.toUpperCase();

	if (method === "OPTIONS") {
		res.writeHead(204, {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		});
		res.end();
		return;
	}

	// GET /api/notifications?page=1&limit=10
	if (method === "GET" && url.pathname === "/api/notifications") {
		const page = parseInt(url.searchParams.get("page") ?? "1", 10);
		const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
		const start = (page - 1) * limit;
		const slice = notifications.slice(start, start + limit);
		sendJson(res, 200, {
			notifications: slice,
			total: notifications.length,
			page,
		});
		return;
	}

	// PATCH /api/notifications/:id/read
	if (method === "PATCH" && url.pathname.match(/^\/api\/notifications\/[^/]+\/read$/)) {
		const id = url.pathname.split("/")[3];
		const n = notifications.find((x) => x._id === id);
		if (n) n.read = true;
		sendJson(res, 200, { success: true });
		return;
	}

	// PATCH /api/notifications/read-all
	if (method === "PATCH" && url.pathname === "/api/notifications/read-all") {
		notifications.forEach((n) => {
			n.read = true;
		});
		sendJson(res, 200, { success: true });
		return;
	}

	// DELETE /api/notifications/:id
	if (method === "DELETE" && url.pathname.match(/^\/api\/notifications\/[^/]+$/)) {
		const id = url.pathname.split("/")[3];
		const idx = notifications.findIndex((x) => x._id === id);
		if (idx !== -1) notifications.splice(idx, 1);
		sendJson(res, 200, { success: true });
		return;
	}

	// DELETE /api/notifications (clear all)
	if (method === "DELETE" && url.pathname === "/api/notifications") {
		notifications.splice(0, notifications.length);
		sendJson(res, 200, { success: true });
		return;
	}

	sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
	console.log(`✅  Mock Notifications Server running at http://localhost:${PORT}`);
	console.log(
		`   Proxy /api/notifications requests from Vite to this server for local dev.`,
	);
});
