import nodemailer from "nodemailer";
import { factories } from "@strapi/strapi";
import axios from "axios";

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
      const files =
        (ctx.request.files as any) || (ctx.request as any)?.files || null;
      let file: any = null;
      if (files) {
        const cand =
          (files as any).attachment ||
          (files as any).file ||
          (files as any).upload;
        file = Array.isArray(cand) ? cand[0] : cand;
      }

      if (file && (file.filepath || file.path || file.buffer)) {
        const pName = body.name || "";
        const pSurname = body.surname || "";
        const pWhatsapp = body.whatsapp || "";
        const pEmail = body.email || "";

        const message =
          "Спасибо, что заполнили анкету!\nВ течение 24 часов мы вышлем вам билет в «Молодость» на Алтае.";
        try {
          if (pWhatsapp) {
            await sendWhatsAppMessage(pWhatsapp, message);
          }
        } catch (e) {
          strapi.log.warn("WhatsApp send failed");
        }

        const transporter = nodemailer.createTransport({
          host: "smtp.yandex.ru",
          port: 465,
          secure: true,
          auth: {
            user: "altay@clubmolodost.ru",
            pass: "pwdsunjkivypdrkl",
          },
        });

        const attachment = file.buffer
          ? {
              filename: file.originalFilename || file.name || "attachment",
              content: file.buffer,
              contentType:
                file.mimetype || file.type || "application/octet-stream",
            }
          : {
              filename: file.originalFilename || file.name || "attachment",
              path: file.filepath || file.path,
              contentType:
                file.mimetype || file.type || "application/octet-stream",
            };

        const html = `
      <h1>Заявка (ПРОМО) с вложением</h1>
      <br>
      <h3>Данные пользователя:</h3><br>
      <h4>Имя: ${pName || "не указано"}</h4><br>
      <h4>Фамилия: ${pSurname || "не указано"}</h4><br>
      <h4>WhatsApp: ${pWhatsapp || "не указан"}</h4><br>
      <h4>E-mail: ${pEmail || "не указан"}</h4><br>
    `;

        await transporter.sendMail({
          from: "altay@clubmolodost.ru",
          to: "altay@clubmolodost.ru",
          subject: "Заявка: ПРОМО с вложением",
          html,
          attachments: [attachment],
        });

        return {
          name: pName,
          surname: pSurname,
          whatsapp: pWhatsapp,
          email: pEmail,
          isPromo: true,
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
        //phone,
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
      } = ctx.request.body;

      (async function () {
        try {
          const message = `Спасибо за ответы!\n\n${name}, мы свяжемся с вами в течение 24 часов, чтобы мы смогли ответить на все оставшиеся вопросы ваши к нам и наши к вам.`;
          if (whatsapp) {
            await sendWhatsAppMessage(whatsapp, message);
          }
        } catch (e) {
          strapi.log.warn("WhatsApp send failed");
        }
        const transporter = nodemailer.createTransport({
          host: "smtp.yandex.ru",
          port: 465,
          secure: true,
          auth: {
            user: "altay@clubmolodost.ru",
            pass: "pwdsunjkivypdrkl",
          },
        });

        try {
          await transporter.sendMail({
            from: "altay@clubmolodost.ru",
            to: "altay@clubmolodost.ru",
            subject: "Заявка с сайта molodost.club",
            html: `
          <h1>Заявка с сайта molodost.club</h1>
          <br>
          <h3>Информация по заявке:</h3><br>
          <h4>Имя: ${name}</h4><br>
          <h4>Фамилия: ${surname}</h4><br>
          <h4>Кто рекомендовал: ${source || "не указано"}</h4><br>
          <h4>What'sApp: ${whatsapp || "не указан"}</h4><br>
          <h4>E-mail: ${email || "не указан"}</h4><br>
          <h4>Сколько раз у нас уже были: ${
            howManyTimes || "не указано"
          }</h4><br>
          <h4>Взрослых: ${adults || "не указано"}</h4><br>
          <h4>Детей: ${children || "не указано"}</h4><br>
          <h4>Возраст 1 ребенка: ${childrenAge1 || "не указано"}</h4><br>
          <h4>Возраст 2 ребенка: ${childrenAge2 || "не указано"}</h4><br>
          <h4>Возраст 3 ребенка: ${childrenAge3 || "не указано"}</h4><br>
          <h4>Возраст 4 ребенка: ${childrenAge4 || "не указано"}</h4><br>
          <h4>Когда хотят приехать: ${date || "не указано"}</h4><br>
          <h4>Даты точные или примерные: ${
            dateAccuracy || "не указано"
          }</h4><br>
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
          console.log("Письмо админу не отправилось.", err);
        }
        try {
          await transporter.sendMail({
            from: "altay@clubmolodost.ru",
            to: email,
            subject:
              "Ваше бронирование на сайте molodost.club почти подтверждено",
            html: `<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="ru">
 <head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Email</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG></o:AllowPNG>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
</xml>
<![endif]--><!--[if !mso]><!-- -->
  <link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet"><!--<![endif]-->
  <style type="text/css">
.rollover:hover .rollover-first {
	max-height:0px!important;
	display:none!important;
}
.rollover:hover .rollover-second {
	max-height:none!important;
	display:block!important;
}
.rollover span {
	font-size:0px;
}
u + .body img ~ div div {
	display:none;
}
#outlook a {
	padding:0;
}
span.MsoHyperlink,
span.MsoHyperlinkFollowed {
	color:inherit;
	mso-style-priority:99;
}
a.es-button {
	mso-style-priority:100!important;
	text-decoration:none!important;
}
a[x-apple-data-detectors] {
	color:inherit!important;
	text-decoration:none!important;
	font-size:inherit!important;
	font-family:inherit!important;
	font-weight:inherit!important;
	line-height:inherit!important;
}
.es-desk-hidden {
	display:none;
	float:left;
	overflow:hidden;
	width:0;
	max-height:0;
	line-height:0;
	mso-hide:all;
}
.es-button-border:hover > a.es-button {
	color:#ffffff!important;
}
@media only screen and (max-width:600px) {h1 { font-size:30px!important; text-align:left } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-m-p20b { padding-bottom:20px!important } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover span, .es-m-txt-c .rollover span, .es-m-txt-l .rollover span { line-height:0!important; font-size:0!important } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:18px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important; display:table-row!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .es-social td { padding-bottom:10px } .h-auto { height:auto!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
</style>
 </head>
 <body class="body" style="width:100%;height:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="ru" style="background-color:#FFFFFF"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#ffffff" origin="0.5, 0" position="0.5, 0"></v:fill>
			</v:background>
		<![endif]-->
   <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FFFFFF">
     <tr>
      <td valign="top" style="padding:0;Margin:0">
       <table class="es-header" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table class="es-header-body" cellspacing="0" cellpadding="0" bgcolor="#EEECE8" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#eeece8;width:600px">
             <tr>
              <td align="left" style="padding:0;Margin:0">
               <table cellspacing="0" cellpadding="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td valign="top" align="center" style="padding:0;Margin:0;width:600px">
                   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" style="padding:0;Margin:0;padding-bottom:25px;font-size:0px"><img class="adapt-img" src="https://fisqv.stripocdn.email/content/guids/CABINET_bca031d336ef134de47b66aa3019b005ddec31cf69d2c694c724231c1bccc727/images/group_1.png" alt style="display:block;font-size:14px;border:0;outline:none;text-decoration:none" width="600"></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#EEECE8" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#eeece8;width:600px">
             <tr>
              <td align="left" style="padding:0;Margin:0;padding-top:25px;padding-bottom:25px">
               <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td valign="top" align="center" style="padding:0;Margin:0;width:600px">
                   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" style="padding:0;Margin:0"><h1 style="Margin:0;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:36px;font-style:normal;font-weight:normal;line-height:43px;color:#e03823"><strong>СПАСИБО ЗА ОТВЕТЫ!</strong></h1></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table class="es-footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table class="es-footer-body" cellspacing="0" cellpadding="0" bgcolor="#EEECE8" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#eeece8;width:600px">
             <tr>
              <td align="left" style="padding:0;Margin:0;padding-top:25px;padding-bottom:40px">
               <table cellspacing="0" cellpadding="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:600px">
                   <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="left" style="padding:0;Margin:0;padding-left:25px;padding-right:25px;padding-bottom:40px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:roboto, 'helvetica neue', helvetica, arial, sans-serif;line-height:29px;letter-spacing:0;color:#000000;font-size:24px"><strong><span style="color:#E03823">${name}</span>, мы свяжемся с вами в течение 24 часов, чтобы мы смогли ответить на все оставшиеся вопросы ваши к нам и наши к вам.</strong></p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>
        `,
          });
        } catch (err) {
          console.log("Письмо пользователю не отправилось", err);
        }
      })();

      return {
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
        //phone,
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
