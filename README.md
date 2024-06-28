Schritt-für-Schritt-Anleitung zum Starten der Applikation

Schritt 1: Docker Desktop starten
Download und Installation:
Gehen Sie zur Docker Desktop-Downloadseite.
Laden Sie die Installationsdatei für Ihr Betriebssystem herunter (Windows oder Mac).
Führen Sie die Installationsdatei aus und folgen Sie den Anweisungen auf dem Bildschirm.

Docker Desktop starten:
Nach der Installation finden Sie das Docker-Symbol auf Ihrem Desktop oder in Ihrer Anwendungsliste.
Doppelklicken Sie auf das Docker-Symbol, um Docker Desktop zu starten.
Warten Sie, bis Docker vollständig hochgefahren ist und das Symbol in der Taskleiste erscheint.

Schritt 2: Visual Studio Code öffnen
Download und Installation:
Gehen Sie zur Visual Studio Code-Downloadseite.
Laden Sie die Installationsdatei für Ihr Betriebssystem herunter (Windows, Mac, oder Linux).
Führen Sie die Installationsdatei aus und folgen Sie den Anweisungen auf dem Bildschirm.

Visual Studio Code öffnen:
Nach der Installation finden Sie das Visual Studio Code-Symbol auf Ihrem Desktop oder in Ihrer Anwendungsliste.
Doppelklicken Sie auf das Symbol, um die Anwendung zu starten.

Schritt 3: GitHub-Repository klonen
Visual Studio Code öffnen:
Starten Sie Visual Studio Code und gehen Sie zur Startseite.
Klicken Sie auf "Clone Git Repository..."
Repository-URL eingeben:

Geben Sie die URL des GitHub-Repositories ein: 

          https://github.com/SimTommy/Neue_Datenbankkonzepte_WDH 

und drücken Sie Enter.

Speicherort auswählen:
Wählen Sie den Zielordner auf Ihrem lokalen Rechner aus, in dem das Repository geklont werden soll, und klicken Sie auf "Select as Repository Destination".

Schritt 4: Repository öffnen und Autoren vertrauen
Repository öffnen:
Nach dem erfolgreichen Klonen des Repositories erscheint ein Dialogfeld. Klicken Sie auf "Open", um das geklonte Repository zu öffnen.

Autoren vertrauen:
Visual Studio Code wird Sie fragen, ob Sie den Autoren der Dateien in diesem Ordner vertrauen. Wählen Sie "Yes, I trust the authors", um alle Funktionen zu aktivieren.

Schritt 5: Terminal öffnen und Docker-Container starten
Terminal in Visual Studio Code öffnen:
Klicken Sie auf "Terminal" im oberen Menü und wählen Sie "New Terminal" aus, um ein neues Terminal-Fenster zu öffnen.

Docker-Compose-Befehl ausführen:

Navigieren Sie im Terminal in das Verzeichnis, in dem sich die docker-compose.yml-Datei befindet (Beim Öffnen des Terminals sind Sie im richtigen Verzeichnis. Das Verzeichnis muss das Verzeichnis über dem backend- und frontend-Ordner sein).

Führen Sie den folgenden Befehl aus, um die Docker-Container zu bauen und zu starten:

          docker-compose up --build

Docker Desktop überprüfen:
Öffnen Sie Docker Desktop und überprüfen Sie, ob die Container laufen. Sie sollten mehrere Container sehen, die gestartet wurden.

Anwendung aufrufen:
Sobald die Container laufen, können Sie die Anwendung im Browser unter http://localhost:3000/ aufrufen.

Docker-Container stoppen:
Sobald Sie mit der Arbeit fertig sind, können Sie die Docker-Container stoppen, indem Sie im Terminal Strg + C drücken.
Um die Container vollständig zu entfernen, führen Sie den folgenden Befehl im Terminal aus:

docker-compose down



GitHub

git add . --> add files for upload
git commit -m "message" --> Make the files ready for upload
git push origin main --> Upload to GitHub
