const CHAT_ID_PERMITIDO = -5236846332;

const PALAVRAS_CHAVE = ['placa de video', 'rtx', 'rx', 'gpu', '3060', '4060', '4070', '4080'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { message } = req.body;

    if (!message || !message.text || message.chat.id !== CHAT_ID_PERMITIDO) {
      return res.status(200).send('Ignorado por segurança ou formato.');
    }

    const textoMensagem = message.text.toLowerCase();

    const encontrouTermo = PALAVRAS_CHAVE.some(termo => textoMensagem.includes(termo));

    if (encontrouTermo) {
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
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('[Erro no Servidor]:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
