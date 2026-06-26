import cors from 'cors';
import express from 'express';
import { handleFormRequest } from './form-request.mjs';
import { loadEnvFiles } from './load-env.mjs';

loadEnvFiles();

const app = express();
const port = Number(process.env.PORT) || 1337;

const corsOrigins = (process.env.CORS_ORIGINS || 'https://molodost.club,https://www.molodost.club,http://localhost:3000')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));
app.use(
	cors({
		origin(origin, callback) {
			if (!origin || corsOrigins.includes(origin)) {
				callback(null, true);
				return;
			}
			callback(new Error('Not allowed by CORS'));
		},
	}),
);

function getClientIp(req) {
	const forwarded = req.headers['x-forwarded-for'];
	if (typeof forwarded === 'string' && forwarded.trim()) {
		return forwarded.split(',')[0].trim();
	}
	return req.socket.remoteAddress || 'unknown';
}

function healthHandler(_req, res) {
	res.set('Cache-Control', 'no-store');
	res.json({
		status: 'ok',
		service: 'molodost-api',
		uptime: Math.round(process.uptime()),
		timestamp: new Date().toISOString(),
	});
}

for (const path of ['/_health', '/health', '/healthz']) {
	app.get(path, healthHandler);
}

async function formHandler(req, res) {
	try {
		const result = await handleFormRequest(req.body || {}, getClientIp(req));
		return res.status(result.status).json(result.body);
	} catch (error) {
		console.error('Form request handler error', error);
		return res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
	}
}

app.post('/api/form-requests', formHandler);
app.post('/api/form-request', formHandler);

app.use((_req, res) => {
	res.status(404).json({ ok: false, error: 'NOT_FOUND' });
});

app.listen(port, '0.0.0.0', () => {
	console.log(`molodost-api listening on :${port}`);
});
