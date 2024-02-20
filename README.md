# SilberPfoten

SilberPfoten ist die Nachbarschaftshilfe für Senioren und ihre Tiere. Ausgezeichnet mit dem Deutschen Tierschutzpreis, dem Deutschen Engagementpreis und dem Tierschutzpreis Baden-Württemberg.

### Du bist herzlich Willkommen ...
.. beim SilberPfoten Projekt, der Nachbarschaftshilfe für Senioren und ihre geliebten Tiere! Wir freuen uns sehr über dein Interesse und Engagement, Teil dieses preisgekrönten Projekts zu werden, das bereits mit dem Deutschen Tierschutzpreis, dem Deutschen Engagementpreis und dem Tierschutzpreis Baden-Württemberg ausgezeichnet wurde.

SilberPfoten setzt sich leidenschaftlich für das Wohlbefinden von Senioren und ihren tierischen Begleitern ein. Dein Beitrag als Entwickler ist von unschätzbarem Wert, um die digitale Seite dieses Projekts weiterzuentwickeln und zu optimieren.

Ob du bereits Erfahrung in der Entwicklung von Anwendungen für soziale Projekte hast oder gerade erst in die Welt der gemeinnützigen Softwareentwicklung eintauchst – hier findest du eine inspirierende Umgebung, in der jede Idee zählt. Gemeinsam können wir innovative Lösungen schaffen, um die Lebensqualität älterer Menschen und ihrer Tiere zu verbessern.

Wir laden dich ein, deine Fähigkeiten und Kreativität einzubringen, sei es in der App-Entwicklung, der Benutzerfreundlichkeit, der Sicherheit oder anderen relevanten Bereichen. Dein Beitrag wird einen direkten Einfluss auf die Gemeinschaft haben und dazu beitragen, dass Senioren und ihre Tiere die Unterstützung erhalten, die sie benötigen.

## Weiterentwicklung
Du willst an dem Projekt mitwirken? Dann bitten wir dich folgendes zu beachten:

**Neue Tickets** können hier eröffnet werden https://github.com/TSV-Stuttgart/mein.silberpfoten.de/issues/new

**Neuentwicklungen und Bug-Fixes** darfst du uns gerne über einen neuen Merge-Request zukommen lassen. Bitte beachte, dass es zu jedem Merge-Request ein Ticket geben muss.

## Lokale Entwicklungsumgebung
Zum Starten der lokalen Entwicklungsumgebung benötigst du:
1. Docker und Docker Compose https://docs.docker.com/engine/install/
2. Node.js https://nodejs.org
3. Eine `.env.local` Datei mit folgendem Inhalt:

```sh
EMAIL_HOST=smtp.provider.de
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=meine@emailadresse.de
EMAIL_PASS=*****
NEXTAUTH_SECRET=******
NEXT_PUBLIC_HOST=http://localhost:3000
PGDATABASE=postgres
PGPASSWORD=postgres
PGPORT=5432
PGUSER=postgres
JWT_SECRET=MYSECRET
```

4. Starte die Docker Container

```sh
# start
docker-compose -f docker-compose.dev.yml up --detach

# stop
docker-compose -f docker-compose.dev.yml down --remove-orphans --volumes --rmi=all
```

5. Starte die Anwendung mit `yarn dev`
6. Öffne die lokale Anwendung auf http://localhost:3000