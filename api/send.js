export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  const TOKEN = "8422637250:AAFewyJV87eCF4mALyxNx4FxJrgAC7ReA24";
  const CHAT_ID = "7914450932";

  const telegramUrl = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  try {
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
      }),
    });

    const data = await response.json();
    return res.status(200).json({ success: true, telegram: data });

  } catch (error) {
    return res.status(500).json({ error: "Telegram send failed" });
  }
}
