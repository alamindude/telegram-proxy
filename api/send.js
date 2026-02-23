export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, ip, amount, cancel_count } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const TOKEN = "8422637250:AAFewyJV87eCF4mALyxNx4FxJrgAC7ReA24";
    const CHAT_ID = "7914450932";

    let extraInfo = "";

    // 🌍 IP GEO LOOKUP
    if (ip) {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,proxy,lat,lon`);
        const geo = await geoRes.json();

        if (geo.status === "success") {

          const flag = geo.countryCode
            ? String.fromCodePoint(...geo.countryCode
                .toUpperCase()
                .split('')
                .map(c => 127397 + c.charCodeAt()))
            : "";

          extraInfo += `\n🌐 <b>IP:</b> ${ip}`;
          extraInfo += `\n📍 <b>Location:</b> ${geo.city}, ${geo.regionName}`;
          extraInfo += `\n🏳 <b>Country:</b> ${flag} ${geo.country}`;
          extraInfo += `\n📡 <b>ISP:</b> ${geo.isp}`;

          if (geo.proxy === true) {
            extraInfo += `\n⚠️ <b>VPN / PROXY DETECTED</b>`;
          }

          extraInfo += `\n🗺 <a href="https://www.google.com/maps?q=${geo.lat},${geo.lon}">View Map</a>`;
        }

      } catch (err) {
        // ignore geo errors
      }
    }

    // 💰 HIGH AMOUNT ALERT
    if (amount && Number(amount) >= 1000) {
      extraInfo += `\n🚨 <b>HIGH AMOUNT ALERT</b>`;
    }

    // 🚫 CANCEL WARNING
    if (cancel_count && Number(cancel_count) >= 3) {
      extraInfo += `\n⚠️ <b>SUSPICIOUS CANCEL COUNT</b>`;
    }

    // 🧠 FRAUD SCORE
    let fraudScore = 0;
    if (amount && Number(amount) >= 1000) fraudScore += 2;
    if (cancel_count && Number(cancel_count) >= 3) fraudScore += 2;

    if (fraudScore >= 3) {
      extraInfo += `\n🔥 <b>FRAUD RISK: HIGH</b>`;
    }

    const finalMessage = message + "\n\n━━━━━━━━━━━━━━━━━━" + extraInfo;

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

    return res.status(200).json({ success: true, telegram: data });

  } catch (error) {
    return res.status(500).json({ success: false });
  }
}
