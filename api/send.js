export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    const { 
      message, 
      ip, 
      token, 
      chat_id, 
      amount, 
      cancel_count, 
      secret 
    } = req.body;

    // 🔐 Security Secret (MUST match db.php)
    if (secret !== "ULTRA_SECRET_KEY_2026") {
      return res.status(403).json({ error: "Unauthorized request" });
    }

    if (!message || !token || !chat_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let extraInfo = "";

    // 🌍 IP GEO CHECK
    if (ip) {
      try {

        const geoResponse = await fetch(
          `http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,proxy`
        );

        const geo = await geoResponse.json();

        if (geo.status === "success") {

          // Flag emoji auto generate
          let flag = "";
          if (geo.countryCode) {
            flag = geo.countryCode
              .toUpperCase()
              .split('')
              .map(c => String.fromCodePoint(127397 + c.charCodeAt()))
              .join('');
          }

          extraInfo += `\n🌐 <b>IP:</b> ${ip}`;
          extraInfo += `\n📍 <b>Location:</b> ${geo.city}, ${geo.regionName}`;
          extraInfo += `\n🏳 <b>Country:</b> ${flag} ${geo.country}`;
          extraInfo += `\n📡 <b>ISP:</b> ${geo.isp}`;

          if (geo.proxy === true) {
            extraInfo += `\n⚠️ <b>VPN / PROXY DETECTED</b>`;
          }
        }

      } catch (err) {
        // ignore geo errors
      }
    }

    // 🚨 High Amount Alert
    if (amount && Number(amount) >= 1000) {
      extraInfo += `\n🚨 <b>HIGH AMOUNT ALERT</b>`;
    }

    // ⚠️ Suspicious Cancel Alert
    if (cancel_count && Number(cancel_count) >= 3) {
      extraInfo += `\n⚠️ <b>SUSPICIOUS CANCEL COUNT</b>`;
    }

    // 📤 Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chat_id,
        text: message + "\n\n━━━━━━━━━━━━━━━━━━━" + extraInfo,
        parse_mode: "HTML"
      })
    });

    const data = await telegramResponse.json();

    return res.status(200).json({
      success: true,
      telegram: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}
