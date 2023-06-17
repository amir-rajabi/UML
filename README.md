## LINKS
todos: https://docs.google.com/spreadsheets/d/128ToeKJUO-rZcMXk5bAOppTXJHs30mdFSz-yu5_1URE/edit#gid=0
milestone presentation: https://docs.google.com/presentation/d/1SL-duqA5HIOCD0AuGBo_jJ9eiIqQ4VWo91K07jfmLDw/edit#slide=id.g25316d8211d_0_0

## IDEE

Wir bauen die Webapp mit HTML/CSS/JS. Dabei dient die backend.py als Webserver, der die Webapp hostet. Der Webserver dient als Schnittstelle zwischen dem ML-Modell und dem UI. 
Bei Änderungen durch den User auf der Benutzeroberfläche wird ein JSON-Paket durch ein Ajax-Request von JS an den Webserver gesendet. Der Webserver erhält die Daten und kann diese Anpassungen dann am Modell vornehmen. 
Außerdem ist der Webserver dafür zuständig, neue Daten vom Modell von der Datenbank zu beziehen und per Websocket an den Client zu senden. 
Die Kommunikation zwischen webserver und training.py kann unverändert erfolgen.


## FLASK
Der Webserver wird mithilfe von Flask betrieben. Flask ist ein leichtgewichtiges Web-Framework für die Entwicklung von Webanwendungen in Python. 
Flask benötigt eine bestimmte Ordnerstruktur. **Die Ordnerstruktur und dessen Namen müssen zwingend wie gegeben bleiben!**
```
root
|
|----static
|       |----node_modules
|
|----templates
|       |----index.html
|
|----webserver.py
```

### static
Der static-Ordner in Flask wird verwendet, um statische Dateien wie CSS-Dateien, JavaScript-Dateien, Bilder und andere Ressourcen zu speichern, die von den Webseiten einer Flask-Anwendung verwendet werden. Innerhalb des static Ordners kann eine beliebige Ordnerstruktur vorliegen. Der in static liegende Ordner node_modules beinhaltet JavaScript-basierte Entwicklungstools und -bibliotheken, wie in unserem Fall z.B. chart.js und bootstrap.

### templates
Der templates-Ordner beinhaltet lediglich die .html Dateien. Im Normalfall also nur eine index.html. Ich habe in dem Code jedoch Unterteilungen in verschiedene "Codeschnipsel" gemacht und diese in verschiedene Dateien ausgelagert, um eine bessere Übersichtlichkeit zu gewährleisten.

### webserver.py
Diese Datei beinhaltet alle Funktionen, des Webservers. Von hier aus startet auch der Webserver.

#### Verwendung:
Zur Verwendung muss flask installiert sein. Navigiere dazu in deine conda-Umgebung und installiere flask mit:
```
pip install flask flask_socketio
```
Alternativ die Umgebung mithilfe der env.yml aktualisieren:

1. 
```
conda activate UML
```
2. 
```
conda env update --file env.yml
```

## JAVASCRIPT und deren Erweiterungen

### chart.js
Als Darstellung der Daten kann chart.js verwendet werden. Es ist eine gut zu bedienendes und sehr anpassbare Bibliothek zur Erstellung von Diagrammen jeglicher Art. Graphen von Chart.js sind im laufenden Prozess aktualisierbar.
Link: https://www.chartjs.org/

### bootstrap
Zur Erleichterung können von bootstrap, ähnlich wie bei Streamlit, fertige Elemente eingebunden werden. Also zum Beispiel slider oder buttons etc. 
Link: https://getbootstrap.com/docs/5.3/forms/range/ (Beispiel des Sliders)


## grundlegende SOFTWARESTRUKTUR
```
                            |-------|
                            |  DOM  |
                            |-------|
                                |
                                |
                          |------------|                            
                          | javascript |
                          |------------|
                                |
                                |  AJAX + websocket
------------------------------  |  -----------------------------------------
                                |  
                        |-----------------|                     |-----------|
                        | FLASK webserver |---------------------| Datenbank |
                        |-----------------|                     |-----------|
                                |                                       |
                            |--------|                                  |
                            | worker |                                  |
                            |--------|                                  |
                                |                                       |
                          |-------------|                               |
                          | training.py |-------------------------------|
                          |-------------|
```