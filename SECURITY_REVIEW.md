# Revue de sécurité du backend FeedFood

Date de la revue : 2026-09-08  
Périmètre principal : `backend/src/auth.ts`, `backend/src/index.ts`, `backend/src/routes.ts`  
Contexte complémentaire : `backend/prisma/schema.prisma`, `backend/scripts/generate-images.ts`

## Synthèse

Le backend présente plusieurs problèmes de sécurité importants autour de l'authentification, de l'autorisation, de l'exposition de données sensibles et des uploads. Les priorités absolues sont :

1. sécuriser, expirer et charger correctement les JWT ;
2. vérifier la propriété des posts et commentaires avant suppression ;
3. ne jamais retourner le champ `password` dans les réponses API ;
4. valider et limiter les fichiers uploadés ;
5. empêcher les likes dupliqués ;
6. ajouter validation, limitation de débit et pagination.

## Constats de sécurité et d'architecture

### 1. Secret JWT prévisible et chargement trop tardif

**Gravité : critique**  
**Emplacements :** [backend/src/auth.ts](backend/src/auth.ts#L4), [backend/src/index.ts](backend/src/index.ts#L7-L9)

Le code utilise une valeur de secours connue :

```ts
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
```

Si `JWT_SECRET` n'est pas défini, un attaquant peut fabriquer des tokens valides et choisir `userId` et `role`.

De plus, `router` est importé avant l'appel à `dotenv.config()`. Comme `auth.ts` est chargé pendant l'import de `routes.ts`, le secret peut être évalué avant le chargement du fichier `.env`.

**Recommandations :**

- appeler `dotenv.config()` dans le point d'entrée avant de charger les modules qui utilisent la configuration ;
- refuser de démarrer si `JWT_SECRET` manque en production ;
- utiliser un secret long, aléatoire et stocké dans le gestionnaire de secrets de l'environnement ;
- ajouter une expiration (`expiresIn`) courte pour les access tokens ;
- définir éventuellement `issuer` et `audience` lors de la signature et de la vérification.

### 2. Tokens JWT sans expiration ni révocation

**Gravité : élevée**  
**Emplacement :** [backend/src/auth.ts](backend/src/auth.ts#L8)

`jwt.sign` est appelé sans option `expiresIn`. Tout token volé reste donc valide indéfiniment, jusqu'à une éventuelle rotation du secret JWT. Le backend ne possède pas non plus de mécanisme de révocation ou de rotation des sessions.

Un attaquant qui récupère un token peut ainsi conserver l'accès même si l'utilisateur se déconnecte, change son mot de passe ou change de rôle. Le champ `role` contenu dans un token déjà émis n'est pas réévalué en base.

**Recommandations :**

- utiliser un access token de courte durée, par exemple 15 minutes ;
- mettre en place des refresh tokens rotatifs et révocables pour les sessions longues ;
- stocker une version de session ou de token côté utilisateur pour invalider les sessions ;
- vérifier les permissions actuelles en base pour les opérations sensibles ;
- ajouter `issuer`, `audience` et une liste d'algorithmes explicitement autorisés à `jwt.verify`.

### 3. Utilisation de `any` aux frontières d'authentification

**Gravité : élevée**  
**Emplacements :** [backend/src/auth.ts](backend/src/auth.ts#L19-L21), [backend/src/routes.ts](backend/src/routes.ts#L120-L121), [backend/src/routes.ts](backend/src/routes.ts#L157-L158), [backend/src/routes.ts](backend/src/routes.ts#L195-L196), [backend/src/routes.ts](backend/src/routes.ts#L214-L215)

Les utilisations suivantes désactivent le contrôle TypeScript sur des données qui contrôlent l'autorisation :

```ts
const decoded: any = jwt.verify(token, JWT_SECRET);
(req as any).userId = decoded.userId;
const userId = (req as any).userId;
```

Ce ne sont pas seulement des problèmes de style. Ils permettent au code de compiler alors que :

- le token décodé peut avoir une forme inattendue ;
- `userId` peut être absent, mal typé ou manipulé comme une valeur arbitraire ;
- une route peut oublier que l'identité authentifiée n'est pas une donnée fournie par le client ;
- un renommage ou une modification du contexte d'authentification peut casser silencieusement les contrôles d'accès.

Le cast `as any` ne valide pas la donnée et n'ajoute aucune sécurité. Il masque au contraire les erreurs de contrat entre le middleware et les routes.

**Remplacement recommandé :**

1. Définir un type de payload JWT explicite et vérifier les propriétés attendues avant de les utiliser :

```ts
import jwt, { JwtPayload } from "jsonwebtoken";

type AuthTokenPayload = JwtPayload & {
	userId: string;
	role: string;
};

function isAuthTokenPayload(value: string | JwtPayload): value is AuthTokenPayload {
	return (
		typeof value === "object" &&
		value !== null &&
		typeof value.userId === "string" &&
		typeof value.role === "string"
	);
}
```

Puis rejeter le token si le payload ne respecte pas ce contrat :

```ts
const decoded = jwt.verify(token, JWT_SECRET, {
	algorithms: ["HS256"],
});

if (!isAuthTokenPayload(decoded)) {
	return res.status(401).json({ error: "Invalid token" });
}
```

2. Étendre les types Express une seule fois afin de donner un type à `req.user` :

```ts
declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				role: string;
			};
		}
	}
}
```

Le middleware peut alors écrire `req.user = { id: decoded.userId, role: decoded.role }`, et les routes peuvent lire `req.user` après le middleware d'authentification, avec une vérification explicite si nécessaire. Il faut éviter de stocker séparément `userId` et `userRole` sous forme de propriétés non typées.

3. Pour une sécurité plus forte, ne pas traiter le rôle du JWT comme l'autorité définitive : récupérer l'utilisateur en base ou vérifier une version de session. Le typage empêche les formes invalides, mais il ne remplace pas la vérification métier ni l'autorisation.

Cette correction doit être accompagnée de tests couvrant un token sans `userId`, un `userId` non textuel, un rôle inconnu et un token correctement signé mais expiré.

### 4. Absence de contrôle d'autorisation sur les suppressions

**Gravité : critique**  
**Emplacements :** [backend/src/routes.ts](backend/src/routes.ts#L142), [backend/src/routes.ts](backend/src/routes.ts#L166)

Les routes de suppression vérifient seulement que l'utilisateur est authentifié. Elles ne vérifient pas que le post ou le commentaire appartient à l'utilisateur connecté.

N'importe quel utilisateur authentifié peut donc supprimer les ressources d'un autre utilisateur en connaissant leur identifiant.

Le champ `userRole` est extrait du JWT dans [backend/src/auth.ts](backend/src/auth.ts#L20), mais aucun middleware ne l'utilise pour appliquer des permissions.

**Recommandations :**

- charger la ressource avant suppression ;
- autoriser son auteur ou un administrateur ;
- comparer l'identité provenant du token avec l'auteur stocké en base ;
- centraliser cette logique dans un middleware ou une fonction d'autorisation ;
- ne jamais considérer le rôle du token comme fiable si le token peut être forgé.

### 5. Exposition des hashes de mots de passe

**Gravité : critique**  
**Emplacements :** [backend/src/routes.ts](backend/src/routes.ts#L225), [backend/src/routes.ts](backend/src/routes.ts#L111), [backend/src/routes.ts](backend/src/routes.ts#L114)

La route utilisateur renvoie directement l'objet Prisma complet :

```ts
res.json(user);
```

Cela expose le champ `password`. Les relations `author: true` des posts et commentaires peuvent également exposer le hash du mot de passe des auteurs.

Un hash bcrypt ne doit jamais être transmis au client : il peut être récupéré puis attaqué hors ligne.

**Recommandations :**

- utiliser des `select` Prisma explicites ;
- ne sélectionner que `id`, `username` et les autres champs réellement publics ;
- vérifier toutes les réponses qui utilisent `include: { author: true }` ;
- ajouter un test empêchant toute présence de `password` dans les réponses HTTP.

### 6. Uploads non contrôlés

**Gravité : élevée**  
**Emplacements :** [backend/src/routes.ts](backend/src/routes.ts#L10-L18), [backend/src/index.ts](backend/src/index.ts#L15)

Multer est configuré sans limite de taille, filtre de type ou contrôle du contenu. Le nom fourni par le client est réutilisé dans le nom final du fichier.

Les fichiers sont ensuite servis publiquement sous `/uploads`. Cela peut permettre le dépôt et la distribution de fichiers inattendus, notamment de fichiers HTML pouvant créer un risque XSS selon le contexte frontend et les en-têtes utilisés.

**Recommandations :**

- générer un nom aléatoire côté serveur ;
- ne pas utiliser directement `originalname` ;
- définir une taille maximale ;
- limiter les extensions et types MIME autorisés ;
- vérifier le contenu réel du fichier ;
- stocker les fichiers hors de la racine publique lorsque possible ;
- servir les fichiers avec des en-têtes restrictifs.

### 7. Likes dupliqués

**Gravité : élevée**  
**Emplacements :** [backend/src/routes.ts](backend/src/routes.ts#L188-L203), [backend/prisma/schema.prisma](backend/prisma/schema.prisma#L48-L56)

La route de like crée toujours une nouvelle ligne. Le schéma ne possède aucune contrainte unique sur `(postId, userId)`.

Un utilisateur peut donc liker plusieurs fois le même post et gonfler artificiellement le compteur.

**Recommandation :** ajouter une contrainte Prisma :

```prisma
@@unique([postId, userId])
```

La route devrait ensuite utiliser `upsert` ou gérer explicitement le conflit d'unicité.

## Risques importants de robustesse et d'abus

### 8. Validation insuffisante des entrées

**Gravité : élevée**  
**Emplacements :** [backend/src/routes.ts](backend/src/routes.ts#L22-L37), [backend/src/routes.ts](backend/src/routes.ts#L51-L80), [backend/src/routes.ts](backend/src/routes.ts#L117-L128), [backend/src/routes.ts](backend/src/routes.ts#L151-L164)

Les champs reçus sont utilisés sans validation structurée. Il manque notamment :

- vérification des champs obligatoires et de leurs types ;
- longueur maximale des posts et commentaires ;
- validation et normalisation de l'email ;
- politique de mot de passe ;
- validation du username ;
- limites de taille des requêtes ;
- validation des identifiants.

Une bibliothèque comme Zod, Joi ou express-validator peut centraliser ces règles.

### 9. Absence de limitation de débit

**Gravité : élevée**  
**Emplacements :** [backend/src/routes.ts](backend/src/routes.ts#L22-L80)

Les routes d'inscription et de connexion n'ont pas de rate limiting. Elles sont exposées aux attaques par force brute, au credential stuffing et au spam.

Les appels synchrones `bcrypt.hashSync` et `bcrypt.compareSync` bloquent également la boucle événementielle Node.js pendant le calcul du hash.

**Recommandations :**

- ajouter un rate limiter par IP et, si possible, par compte ;
- utiliser les APIs asynchrones de bcrypt ;
- ajouter une journalisation des échecs sans enregistrer de mot de passe.

### 10. Absence de pagination et requêtes N+1

**Gravité : élevée**  
**Emplacements :** [backend/src/routes.ts](backend/src/routes.ts#L85-L109), [backend/src/routes.ts](backend/src/routes.ts#L132-L137)

`GET /posts` récupère tous les posts et effectue plusieurs requêtes supplémentaires par post. `GET /posts/:id` récupère tous les commentaires sans limite.

Un volume important de données peut provoquer des réponses très volumineuses, une forte charge SQLite et un déni de service applicatif.

**Recommandations :**

- ajouter `limit` et curseur de pagination ;
- plafonner la taille maximale des pages ;
- utiliser des agrégations Prisma pour les compteurs ;
- limiter ou paginer les commentaires ;
- éviter les chargements relationnels non nécessaires.

## Erreurs de conception et de gestion des erreurs

### 11. Ressource inexistante non traitée

**Gravité : moyenne**  
**Emplacement :** [backend/src/routes.ts](backend/src/routes.ts#L125-L140)

`findUnique` peut renvoyer `null`, mais le code accède ensuite à `post.id`, `post.content`, etc. Un identifiant inconnu provoque donc une erreur serveur au lieu d'un `404 Not Found`.

Le même principe doit être appliqué aux créations de commentaires et de likes lorsque le post n'existe pas.

### 12. Codes HTTP incorrects pour les erreurs d'authentification

**Gravité : moyenne**  
**Emplacements :** [backend/src/routes.ts](backend/src/routes.ts#L27-L28), [backend/src/routes.ts](backend/src/routes.ts#L58-L63)

Les erreurs d'inscription et de connexion sont renvoyées avec le statut `200`. Il faut utiliser notamment :

- `400` pour une requête invalide ;
- `401` pour des identifiants invalides ;
- `409` pour un email déjà utilisé.

### 13. CORS ouvert à toutes les origines

**Gravité : moyenne**  
**Emplacement :** [backend/src/index.ts](backend/src/index.ts#L12)

```ts
app.use(cors());
```

Cela autorise tous les sites à appeler l'API depuis un navigateur. Avec des tokens Bearer, le risque est différent d'une authentification par cookie, mais l'origine doit être restreinte en production.

### 14. Absence de gestionnaire d'erreurs global

**Gravité : moyenne**  
**Emplacement :** [backend/src/index.ts](backend/src/index.ts#L19-L25)

Il n'y a pas de middleware d'erreur centralisé pour harmoniser les erreurs Prisma, Multer, validation et authentification. Les erreurs peuvent produire des réponses incohérentes ou révéler des détails internes.

### 15. Politique de suppression des relations non explicitée

**Gravité : moyenne**  
**Emplacements :** [backend/prisma/schema.prisma](backend/prisma/schema.prisma#L17-L23), [backend/prisma/schema.prisma](backend/prisma/schema.prisma#L39-L46)

Certaines relations utilisent `RESTRICT`, tandis que les commentaires et likes d'un post sont supprimés en cascade. Il faut définir explicitement la politique métier pour la suppression d'un utilisateur : cascade, anonymisation, soft delete ou interdiction.

## Schéma Prisma et cycle de vie des données

### 16. Modèles Prisma sans traçabilité complète des changements

**Gravité : moyenne pour l'audit et la gouvernance, variable pour la sécurité**  
**Emplacement :** [backend/prisma/schema.prisma](backend/prisma/schema.prisma#L10-L75)

Le schéma contient déjà `createdAt DateTime @default(now())` sur `User`, `Post` et `Comment`, mais pas sur `Like` ni `Follow`. Aucun modèle ne possède actuellement `updatedAt` ou `deletedAt`.

Ces champs ne constituent pas à eux seuls une protection de sécurité, mais leur absence rend plus difficile :

- l'audit de la création et de la modification des données ;
- l'investigation après une action abusive ;
- la détection d'une modification inattendue ;
- la mise en place d'une conservation contrôlée des données ;
- la restauration ou l'analyse après une suppression.

Pour les modèles métier persistants, le socle recommandé est généralement :

```prisma
createdAt DateTime  @default(now())
updatedAt DateTime  @updatedAt
deletedAt DateTime?
```

`createdAt` doit être présent sur chaque modèle si l'application doit pouvoir ordonner ou auditer les événements. `updatedAt` permet de connaître la dernière modification et `@updatedAt` est géré automatiquement par Prisma lors des mises à jour Prisma. `deletedAt` doit rester nullable et représente une suppression logique : une valeur `null` signifie que l'enregistrement est actif.

**Points d'attention :**

- `@updatedAt` ne remplace pas une journalisation complète : il ne conserve pas l'auteur de la modification ni l'historique des anciennes valeurs ;
- des mises à jour SQL directes ou effectuées en dehors de Prisma peuvent ne pas appliquer le comportement attendu de `@updatedAt` ;
- ajouter `deletedAt` sans adapter les requêtes ne protège rien : les endpoints doivent filtrer les éléments supprimés (`where: { deletedAt: null }`) ;
- les suppressions, commentaires et likes doivent vérifier qu'une ressource parente n'est pas supprimée avant toute nouvelle écriture ;
- les règles d'autorisation doivent traiter un objet supprimé comme inexistant, généralement avec une réponse `404` ;
- les jobs de nettoyage définitif doivent être séparés, documentés et protégés contre une suppression prématurée ;
- les contraintes uniques existantes, comme `User.email`, peuvent rester bloquées par des comptes supprimés si une politique de réinscription est attendue ;
- pour `Like` et `Follow`, un `updatedAt` peut être peu utile si ces relations sont immuables, mais `createdAt` reste utile pour l'audit et la modération.

**Exemple d'intégration :**

```prisma
model Post {
	id        String    @id @default(cuid())
	content   String
	imageUrl  String?
	authorId  String
	createdAt DateTime  @default(now())
	updatedAt DateTime  @updatedAt
	deletedAt DateTime?

	author   User      @relation(fields: [authorId], references: [id])
	comments Comment[]
	likes    Like[]
}
```

Cette évolution doit être accompagnée d'une migration, de filtres communs pour les lectures et d'une décision explicite sur les relations : cascade immédiate, conservation des données liées, anonymisation ou suppression logique.

## Script de génération d'images

### 17. Écrasement silencieux de fichiers publics

**Gravité : faible à moyenne selon l'environnement**  
**Emplacement :** [backend/scripts/generate-images.ts](backend/scripts/generate-images.ts#L30-L43)

Le script écrit directement dans `backend/public/seed-images` et réutilise des noms déterministes comme `img-01.jpg`. `toFile` remplace les fichiers existants sans demander de confirmation.

Ce n'est pas une faille distante dans l'état actuel du script, car le chemin et les couleurs sont codés en dur et le script n'est pas une route HTTP. C'est toutefois un risque d'intégrité si la commande est exécutée par erreur, dans une CI partagée ou avec un workspace compromis : des assets servis publiquement peuvent être remplacés sans contrôle.

**Recommandations :**

- réserver cette commande au développement ou à une étape de build explicitement identifiée ;
- générer dans un répertoire temporaire puis publier les fichiers après validation complète ;
- vérifier avant écrasement que les fichiers existants sont bien des fichiers générés par le script, ou utiliser un répertoire de sortie dédié ;
- ne jamais rendre ce script appelable depuis une route ou une entrée utilisateur ;
- éviter de stocker dans ce répertoire des uploads utilisateurs ou des fichiers générés par d'autres processus.

### 18. Échec non géré et génération partielle

**Gravité : faible, avec impact opérationnel**  
**Emplacement :** [backend/scripts/generate-images.ts](backend/scripts/generate-images.ts#L27-L46)

La fonction asynchrone est appelée sans `await` ni gestionnaire `.catch()` :

```ts
generateImages();
```

Une erreur de création du dossier ou d'écriture d'une image peut donc produire une génération partielle et un processus qui ne signale pas proprement l'échec à l'appelant ou à la CI, selon la version de Node.js et la configuration d'exécution.

**Remplacement recommandé :**

```ts
generateImages().catch((error: unknown) => {
	console.error("Image generation failed", error);
	process.exitCode = 1;
});
```

Pour une génération fiable, il est également préférable de produire tous les fichiers dans un répertoire temporaire, puis de les déplacer après succès complet.

### 19. Dépendance de traitement d'image à surveiller

**Gravité : risque de chaîne d'approvisionnement, non démontré dans ce fichier**  
**Emplacements :** [backend/scripts/generate-images.ts](backend/scripts/generate-images.ts#L3), [backend/package.json](backend/package.json#L28)

Le script dépend de `sharp`, qui repose sur du code natif et des bibliothèques de traitement d'image. Le fichier ne traite pas d'images fournies par un utilisateur, donc aucun risque de parsing distant n'est démontré ici. En revanche, une version vulnérable de `sharp` ou de ses dépendances transitives pourrait affecter l'environnement qui exécute le script.

**Recommandations :**

- conserver le lockfile et vérifier les mises à jour de sécurité ;
- exécuter régulièrement `npm audit` et les outils de suivi de dépendances ;
- exécuter ce script avec des permissions minimales ;
- éviter d'introduire ultérieurement des fichiers d'entrée contrôlés par l'utilisateur sans limites de taille et de format.

Le script ne présente pas, en l'état, de traversée de chemin ou d'injection directe : le chemin de sortie et les noms de fichiers ne proviennent pas d'une entrée externe.

## Plan de remédiation recommandé

L'ordre ci-dessous tient compte de la dépendance entre les corrections : il faut d'abord empêcher l'usurpation et l'accès non autorisé, puis fiabiliser les données et enfin traiter les améliorations d'exploitation et de gouvernance.

### Priorité 1 : bloquer les compromissions

- [ ] Supprimer le secret JWT par défaut et charger la configuration avant les modules qui l'utilisent.
- [ ] Ajouter une expiration, un algorithme explicite, un issuer et une audience aux JWT.
- [ ] Mettre en place une révocation ou une version de session pour les tokens sensibles.
- [ ] Remplacer les `any` du contexte JWT et de la requête Express par des types et des guards runtime.
- [ ] Vérifier la propriété des posts et commentaires avant suppression.
- [ ] Ne jamais exposer `password` dans les réponses Prisma, y compris via les relations `author`.
- [ ] Valider les uploads, limiter leur taille et générer les noms côté serveur.

### Priorité 2 : garantir l'intégrité des données

- [ ] Ajouter `@@unique([postId, userId])` pour empêcher les likes dupliqués.
- [ ] Ajouter `createdAt` aux modèles `Like` et `Follow`.
- [ ] Ajouter `updatedAt DateTime @updatedAt` aux modèles qui peuvent être modifiés.
- [ ] Décider quels modèles utilisent `deletedAt DateTime?` et documenter la politique de suppression.
- [ ] Filtrer systématiquement les enregistrements avec `deletedAt` non nul.
- [ ] Empêcher les commentaires et likes sur des posts supprimés.
- [ ] Ajouter une migration Prisma et tester les contraintes avec une base représentative.
- [ ] Ajouter la validation des entrées et des limites de longueur.
- [ ] Traiter explicitement les ressources absentes avec des réponses `404`.

### Priorité 3 : réduire les abus et améliorer l'exploitation

- [ ] Ajouter du rate limiting sur l'authentification et les mutations.
- [ ] Remplacer bcrypt synchrone par bcrypt asynchrone.
- [ ] Ajouter pagination, limites de taille et agrégations pour les posts, commentaires et likes.
- [ ] Corriger les codes HTTP d'erreur (`400`, `401`, `404`, `409`).
- [ ] Ajouter un gestionnaire d'erreurs global sans exposer les détails internes.
- [ ] Restreindre CORS aux origines autorisées.
- [ ] Ajouter Helmet et les en-têtes HTTP de sécurité.
- [ ] Définir la politique de suppression des relations Prisma : cascade, conservation, anonymisation ou suppression logique.
- [ ] Éviter l'écrasement silencieux des assets dans `generate-images.ts`.
- [ ] Faire échouer proprement le script de génération si une image ne peut pas être écrite.
- [ ] Vérifier régulièrement `sharp` et ses dépendances transitives avec le lockfile et les outils d'audit.

## Limites de cette revue

Cette revue est principalement statique et porte sur les trois fichiers backend initiaux, le schéma Prisma et le script de génération d'images. Le frontend, la configuration de production, le reverse proxy, les secrets réellement déployés, les dépendances transitives et les réponses HTTP en environnement réel n'ont pas été audités complètement.
