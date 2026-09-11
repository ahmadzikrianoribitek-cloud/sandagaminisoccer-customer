// sw.js — Service Worker untuk PWA Booking Lapangan
// Naikkan angka versi ini setiap kali kamu update tampilan/isi index.html
// supaya customer otomatis dapat versi terbaru (bukan versi cache lama).
const CACHE_NAME = 'booking-lapangan-cache-v1';

// File inti yang di-cache supaya web tetap terbuka walau sinyal lemah.
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './ikon.png',
  './latar.png'
];

// Saat instal: simpan file inti ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(() => {
        // Kalau salah satu file tidak ditemukan (misal nama beda),
        // instalasi tetap lanjut agar tidak gagal total.
      });
    })
  );
  self.skipWaiting();
});

// Saat aktif: hapus cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Strategi: coba ambil dari internet dulu (biar data booking selalu update),
// kalau gagal/offline baru pakai cache.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
