# Mise en route du serveur

## MàJ des softs

### Verifier que vous avez node et npm

Pour afficher la version de node
``` 
node -v
```
Pour afficher la version de npm
``` 
npm -v
```

### Si bash ne vous retourne pas un numéro de version:

Mise à jour générale
```
sudo apt-get update
```
Installation node
```
sudo apt-get install node
```
Installation npm
```
sudo apt-get install npm
```

## Récupération du code et des dépendences

Si vous lisez ceci vous avez probablement déjà accès au dépot mais sait-on jamais:

```
git clone https://github.com/mohamedtlb/JsProject.git
```

On se met dans le dossier du projet
```
cd JsProject
```

Passez sur la branche active de test:
```
git checkout DBtest
```

Telechargement des dépendences:
```
npm install
```

## Comme je suis actuellement un idiot
### Création de la BD

Lancer le script DBtest.js avec node
```
node DBtest
```
Arreter le script avec Ctrl+c

Allez sur phpMyAdmin se connecter avec:
```
user: root
pswrd: user
```

Aller sur la BDD "mydb", onglet importer.
Importer le fichier quiz_educatif.sql et l'exécuter.

# Lancer le serveur

On démarre le serveur avec:
```
node App
```

Pour se connecter à la page de sign Up (la seule page actuellement) on va a l'addresse:
```
localhost:3000/signUpBeta
```

Et paf.
