export interface SampleVideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  durationLabel: string;
  category: string;
  region: 'indonesia' | 'global' | 'both';
  badgeLabel?: string;
}

export const SAMPLE_VIDEOS: SampleVideoItem[] = [
  {
    id: 'nature-drone',
    title: 'Alam Nusantara & Air Terjun Eksotis',
    description: 'Pemandangan lanskap air terjun dramatis resolusi tinggi, sangat diminati penonton Indonesia',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    durationLabel: '15 detik',
    category: 'Cinematic & Healing',
    region: 'indonesia',
    badgeLabel: '🇮🇩 Populer di Indonesia',
  },
  {
    id: 'tech-gadget',
    title: 'Review Gadget & Teknologi Modern',
    description: 'Video unboxing & demo teknologi modern untuk tutorial, tips trik, atau afiliasi',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    durationLabel: '15 detik',
    category: 'Teknologi & Edukasi',
    region: 'both',
    badgeLabel: '🔥 Tren Lintas Negara',
  },
  {
    id: 'action-sports',
    title: 'Global Extreme Action & High-Octane',
    description: 'Klip gerakan cepat aksi berenergi tinggi, sangat ampuh menarik penonton global (US & Eropa)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    durationLabel: '15 detik',
    category: 'Action & High Energy',
    region: 'global',
    badgeLabel: '🌍 Viral Global / US',
  },
  {
    id: 'fun-story',
    title: 'Kisah Animasi 3D & Storytelling',
    description: 'Klip animasi 3D ekspresif, format ideal untuk voiceover cerita horor/lucu khas kreator lokal',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    durationLabel: '15 detik',
    category: 'Cerita & Voiceover',
    region: 'indonesia',
    badgeLabel: '🇮🇩 Cocok Voiceover ID',
  },
  {
    id: 'global-speed',
    title: 'Fast Pace High-Retention Showcase',
    description: 'Video bertempo cepat untuk optimasi retensi penonton luar negeri dengan CPM tinggi',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    durationLabel: '15 detik',
    category: 'Automotive & Lifestyle',
    region: 'global',
    badgeLabel: '🌍 High CPM Audience',
  },
  {
    id: 'bunny-animation',
    title: 'Animated 3D Story Clip (Full HD)',
    description: 'Klip animasi 3D populer untuk cerita, fakta unik, atau voiceover shorts segala bahasa',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    durationLabel: '9 menit',
    category: 'Animasi & Hiburan',
    region: 'both',
    badgeLabel: '✨ Multi-Audience',
  },
];
