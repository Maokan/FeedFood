const GRADIENTS = [
  'linear-gradient(135deg, #e63946, #b3202c)',
  'linear-gradient(135deg, #f4c542, #e63946)',
  'linear-gradient(135deg, #b3202c, #f4c542)',
  'linear-gradient(135deg, #a8438f, #e63946)',
  'linear-gradient(135deg, #f4a542, #b3202c)',
];

interface AvatarProps {
  /** Nom de l'utilisateur : choisit la couleur et fournit l'initiale. */
  name: string;
  size?: number;
}

/**
 * Avatar circulaire sans image : initiale de l'utilisateur sur un dégradé.
 * Le backend ne stocke pas d'avatar, on en dérive un qui reste stable
 * pour un même utilisateur.
 */
export default function Avatar({ name, size = 40 }: AvatarProps) {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const gradient = GRADIENTS[hash % GRADIENTS.length];
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <span
      className="inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-bold uppercase text-white"
      role="img"
      aria-label={`Avatar de ${name}`}
      title={name}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: gradient,
      }}
    >
      {initial}
    </span>
  );
}
