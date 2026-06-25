// الأوامر المسموحة عبر هذا الـ proxy (كل ما يحتاج توكن إداري صالح)
const POST_ACTIONS = ['setOverride', 'forceAttend', 'unbindDevice', 'removeToday', 'setLocationSettings', 'resetAllSettings'];
const GET_ACTIONS = ['getStatus', 'getTodayList'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (req.method === 'GET') {
      const { token, action } = req.query;

      if (!token) {
        return res.status(400).json({ status: 'error', message: 'التوكن مطلوب' });
      }

      // إذا لم يُحدَّد action، الافتراضي هو getStatus (يحافظ على التوافق مع admin.html الحالي)
      const finalAction = action || 'getStatus';

      if (!GET_ACTIONS.includes(finalAction)) {
        return res.status(400).json({ status: 'error', message: 'إجراء غير معروف' });
      }

      const url = process.env.APPS_SCRIPT_URL + '?action=' + finalAction + '&token=' + encodeURIComponent(token);
      const scriptRes = await fetch(url);
      const result = await scriptRes.json();
      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      const data = req.body;
      if (!data || !data.action || !POST_ACTIONS.includes(data.action)) {
        return res.status(400).json({ status: 'error', message: 'إجراء غير صحيح' });
      }
      if (!data.token) {
        return res.status(400).json({ status: 'error', message: 'التوكن مطلوب' });
      }

      const scriptRes = await fetch(process.env.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      });
      const result = await scriptRes.json();
      return res.status(200).json(result);
    }

    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'خطأ في الاتصال بالسيرفر' });
  }
}
