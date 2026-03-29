# 🌙 NightQuizz - Front-Office

Bienvenue dans le front-office de **NightQuizz**, la plateforme interactive ultime pour créer, animer et participer à des quiz en direct.

## 🚀 Technologies Utilisées

- **Framework** : [Next.js 14+](https://nextjs.org/) (App Router)
- **UI & Design** : [Material UI (MUI)](https://mui.com/)
- **Gestion d'État** : [Zustand](https://github.com/pmndrs/zustand)
- **Appels API** : [Axios](https://axios-http.com/)
- **Sécurité** : `jwt-decode` pour la gestion des rôles à partir du payload JWT.
- **Typage** : TypeScript (Strict Mode)

## 🏗️ Architecture : Atomic Design

Le projet suit le pattern **Atomic Design** pour assurer une modularité et une réutilisabilité maximale :

```text
src/
  ├── components/
  │     ├── atoms/       # Boutons, Inputs, Chips (Composants de base)
  │     ├── molecules/   # QuizCard (Groupements d'atomes)
  │     ├── organisms/   # Header, QuestionCard, AuthForm (Unités complexes)
  │     └── templates/   # AuthenticatedLayout, AuthTemplate (Mise en page)
  ├── app/               # Next.js App Router (Pages et API routes)
  ├── store/             # Zustand Stores (Auth, etc.)
  ├── theme/             # MUI Theme Registry & Configuration
  ├── types/             # Definitions TypeScript centralisées
  └── lib/               # Instance Axios et utilitaires
```

## ✨ Fonctionnalités Clés

- **Authentification complète** : Login, Register, Logout avec redirection automatique.
- **Dashboard Utilisateur** : Gestion des quizz personnels (CRUD).
- **Details de Quizz** : Gestion fine des questions et des choix (QCM, Choix multiples, Vrai/Faux).
- **Gestion de Profil** : Mise à jour des informations personnelles (email/password).
- **🛡️ Mode Admin** : 
  *   Accès protégé via `RouteGuard`.
  *   Gestion des utilisateurs (Modfication de rôle : `admin`, `user`).
  *   Suppression globale d'utilisateurs et de quizz.
- **✨ Design Premium** : Dark mode cosmétique (Landing Page), animations fluides et respect de la charte graphique NightQuizz.
- **🔒 Route Guards** : Protection des pages privées via le composant `AuthenticatedLayout`.

## 🛠️ Installation et Lancement

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

3. **Se connecter au Backend** :
   Le front-office utilise un proxy configuré dans `next.config.ts` pour rediriger les appels `/api/*` vers le backend local (`http://localhost:3010`). Assure-toi que le backend tourne sur ce port.

## 📝 Scripts Disponibles

- `npm run dev` : Lance l'application en mode développement sur `localhost:3000`.
- `npm run build` : Génère un build de production optimisé.
- `npm run start` : Lance le build de production.
- `npm run lint` : Vérifie la qualité du code (ESLint).

---
Développé avec ❤️ par l'équipe NightQuizz.
