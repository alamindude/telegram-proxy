export default async function handler(req, res) {

  // Only allow POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 🔐 তোমার নতুন Bot Token বসাও এখানে
    const TOKEN = "8422637250:AAFewyJV87eCF4mALyxNx4FxJrgAC7ReA24";

    // 🔐 তোমার Chat ID
    const CHAT_ID = "7914450932";

    const telegramUrl = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML" // Bold, line break support
      }),
    });

    const data = await telegramResponse.json();

    return res.status(200).json({
      success: true,
      telegram: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Telegram send failed"
    });
  }
}
