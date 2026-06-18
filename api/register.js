// api/register.js — Vercel Serverless Function
// هذا الملف يعمل كوسيط بين الواجهة و Apps Script
// يتحقق من reCAPTCHA بأمان تام ثم يرسل البيانات للشيت

export default async function handler(req, res) {

  // السماح فقط بطلبات POST
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  // السماح بـ CORS من أي نطاق (الواجهة على Vercel)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const data = req.body;

  // 1. التحقق من reCAPTCHA
  if (!data.captchaToken) {
    return res.status(400).json({ status: 'error', message: 'توكن reCAPTCHA مفقود' });
  }

  try {
    const captchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${data.captchaToken}`
    });
    const captchaResult = await captchaRes.json();

    // درجة أقل من 0.5 تعني بوت
    if (!captchaResult.success || captchaResult.score < 0.5) {
      return res.status(400).json({ status: 'error', message: 'فشل التحقق — يبدو أنك بوت!' });
    }
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'خطأ في التحقق من reCAPTCHA' });
  }

  // 2. إرسال البيانات لـ Apps Script
  try {
    const scriptRes = await fetch(process.env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        name:      data.name,
        phone:     data.phone,
        gender:    data.gender,
        education: data.education,
        hasIjaza:  data.hasIjaza,
        timestamp: data.timestamp
      })
    });

    const result = await scriptRes.json();
    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'خطأ في الاتصال بالسيرفر' });
  }
}
