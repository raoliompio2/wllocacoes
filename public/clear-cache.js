// Este script limpa o cache do service worker
(function() {
  // Limpar todos os caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      cacheNames.forEach(function(cacheName) {
        console.log('Limpando cache:', cacheName);
        caches.delete(cacheName);
      });
    });
  }
  
  // Desregistrar todos os service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        console.log('Desregistrando service worker:', registration);
        registration.unregister();
      }
    });
  }
  
  console.log('Cache e Service Workers limpos!');
  console.log('Você pode fechar esta página e recarregar a página principal.');
})(); 