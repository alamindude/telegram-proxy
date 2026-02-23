export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, ip } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 🔐 তোমার নতুন Bot Token বসাও
    const TOKEN = "8422637250:AAFewyJV87eCF4mALyxNx4FxJrgAC7ReA24";
    const CHAT_ID = "7914450932";

    let locationText = "";

    // 🌍 IP Location Fetch
    if (ip) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoRes.json();

        if (geoData.status === "success") {
          locationText = `\n📍 <b>Location:</b> ${geoData.city}, ${geoData.regionName}, ${geoData.country}`;
        }
      } catch (err) {
        locationText = "";
      }
    }

    const finalMessage = message + locationText;

    const telegramUrl = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: finalMessage,
        parse_mode: "HTML"
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
