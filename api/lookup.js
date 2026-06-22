// api/lookup.js — Vercel Serverless Function
// وسيط بين الواجهة و Apps Script للاستعلام عن الرقم الإداري (نسيت الرقم)
// يحل مشكلة فشل الوصول المباشر من بعض شبكات الجوال (في سوريا) لنطاقات Google

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ found: false, message: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const { phone, firstName } = req.query;

  if (!phone || !firstName) {
    return res.status(400).json({ found: false, message: 'بيانات ناقصة' });
  }

  try {
    const url =
      process.env.APPS_SCRIPT_URL +
      '?action=lookup' +
      '&phone=' + encodeURIComponent(phone) +
      '&firstName=' + encodeURIComponent(firstName) +
      '&callback=cb';

    const scriptRes = await fetch(url);
    const text = await scriptRes.text();

    // doGet في Apps Script يرجّع نص JSONP على شكل cb({...}) — نفصل الجزء JSON منه فقط
    const match = text.match(/^cb\((.*)\)\s*$/s);
    const data = match ? JSON.parse(match[1]) : { found: false };

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ found: false, message: 'خطأ في الاتصال بالسيرفر' });
  }
}
