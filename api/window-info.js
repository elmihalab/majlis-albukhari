export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const url = process.env.APPS_SCRIPT_URL + '?action=getPublicWindowInfo';
    const scriptRes = await fetch(url);
    const result = await scriptRes.json();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'خطأ في الاتصال بالسيرفر' });
  }
}
