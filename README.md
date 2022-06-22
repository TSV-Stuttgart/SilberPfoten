# SilberPfoten

## Lokale Entwicklungsumgebung

### Starten und Stoppen von Docker Compose mit Keycloak

```sh
# start
docker-compose -f docker-compose.dev.yml up --detach

# stop
docker-compose -f docker-compose.dev.yml down --remove-orphans --volumes
```

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
