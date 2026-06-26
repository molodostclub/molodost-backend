import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseEnvLine(line) {
	const trimmed = line.trim();
	if (!trimmed || trimmed.startsWith('#')) return null;

	const eq = trimmed.indexOf('=');
	if (eq === -1) return null;

	const key = trimmed.slice(0, eq).trim();
	let value = trimmed.slice(eq + 1).trim();

	if (
		(value.startsWith('"') && value.endsWith('"')) ||
		(value.startsWith("'") && value.endsWith("'"))
	) {
		value = value.slice(1, -1);
	}

	return { key, value };
}

export function loadEnvFiles() {
	for (const name of ['.env.local', '.env']) {
		const filePath = path.join(projectRoot, name);
		if (!fs.existsSync(filePath)) continue;

		const content = fs.readFileSync(filePath, 'utf8');
		for (const line of content.split(/\r?\n/)) {
			const parsed = parseEnvLine(line);
			if (!parsed || process.env[parsed.key] !== undefined) continue;
			process.env[parsed.key] = parsed.value;
		}
	}
}
