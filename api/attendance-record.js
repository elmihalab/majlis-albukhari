export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { adminCode } = req.query;
  if (!adminCode) return res.status(400).json({ status: 'error', message: 'الرقم الإداري مطلوب' });
  try {
    const url = process.env.APPS_SCRIPT_URL + '?action=getAttendanceRecord&adminCode=' + encodeURIComponent(adminCode);
    const scriptRes = await fetch(url);
    const result = await scriptRes.json();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'خطأ في الاتصال بالسيرفر' });
  }
}
