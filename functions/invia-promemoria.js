export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Email non valida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Save contact to Brevo list (creates contact, Brevo handles the rest via automation)
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        attributes: { DATA_ISCRIZIONE: new Date().toISOString() },
        updateEnabled: true
      })
    });

    // Send immediate confirmation email
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'RisparmioAI', email: 'risparmioai1@gmail.com' },
        to: [{ email }],
        subject: 'Promemoria attivato — RisparmioAI',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #00C170;">Promemoria attivato! 🎉</h2>
            <p>Ciao,</p>
            <p>Hai attivato il promemoria mensile di <strong>RisparmioAI</strong>. Tra 30 giorni ti scriveremo per ricordarti di ricontrollare le tue spese e vedere quanto hai risparmiato.</p>
            <p>Nel frattempo puoi sempre tornare sul sito quando vuoi:</p>
            <a href="https://risparmioai1.pages.dev" style="display:inline-block; background:#00C170; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; margin-top:10px;">Vai a RisparmioAI</a>
            <p style="color:#999; font-size:12px; margin-top:30px;">Hai ricevuto questa email perché ti sei iscritto al promemoria su risparmioai1.pages.dev</p>
          </div>
        `
      })
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
