export default function manifest() {
  return {
    name: 'Cabinet Dentaire Ilyass',
    short_name: 'Dentiste Ilyass',
    description: 'Prise de rendez-vous en ligne, Tiflet, Hay Andalos',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: 'fr',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}