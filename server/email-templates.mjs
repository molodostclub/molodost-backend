import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const templatePath = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	'user-confirmation-email.html.tpl',
);

let cachedTemplate;

function loadTemplate() {
	if (!cachedTemplate) {
		cachedTemplate = fs.readFileSync(templatePath, 'utf8');
	}
	return cachedTemplate;
}

/** Branded confirmation email (legacy Strapi layout). */
export function buildUserConfirmationEmail(name, sanitizeForHtml) {
	const safeName = sanitizeForHtml(String(name || '').trim().slice(0, 100)) || 'друг';
	return loadTemplate().replace(/\$\{name\}/g, safeName);
}
