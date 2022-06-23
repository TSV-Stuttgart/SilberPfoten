# SilberPfoten

## Lokale Entwicklungsumgebung

### Starten und Stoppen von Docker Compose mit Keycloak

```sh
# start
docker-compose -f docker-compose.dev.yml up --detach

# stop
docker-compose -f docker-compose.dev.yml down --remove-orphans --volumes
```

## Hetzner
Bevor wir die Server mit Terraform initialisieren können, benötigen wir ein Image welches auf `Ubuntu 20.04` mit `docker` basiert.
Dazu erstllen wir einen Server in hetzner Cloud welcher auf `Ubuntu 20.04` basiert. Dann melden wir uns in einem neuaufgesetzten Server an über SSH und installieren Docker.
Vond em fertigen Server erstellen wir ein Snapshot. Dem Snapshit ein Laben `type/ubuntu_20_04_docker` geben, fertig.

## Server Infrastruktur mit Terraform
| Beschreibung | elem |
| --- | --- |
| 1 x CX11 Server


### Initialisieren
Verzeichnis wechseln nach `cd ./terraform`

```sh
terraform init
```

### Infrastruktur planen

```sh
terraform plan
```

### Infrastruktur erstellen

```sh
terraform apply
```
