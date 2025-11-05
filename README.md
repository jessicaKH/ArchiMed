# 🩺 ArchiMed — Démonstration d’Architecture Médicale Connectée

ArchiMed est un projet pédagogique développé dans le cadre du cours **Architecture logicielle**.  
Il illustre un **pipeline de données complet** pour la simulation d’un **bracelet médical connecté** capable de mesurer le rythme cardiaque, de détecter des crises, et d’envoyer une **alerte automatique** au médecin via un serveur SMS.

---

## ⚙️ Architecture globale

Le système repose sur **7 services conteneurisés** orchestrés via **Docker Compose** :

```

🩸 BraceletSimulator (Node.js)
↓  (Websocket)
📦 BoitierServer (Node.js)
↓   ↳ Envoi de SMS en cas d'alerte
📦 Broker Kafka
↓
☁️ CloudBackend (NestJS)
↓ analyse, filtrage et stockage des données
📦 InfluxDB
↓
☁️ web-backend (NestJS)
↓ (HTTP)
📊 FrontVisualizer (Vite + React)
→ visualisation temps réel des BPM et alertes

````

---

## Contributing

Pour contribuer au projet, il suffit de créer un fork du repository et d'ouvrir une Pull Request une fois votre implémentation terminée. Notre équipe fera une review de votre PR et elle sera merge si celle-ci correspond aux standards de développement du projet.

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
./build-and-start.sh
```

Cette commande construit tous les services, et l'architecture complète du projet.

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

1. Le **bracelet** mesure un BPM toutes les secondes et envoie une moyenne toutes les 10 secondes.
2. Toutes les 40 secondes, il simule une **crise cardiaque (BPM ≈ 180)**.
3. Le **boîtier** relaie ces données au **broker kafka**.
4. Le **cloud** récupère les valeurs du kafka et les enregistre dans l'influxDB si celles-ci sont valides
5. Le backend de l'interface web récupère les données de la DB à la demande du client web.

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


## 👩‍💻 Auteur

Projet porté par **Camille Antonios, Hajar El Gholabzouri, Jessica Kahungu, Gauthier Martin & Amélie Muller**.

---
