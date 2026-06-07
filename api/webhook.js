const CHAT_ID_PERMITIDO = -5236846332;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { message } = req.body;

    console.log('[DEBUG] Mensagem recebida:', JSON.stringify(req.body, null, 2));

    if (!message || !message.text) {
      console.log('[DEBUG] Ignorado: sem mensagem ou sem texto');
      return res.status(200).send('Ignorado por segurança ou formato.');
    }

    console.log('[DEBUG] Chat ID:', message.chat.id, '| Texto:', message.text.substring(0, 50));

    if (message.chat.id !== CHAT_ID_PERMITIDO) {
      console.log('[DEBUG] Chat ID não autorizado. Esperado:', CHAT_ID_PERMITIDO);
      return res.status(200).send('Chat não autorizado.');
    }

    const phone = process.env.WHATSAPP_PHONE;
    const apikey = process.env.CALLMEBOT_APIKEY;
    
    const textoCodificado = encodeURIComponent(message.text);

    const urlCallMeBot = `https://api.callmebot.com/whatsapp.php?phone=${phone}&apikey=${apikey}&text=${textoCodificado}`;

    const resposta = await fetch(urlCallMeBot);

    if (resposta.ok) {
      console.log('[Sucesso] Mensagem enviada para o WhatsApp!');
    } else {
      console.error('[Erro] Falha ao chamar a API do CallMeBot');
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('[Erro no Servidor]:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
