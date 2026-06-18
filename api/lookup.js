// api/lookup.js — Vercel Serverless Function
// وسيط للبحث عن الرقم الإداري — يتجنب مشكلة JSONP على الجوال

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { phone, firstName } = req.query;

  if (!phone || !firstName) {
    return res.status(400).json({ found: false, error: 'بيانات ناقصة' });
  }

  try {
    const url = `${process.env.APPS_SCRIPT_URL}?action=lookup&phone=${encodeURIComponent(phone)}&firstName=${encodeURIComponent(firstName)}&callback=cb`;
    const response = await fetch(url);
    const text = await response.text();

    // استخراج JSON من داخل cb({...})
    const match = text.match(/cb\((\{.*\})\)/s);
    if (!match) {
      return res.status(500).json({ found: false, error: 'خطأ في تحليل الرد' });
    }

    const result = JSON.parse(match[1]);
    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ found: false, error: 'خطأ في الاتصال' });
  }
}
