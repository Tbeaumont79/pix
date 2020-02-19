#language: fr
Fonctionnalité: Campagne

  Contexte:
    Étant donné que les données de test sont chargées

  Scénario: Je rejoins mon parcours prescrit
    Étant donné que je vais sur Pix
    Et je suis connecté à Pix en tant que "Daenerys Targaryen"
    Lorsque je vais sur la page d'accès à une campagne
    Et je saisis "NERA" dans le champ
    Lorsque je clique sur "Commencer mon parcours"
    Alors je vois la page de "presentation" de la campagne
    Lorsque je clique sur "Je commence"
    Alors je vois la page de "didacticiel" de la campagne

  Scénario: Je rejoins mon parcours prescrit via l'URL sans être connecté
    Étant donné que je vais sur Pix
    Lorsque je vais sur la campagne "WALL" avec l'identifiant "1er bataillon"
    Alors je vois la page de "presentation" de la campagne
    Lorsque je clique sur "Je commence"
    Et je clique sur "connectez-vous à votre compte"
    Et je me connecte avec le compte "daenerys.targaryen@pix.fr"
    Alors je vois la page de "didacticiel" de la campagne

  Scénario: Je rejoins mon parcours prescrit restreint
    Étant donné que je vais sur Pix
    Et je suis connecté à Pix en tant que "Daenerys Targaryen"
    Et je vais sur la page d'accès à une campagne
    Lorsque je saisis "WINTER" dans le champ
    Et je clique sur "Commencer mon parcours"
    Alors je vois la page de "rejoindre" de la campagne
    Lorsque je saisis mon prénom "Daenerys"
    Lorsque je saisis mon nom "Targaryen"
    Lorsque je saisis ma date de naissance 23-10-1986
    Et je clique sur "C'est parti !"
    Alors je vois la page de "presentation" de la campagne
    Lorsque je clique sur "Je commence"
    Alors je vois la page de "didacticiel" de la campagne

  Scénario: Je rejoins mon parcours prescrit restreint en étant connecté via un organisme externe
    Étant donné que je vais sur Pix via un organisme externe
    Et je vais sur la page d'accès à une campagne
    Lorsque je saisis "WINTER" dans le champ
    Et je clique sur "Commencer mon parcours"
    Alors je vois la page de "rejoindre" de la campagne
    Lorsque je saisis ma date de naissance 23-10-1986
    Et je clique sur "C'est parti !"
    Alors je vois la page de "presentation" de la campagne
    Lorsque je clique sur "Je commence"
    Alors je vois la page de "didacticiel" de la campagne
