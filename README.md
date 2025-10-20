# 🩺 ArchiMed — Démonstration d’Architecture Médicale Connectée

ArchiMed est un projet pédagogique développé dans le cadre du cours **Architecture logicielle**.  
Il illustre un **pipeline de données complet** pour la simulation d’un **bracelet médical connecté** capable de mesurer le rythme cardiaque, de détecter des crises, et d’envoyer une **alerte automatique** au médecin via un serveur SMS.

---

## ⚙️ Architecture globale

Le système repose sur **5 services conteneurisés** orchestrés via **Docker Compose** :

```

🩸 BraceletSimulator (Java)
↓  (HTTP)
📦 BoitierServer (Node.js)
↓  (HTTP)
☁️ CloudBackend (NestJS + Prisma + SQLite)
↳ analyse des données, détection de crise, log et alerte
↓  (HTTP)
📱 SmsMock (Express)
→ simule l’envoi d’un SMS d’urgence
↓
📊 FrontVisualizer (Vite + React)
→ visualisation temps réel des BPM

````

---

## 🧩 Description rapide des modules

| Service | Technologie | Rôle |
|----------|--------------|------|
| **bracelet-simulator** | Java 17 + Maven | Simule un bracelet connecté : génère des valeurs de BPM chaque seconde et envoie les données au boîtier. Si le BPM dépasse 150, il envoie immédiatement une alerte. |
| **boitier-server** | Node.js (TypeScript) | Reçoit les données du bracelet et les transfère au serveur cloud. |
| **cloud-backend** | NestJS + Prisma + SQLite | Reçoit, stocke et analyse les BPM. Si une crise est détectée (BPM > 150), il appelle le serveur SMS. |
| **sms-mock** | Express (Node.js) | Simule un service d’envoi de SMS — affiche dans la console les numéros et le message d’alerte. |
| **front-visualiser** | React + Vite + Nginx | Interface graphique du médecin : affiche la courbe de BPM reçue depuis le backend. |

---

## 🚀 Lancer le projet

### 🐳 1. Prérequis
- [Docker Desktop](https://www.docker.com/) installé et en cours d’exécution  
- (Optionnel) [Git](https://git-scm.com/) pour cloner le dépôt

### 📦 2. Cloner le dépôt
```bash
git clone https://github.com/jessicaKH/ArchiMed.git
cd ArchiMed
````

### ▶️ 3. Lancer la démo

```bash
docker-compose up --build
```

Cette commande :

* construit tous les services,
* démarre automatiquement le pipeline complet.

### ⏱️ 4. Attendre le démarrage

Tu verras apparaître :

```
[SMS] Running on port 7000
[Boîtier] Running on port 5000
[Cloud] Backend running on port 3005
[Bracelet] BPM: ...
```

---

## 🩸 Scénario de démonstration

1. Le **bracelet** envoie un BPM toutes les secondes.
2. Toutes les 20 secondes, il simule une **crise cardiaque (BPM ≈ 180)**.
3. Le **boîtier** relaie ces données au **serveur cloud**.
4. Le **cloud** détecte la crise (`bpm > 150`) et envoie une requête vers le **serveur SMS**.
5. Le **SMS mock** affiche dans la console :

   ```
   [SMS SERVER] Would send SMS to +33612345678: "Alerte BPM=182"
   ```
6. Le **frontend** ([http://localhost:5173](http://localhost:5173)) affiche la courbe des BPM en temps réel.

---

## 📊 Visualisation

Accède à l’interface :
👉 [http://localhost:5173](http://localhost:5173)

Tu verras la courbe de rythme cardiaque :

* fluctuations normales (60–100 BPM)
* pics soudains correspondant aux crises (≥ 170 BPM)

---

## 🧠 Points techniques démontrés

* Architecture microservices & communication inter-conteneurs
* Séparation claire des rôles (IoT → Edge → Cloud → Notification)
* Gestion d’un **pipeline de données médicales** simulé
* Intégration NestJS + Prisma pour le stockage & analyse
* Conteneurisation complète via Docker Compose
* Simulation d’événements temps réel et d’alertes critiques

---

## 🧰 Commandes utiles

| Action                   | Commande                                       |
| ------------------------ | ---------------------------------------------- |
| Lancer le projet         | `docker-compose up --build`                    |
| Arrêter le projet        | `docker-compose down`                          |
| Voir les logs            | `docker-compose logs -f`                       |
| Relancer un seul service | `docker-compose up --build bracelet-simulator` |

---

## 🩵 Exemple de log attendu

```
[Bracelet] ⚠️ CRISE DÉTECTÉE BPM=182
[Boîtier] Received BPM: 182
[Cloud] ⚠️ CRISE DÉTECTÉE !
[Cloud] SMS alert sent with status 200
[SMS SERVER] Would send SMS to +33612345678: "Alerte BPM=182"
```


## 👩‍💻 Auteur

Projet porté par **Camille Antonios, Hajar El Gholabzouri, Jessica Kahungu, Gauthier Martin & Amélie Muller**.

---
