import nodemailer from "nodemailer";
import { factories } from "@strapi/strapi";
import axios from "axios";
import crypto from "crypto";

// КРИТИЧНО: Создаем transporter один раз и переиспользуем
// Создание нового transporter на каждый запрос вызывает утечки соединений и проблемы с производительностью
let emailTransporter: nodemailer.Transporter | null = null;
const user = "clubmolodost@yandex.ru";
const pass = "agdcxvvflashcvxl";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestRateLimit = new Map<string, { count: number; resetAt: number }>();

function getClientIp(ctx: any): string {
  const xForwardedFor = ctx.request.header["x-forwarded-for"];
  if (typeof xForwardedFor === "string" && xForwardedFor.trim()) {
    return xForwardedFor.split(",")[0].trim();
  }
  return ctx.request.ip || "unknown";
}

function sanitizeForHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanupRateLimitStore(now: number) {
  for (const [key, state] of requestRateLimit.entries()) {
    if (state.resetAt <= now) {
      requestRateLimit.delete(key);
    }
  }
}

function isRateLimited(ip: string, now: number): boolean {
  cleanupRateLimitStore(now);
  const key = crypto.createHash("sha256").update(ip).digest("hex");
  const state = requestRateLimit.get(key);

  if (!state || state.resetAt <= now) {
    requestRateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (state.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  state.count += 1;
  return false;
}
function getEmailTransporter(): nodemailer.Transporter {
  if (!emailTransporter) {
    emailTransporter = nodemailer.createTransport({
      host: "smtp.yandex.ru",
      port: 465,
      secure: true,
      auth: { 
        user: user, 
        pass: pass
      },
      // Оптимизация: переиспользование соединений
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }
  return emailTransporter;
}

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  phoneNumber = phoneNumber.replace(/\D/g, "");
  const data = {
    to: `${phoneNumber}@s.whatsapp.net`,
    quoted: "JsgMVO-Ev7kfDe5am-tC6uxJxS",
    ephemeral: 604800,
    edit: "dBZLmDdvybylKJXzl8D-X.kmraOBoH",
    body: message,
    typing_time: 5,
    no_link_preview: true,
    mentions: ["79647002112@s.whatsapp.net"],
    view_once: false,
  };

  try {
    const response = await axios.post(
      "https://gate.whapi.cloud/messages/text",
      data,
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: "Bearer NO21Ujp3KxUexdDXtpoelCwgf70GoLi7",
        },
        // Оптимизация: таймаут для предотвращения зависаний
        timeout: 10000,
      }
    );

    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}


export default factories.createCoreController(
  "api::form-request.form-request",
  ({ strapi }) => ({
    async create(ctx) {
      const body = ctx.request.body || {};
      const now = Date.now();
      const clientIp = getClientIp(ctx);

      if (isRateLimited(clientIp, now)) {
        ctx.status = 429;
        ctx.body = { ok: false, error: "RATE_LIMIT_EXCEEDED" };
        return;
      }

      const hasPromo =
        typeof body.checkAmount !== "undefined" &&
        String(body.checkAmount).trim() !== "";

      if (hasPromo) {
        const pName = String(body.name || "").trim().slice(0, 100);
        const pSurname = String(body.surname || "").trim().slice(0, 100);
        const pWhatsapp = String(body.whatsapp || "").trim().slice(0, 30);
        const pEmail = String(body.email || "").trim().slice(0, 150);

        const message =
          "Спасибо, что заполнили анкету!\nВ течение 24 часов мы вышлем вам билет в «Молодость» на Алтае.";
        try {
          if (pWhatsapp) await sendWhatsAppMessage(pWhatsapp, message);
        } catch (e) {
          strapi.log.warn("WhatsApp send failed");
        }

        // Используем переиспользуемый transporter вместо создания нового на каждый запрос
        const transporter = getEmailTransporter();

        const html = `
      <h1>Заявка (ПРОМО)</h1>
      <br>
      <h3>Данные пользователя:</h3>
      <h4>Имя: ${pName || "не указано"}</h4>
      <h4>Фамилия: ${pSurname || "не указано"}</h4>
      <h4>Телефон: ${pWhatsapp || "не указан"}</h4>
    `;

        try {
          await transporter.sendMail({
            from: "clubmolodost@yandex.ru",
            to: "reservation@clubmolodost.ru",
            subject: "Заявка: ПРОМО (без вложения)",
            html,
          });
        } catch (err) {
          strapi.log.error("Письмо по ПРОМО не отправилось", err);
          ctx.status = 500;
          ctx.body = { ok: false, error: "MAIL_SEND_FAILED" };
          return;
        }

        ctx.status = 200;
        ctx.body = {
          ok: true,
          isPromo: true,
          name: pName,
          surname: pSurname,
          whatsapp: pWhatsapp,
          email: pEmail,
        };
        return;
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
      } = body;

      const safeName = sanitizeForHtml(String(name || "").trim().slice(0, 100));
      const safeSurname = sanitizeForHtml(String(surname || "").trim().slice(0, 100));
      const safeSource = sanitizeForHtml(String(source || "").trim().slice(0, 200));
      const safeWhatsapp = sanitizeForHtml(String(whatsapp || "").trim().slice(0, 30));
      const safeEmail = sanitizeForHtml(String(email || "").trim().slice(0, 150));

      try {
        const message = `Спасибо за ответы!\n\n${safeName}, мы свяжемся с вами в течение 24 часов, чтобы мы смогли ответить на все оставшиеся вопросы ваши к нам и наши к вам.`;
        if (whatsapp) await sendWhatsAppMessage(whatsapp, message);
      } catch (e) {
        strapi.log.warn("WhatsApp send failed");
      }

      // Используем переиспользуемый transporter вместо создания нового на каждый запрос
      const transporter = getEmailTransporter();

      try {
        await transporter.sendMail({
          from: user,
          to: "reservation@clubmolodost.ru",
          subject: "Заявка с сайта molodost.club",
          html: `
        <h1>Заявка с сайта molodost.club</h1>
        <br>
        <h3>Информация по заявке:</h3><br>
        <h4>Имя: ${safeName || "не указано"}</h4><br>
        <h4>Фамилия: ${safeSurname || "не указано"}</h4><br>
        <h4>Кто рекомендовал: ${safeSource || "не указано"}</h4><br>
        <h4>What'sApp: ${safeWhatsapp || "не указан"}</h4><br>
        <h4>E-mail: ${safeEmail || "не указан"}</h4><br>
        <h4>Сколько раз у нас уже были: ${howManyTimes || "не указано"}</h4><br>
        <h4>Взрослых: ${adults || "не указано"}</h4><br>
        <h4>Детей: ${children || "не указано"}</h4><br>
        <h4>Возраст 1 ребенка: ${childrenAge1 || "не указано"}</h4><br>
        <h4>Возраст 2 ребенка: ${childrenAge2 || "не указано"}</h4><br>
        <h4>Возраст 3 ребенка: ${childrenAge3 || "не указано"}</h4><br>
        <h4>Возраст 4 ребенка: ${childrenAge4 || "не указано"}</h4><br>
        <h4>Когда хотят приехать: ${date || "не указано"}</h4><br>
        <h4>Даты точные или примерные: ${dateAccuracy || "не указано"}</h4><br>
        <h4>На сколько дней: ${nights || "не указано"}</h4><br>
        <h4>Варианты проживания на 1-3 человек: ${
          apartments || "не указано"
        }</h4><br>
        <h4>Для больших семей: ${apartments2 || "не указано"}</h4><br>
        <h4>Питание на базе: ${howToFood || "не указано"}</h4><br>
        <h4>Аллергия или спец. пожелания: ${allergy || "не указано"}</h4><br>
        <h4>Хотели бы попробовать: ${wantTry || "не указано"}</h4><br>
        <h4>Что то особое из алкоголя: ${alko || "не указано"}</h4><br>
        <h4>Пожелания к кофе: ${coffee || "не указано"}</h4><br>
        <h4>Хотели бы во время отдыха: ${restTime || "не указано"}</h4><br>
        <h4>Хотели бы в Благодати: ${blagodat || "не указано"}</h4><br>
        <h4>Будет ли спонсором: ${sponsor || "не указано"}</h4><br>
        <h4>Какие планы: ${plany || "не указано"}</h4><br>
        <h4>Поедут ли на марс: ${naMars || "не указано"}</h4><br>
        <h4>Что хочется во время поездок: ${
          travelPriority || "не указано"
        }</h4><br>
        <h4>Пакет black khan пожелания: ${wishes || "не указано"}</h4><br>
        <h4>Для детей: ${forChildren || "не указано"}</h4><br>
        <h4>Хочу на степник: ${stepnik || "не указано"}</h4><br>
        <h4>Хочу провести больше времени на базе: ${
          neEzdit || "не указано"
        }</h4><br>
        <h4>Нужна ли няня: ${nanny || "не указано"}</h4><br>
        <h4>Встретить в бизнес-зале аэропорта: ${
          airport || "не указано"
        }</h4><br>
        <h4>Льготное проживание: ${specOrder || "не указано"}</h4><br>
        <h4>Тип отдыха: ${relaxTypes || "не указан"}</h4><br>
      `,
        });
      } catch (err) {
        strapi.log.error("Письмо админу не отправилось.", err);
        ctx.status = 500;
        ctx.body = { ok: false, error: "MAIL_SEND_FAILED" };
        return;
      }

      try {
        if (email) {
          await transporter.sendMail({
            from: user,
            to: email,
            subject:
              "Ваше бронирование на сайте molodost.club почти подтверждено",
            html: `<html>... ваш текущий большой HTML ...</html>`,
          });
        }
      } catch (err) {
        strapi.log.error("Письмо пользователю не отправилось", err);
      }

      ctx.status = 200;
      ctx.body = {
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
      };
    },
  })
);
