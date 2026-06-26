import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { buildUserConfirmationEmail } from './email-templates.mjs';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestRateLimit = new Map();

let emailTransporter = null;

function sanitizeForHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function cleanupRateLimitStore(now) {
	for (const [key, state] of requestRateLimit.entries()) {
		if (state.resetAt <= now) requestRateLimit.delete(key);
	}
}

function isRateLimited(ip, now) {
	cleanupRateLimitStore(now);
	const key = crypto.createHash('sha256').update(ip).digest('hex');
	const state = requestRateLimit.get(key);

	if (!state || state.resetAt <= now) {
		requestRateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return false;
	}

	if (state.count >= RATE_LIMIT_MAX_REQUESTS) return true;
	state.count += 1;
	return false;
}

function getEmailTransporter() {
	if (!emailTransporter) {
		const user = process.env.SMTP_USER;
		const pass = process.env.SMTP_PASS;
		const host = process.env.SMTP_HOST || 'smtp.yandex.ru';

		if (!user || !pass) {
			throw new Error('SMTP credentials are not configured');
		}

		emailTransporter = nodemailer.createTransport({
			host,
			port: 465,
			secure: true,
			auth: { user, pass },
			pool: true,
			maxConnections: 5,
			maxMessages: 100,
		});
	}
	return emailTransporter;
}

async function sendWhatsAppMessage(phoneNumber, message) {
	const token = process.env.WHAPI_TOKEN;
	if (!token) return;

	const normalized = String(phoneNumber).replace(/\D/g, '');
	if (!normalized) return;

	try {
		await fetch('https://gate.whapi.cloud/messages/text', {
			method: 'POST',
			headers: {
				accept: 'application/json',
				'content-type': 'application/json',
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				to: `${normalized}@s.whatsapp.net`,
				quoted: 'JsgMVO-Ev7kfDe5am-tC6uxJxS',
				ephemeral: 604800,
				edit: 'dBZLmDdvybylKJXzl8D-X.kmraOBoH',
				body: message,
				typing_time: 5,
				no_link_preview: true,
				mentions: ['79647002112@s.whatsapp.net'],
				view_once: false,
			}),
			signal: AbortSignal.timeout(10_000),
		});
	} catch (error) {
		console.error('WhatsApp send failed', error);
	}
}

function field(label, value) {
	return `<h4>${label}: ${sanitizeForHtml(value ?? 'не указано')}</h4><br>`;
}

