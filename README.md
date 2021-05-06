# HeroBranch, la branch de déploie pre-Heroku !

Cette branche est faite pour être la dernière étape avant de faire un:

```bash
git push heroku HeroBranch:main
```

Dans ce ReadMe nous allons expliquer tout ce qu'il faut faire pour que celà se passe bien !

## Push sur Heroku
### Heroku Toolbelt
Premièrement il faut la CLI (Command Line Interface) de Heroku, on l'appelle aussi l'Heroku Toolbelt.

Pour ça, en fonction de l'OS sur lequel vous êtes vous avez plusieurs choix possible.

Pour Debian/La VM de l'UVSQ il suffit de faire
```bash
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
```

Pour les autres OS, allez voir sur:
https://devcenter.heroku.com/articles/heroku-cli

### Set Heroku comme branche distante
Pour push sur Heroku c'est relativement simple, il suffit d'ajouter Heroku comme branche distante avec la commande.

```bash
heroku git:remote -a awsquizz
```

### Push
```bash
git push heroku HeroBranch:main
```

## Heroku et mes craintes
Ne sachant pas encore 100% comment Heroku fonctionne je ne sais pas si vous pouvez push sur Heroku sans faire partie de ma team, ça serait relativement étonnant d'ailleurs.

En présentiel on verra si vous pouvez et si non on va se faire une Heroku Team.

Une fois la team crée, vous pourrez vous login avec la commande
```bash
heroku login
```
Ca vous permettra d'avoir accès à l'app awsquizz.

## Travailler en local avec Heroku
Normalement sans team ça devrait passer
Il suffit de lancer 
```bash
heroku local web
```
puis
```bash
heroku open
```
Pour ouvrire la page d'acceuille du site.
Vu qu'on en a pas ça ouvre juste https://awsquizz.herokuapp.com/ avec rien dessus.

Pour l'instant faut naviguer par url, les deux pages qui sont sur le serveur sont:
- https://awsquizz.herokuapp.com/signUpBeta
- https://awsquizz.herokuapp.com/createQuestion

## La DB
Sur Heroku on utilise le clearDB add-on, c'est à dire qu'on a une clearDB qui nous est attribuée. Le plan est gratuit donc c'est pas incroyable ce qu'on a (10 connections max et 5 MB de storage) mais bon, c'est gratuit !

Pour la monitorer, personnellement j'utilise MySQL Workbench 8.0 CE pour windows.

J'vais mettre ici les identifiants de connection, en clair, dans un dépôt git public. 
C'est une super idée.

```bash
host: 'eu-cdbr-west-01.cleardb.com',
user: 'b18bd6b4e35f99',
password: 'd317e611',
database: 'heroku_ba0a838a03c77b3'
```
