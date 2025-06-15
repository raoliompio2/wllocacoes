import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Obter o caminho da imagem dos parâmetros de consulta
  const { path } = req.query;
  
  if (!path) {
    return res.status(400).json({ error: 'Caminho de imagem não especificado' });
  }
  
  try {
    // Construir a URL completa da imagem no servidor principal
    const imageUrl = `https://seusite.com.br/wp-content/uploads/${path}`;
    
    // Tentar obter a imagem do servidor de backup (se disponível)
    const backupImageUrl = `https://backup.seusite.com.br/wp-content/uploads/${path}`;
    
    // Primeiro tente o servidor principal
    let response = await fetch(imageUrl, { method: 'HEAD' });
    
    // Se o servidor principal não responder ou retornar erro, tente o backup
    if (!response.ok) {
      response = await fetch(backupImageUrl, { method: 'HEAD' });
    }
    
    // Se nenhuma das fontes tiver a imagem, retornar uma imagem de fallback
    if (!response.ok) {
      // Verificar se existe uma imagem de fallback local correspondente
      const localPath = `/images/${path.split('/').pop()}`;
      try {
        // Verificar se a imagem local existe
        const localResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}${localPath}`, { method: 'HEAD' });
        
        if (localResponse.ok) {
          // Redirecionar para a imagem local
          return res.redirect(307, localPath);
        }
        
        // Se não encontrar a imagem local, retornar uma imagem de placeholder genérica
        return res.redirect(307, '/images/placeholder.png');
      } catch (error) {
        // Em caso de erro ao verificar a imagem local, usar placeholder
        return res.redirect(307, '/images/placeholder.png');
      }
    }
    
    // Se encontrou a imagem na web, fazer o proxy
    const imageResponse = await fetch(response.url);
    const imageBuffer = await imageResponse.buffer();
    
    // Definir os cabeçalhos corretos
    res.setHeader('Content-Type', imageResponse.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Enviar a imagem
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error('Erro ao processar a imagem:', error);
    
    // Em caso de erro, redirecionar para uma imagem de placeholder
    return res.redirect(307, '/images/placeholder.png');
  }
} 