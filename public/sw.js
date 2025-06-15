// Nome do cache
const CACHE_NAME = 'pandaloc-cache-v1';

// Lista de URLs para serem cacheadas
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/images/Logo_fundo_claro/Aluguel-de-Maquinas-9.webp',
  '/images/Design sem nome (92).webp',
  '/images/Design sem nome (92).png',
  '/images/Design sem nome (98).webp',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta requisições e verifica cache
self.addEventListener('fetch', (event) => {
  // Estratégia Cache First, Network Fallback
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna resposta cacheada se existir
        if (response) {
          return response;
        }

        // Se não tiver no cache, busca na rede
        return fetch(event.request).then(
          (response) => {
            // Verifica se recebemos uma resposta válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone da resposta (Para o cache e para o navegador)
            const responseToCache = response.clone();

            // Adiciona ao cache para uso futuro
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Não cacheamos solicitações de API ou de autenticação
                if (
                  !event.request.url.includes('/api/') && 
                  !event.request.url.includes('/auth/')
                ) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

// Ativação (limpa caches antigos)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Remove caches que não estão na whitelist
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 