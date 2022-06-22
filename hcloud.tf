# Set the variable value in *.tfvars file
# or using the -var="hcloud_token=..." CLI option
variable "hcloud_token" {}

# Configure the Hetzner Cloud Provider
provider "hcloud" {
  token = "${var.hcloud_token}"
}

resource "hcloud_network" "network" {
  name = "network"
  ip_range = "10.0.0.0/16"
}

resource "hcloud_network_subnet" "network-subnet" {
  type = "cloud"
  network_id = hcloud_network.network.id
  network_zone = "eu-central"
  ip_range = "10.0.1.0/24"
}

resource "hcloud_firewall" "firewall-web" {
  name = "firewall-web"

  rule {
    direction = "in"
    protocol = "tcp"
    port = "22"
    source_ips = [
      "37.24.173.245/32"
    ]
  }

  rule {
    direction = "in"
    protocol = "tcp"
    port = "80"
    source_ips = [
      "0.0.0.0/0",
      "::/0"
    ]
  }
}

resource "hcloud_server" "webserver01" {
  name = "webserver01"
  image = "ubuntu-20.04"
  server_type = "cx11"
  location = "nbg1"
  firewall_ids = [hcloud_firewall.firewall-web.id]
  ssh_keys = [hcloud_ssh_key.scoletti.id]
  
  network {
    network_id = hcloud_network.network.id
    ip = "10.0.1.5"
  }

  depends_on = [
    hcloud_network_subnet.network-subnet
  ]
}

# data "hcloud_image" "ubuntu_20_04_docker" {
#   with_selector = "type=ubuntu_20_04_docker"
# }

# resource "hcloud_server" "webserver02" {
#   name = "webserver02"
#   image = data.hcloud_image.ubuntu_20_04_docker.id
#   server_type = "cx11"
#   location = "nbg1"
#   firewall_ids = [hcloud_firewall.firewall-web.id]
#   ssh_keys = [hcloud_ssh_key.scoletti.id]
  
#   network {
#     network_id = hcloud_network.network.id
#     ip = "10.0.1.6"
#   }

#   depends_on = [
#     hcloud_network_subnet.network-subnet
#   ]
# }

resource "hcloud_ssh_key" "scoletti" {
  name = "MacBook Pro Sandro"
  public_key = file("~/.ssh/id_ed25519.pub")
}