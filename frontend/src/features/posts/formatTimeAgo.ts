export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (Number.isNaN(diffSeconds) || diffSeconds < 0) {
    return '';
  }
  if (diffSeconds < 60) {
    return "à l'instant";
  }

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) {
    return `il y a ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `il y a ${hours} h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `il y a ${days} j`;
  }

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