export async function handleFormRequest(body, clientIp) {
	const now = Date.now();
	if (isRateLimited(clientIp, now)) {
		return { status: 429, body: { ok: false, error: 'RATE_LIMIT_EXCEEDED' } };
	}

	const smtpFrom = process.env.SMTP_USER;
	const smtpTo = process.env.SMTP_TO || 'reservation@clubmolodost.ru';

	if (!smtpFrom) {
		return { status: 500, body: { ok: false, error: 'SMTP_NOT_CONFIGURED' } };
	}

	const hasPromo =
		typeof body.checkAmount !== 'undefined' && String(body.checkAmount).trim() !== '';

	if (hasPromo) {
		const pName = String(body.name || '').trim().slice(0, 100);
		const pSurname = String(body.surname || '').trim().slice(0, 100);
		const pWhatsapp = String(body.whatsapp || '').trim().slice(0, 30);
		const pEmail = String(body.email || '').trim().slice(0, 150);

		if (pWhatsapp) {
			await sendWhatsAppMessage(
				pWhatsapp,
				'Спасибо, что заполнили анкету!\nВ течение 24 часов мы вышлем вам билет в «Молодость» на Алтае.',
			);
		}

		try {
			await getEmailTransporter().sendMail({
				from: smtpFrom,
				to: smtpTo,
				subject: 'Заявка: ПРОМО (без вложения)',
				html: `
          <h1>Заявка (ПРОМО)</h1>
          <br>
          <h3>Данные пользователя:</h3>
          <h4>Имя: ${sanitizeForHtml(pName) || 'не указано'}</h4>
          <h4>Фамилия: ${sanitizeForHtml(pSurname) || 'не указано'}</h4>
          <h4>Телефон: ${sanitizeForHtml(pWhatsapp) || 'не указан'}</h4>
        `,
			});
		} catch (err) {
			console.error('Promo mail failed', err);
			return { status: 500, body: { ok: false, error: 'MAIL_SEND_FAILED' } };
		}

		return {
			status: 200,
			body: { ok: true, isPromo: true, name: pName, surname: pSurname, whatsapp: pWhatsapp, email: pEmail },
		};
	}

	const {
		name,
		surname,
		source,
		howManyTimes,
		date,
		nights,
		dateAccuracy,
		adults,
		children,
		childrenAge1,
		childrenAge2,
		childrenAge3,
		childrenAge4,
		nanny,
		apartments,
		apartments2,
		howToFood,
		coffee,
		alko,
		travelPriority,
		allergy,
		whatsapp,
		email,
		airport,
		plany,
		naMars,
		neEzdit,
		wishes,
		wantTry,
		restTime,
		blagodat,
		sponsor,
		forChildren,
		stepnik,
		specOrder,
		relaxTypes,
		phone,
	} = body;

	const contactPhone = whatsapp || phone;
	const safeName = sanitizeForHtml(String(name || '').trim().slice(0, 100));
	const safeSurname = sanitizeForHtml(String(surname || '').trim().slice(0, 100));
	const safeSource = sanitizeForHtml(String(source || '').trim().slice(0, 200));
	const safeWhatsapp = sanitizeForHtml(String(contactPhone || '').trim().slice(0, 30));
	const safeEmail = sanitizeForHtml(String(email || '').trim().slice(0, 150));

	if (contactPhone) {
		await sendWhatsAppMessage(
			String(contactPhone),
			`Спасибо за ответы!\n\n${safeName}, мы свяжемся с вами в течение 24 часов, чтобы мы смогли ответить на все оставшиеся вопросы ваши к нам и наши к вам.`,
		);
	}

	const transporter = getEmailTransporter();

	try {
		await transporter.sendMail({
			from: smtpFrom,
			to: smtpTo,
			subject: 'Заявка с сайта molodost.club',
			html: `
        <h1>Заявка с сайта molodost.club</h1>
        <br>
        <h3>Информация по заявке:</h3><br>
        ${field('Имя', safeName || 'не указано')}
        ${field('Фамилия', safeSurname || 'не указано')}
        ${field('Кто рекомендовал', safeSource || 'не указано')}
        ${field("What'sApp", safeWhatsapp || 'не указан')}
        ${field('E-mail', safeEmail || 'не указан')}
        ${field('Сколько раз у нас уже были', howManyTimes)}
        ${field('Взрослых', adults)}
        ${field('Детей', children)}
        ${field('Возраст 1 ребенка', childrenAge1)}
        ${field('Возраст 2 ребенка', childrenAge2)}
        ${field('Возраст 3 ребенка', childrenAge3)}
        ${field('Возраст 4 ребенка', childrenAge4)}
        ${field('Когда хотят приехать', date)}
        ${field('Даты точные или примерные', dateAccuracy)}
        ${field('На сколько дней', nights)}
        ${field('Варианты проживания на 1-3 человек', apartments)}
        ${field('Для больших семей', apartments2)}
        ${field('Питание на базе', howToFood)}
        ${field('Аллергия или спец. пожелания', allergy)}
        ${field('Хотели бы попробовать', wantTry)}
        ${field('Что то особое из алкоголя', alko)}
        ${field('Пожелания к кофе', coffee)}
        ${field('Хотели бы во время отдыха', restTime)}
        ${field('Хотели бы в Благодати', blagodat)}
        ${field('Будет ли спонсором', sponsor)}
        ${field('Какие планы', plany)}
        ${field('Поедут ли на марс', naMars)}
        ${field('Что хочется во время поездок', travelPriority)}
        ${field('Пакет black khan пожелания', wishes)}
        ${field('Для детей', forChildren)}
        ${field('Хочу на степник', stepnik)}
        ${field('Хочу провести больше времени на базе', neEzdit)}
        ${field('Нужна ли няня', nanny)}
        ${field('Встретить в бизнес-зале аэропорта', airport)}
        ${field('Льготное проживание', specOrder)}
        ${field('Тип отдыха', relaxTypes)}
      `,
		});
	} catch (err) {
		console.error('Admin mail failed', err);
		return { status: 500, body: { ok: false, error: 'MAIL_SEND_FAILED' } };
	}

	if (email) {
		try {
			await transporter.sendMail({
				from: smtpFrom,
				to: String(email),
				subject: 'Ваше бронирование на сайте molodost.club почти подтверждено',
				html: buildUserConfirmationEmail(name, sanitizeForHtml),
			});
		} catch (err) {
			console.error('User mail failed', err);
		}
	}

	return {
		status: 200,
		body: {
			ok: true,
			name,
			surname,
			source,
			howManyTimes,
			date,
			nights,
			dateAccuracy,
			adults,
			children,
			childrenAge1,
			childrenAge2,
			childrenAge3,
			childrenAge4,
			nanny,
			apartments,
			apartments2,
			howToFood,
			coffee,
			alko,
			travelPriority,
			allergy,
			whatsapp: contactPhone,
			email,
			airport,
			plany,
			naMars,
			neEzdit,
			wishes,
			wantTry,
			restTime,
			blagodat,
			sponsor,
			forChildren,
			stepnik,
			specOrder,
			relaxTypes,
		},
	};
}
