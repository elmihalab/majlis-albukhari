export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const data = req.body;

  if (!data || !data.password) {
    return res.status(400).json({ status: 'error', message: 'كلمة المرور مطلوبة' });
  }

  try {
    const scriptRes = await fetch(process.env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'adminAuth',
        password: data.password
      })
    });
    const result = await scriptRes.json();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'خطأ في الاتصال بالسيرفر' });
  }
}
