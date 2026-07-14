import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TechFitness - Treino Inteligente',
    short_name: 'TechFitness',
    description: 'Plataforma premium para personal trainers e alunos evoluírem de forma gamificada.',
    start_url: '/student/dashboard',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#2563EB',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      },
    ],
  };
}
