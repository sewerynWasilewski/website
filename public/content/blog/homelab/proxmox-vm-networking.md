---
title: "Proxmox VM Networking Notes"
date: "2026-03-15"
excerpt: "A few lessons learned while setting up bridges, NAT and internal networks in Proxmox."
technologies: ["proxmox", "linux"]
weight: 1
---

Setting up networking in Proxmox is one of those things that seems simple until you need more than a flat LAN. Here are the patterns I use most.

## The Default: Linux Bridge

Every VM connects to a Linux bridge (`vmbr0` by default). The bridge is the layer-2 switch — VMs on the same bridge talk directly, traffic to the outside world goes through the host's physical NIC.

```
Physical NIC (enp3s0)
      │
   vmbr0  ←── bridge
   /    \
 VM1    VM2
```

```bash
# /etc/network/interfaces
auto vmbr0
iface vmbr0 inet static
    address 192.168.1.100/24
    gateway 192.168.1.1
    bridge-ports enp3s0
    bridge-stp off
    bridge-fd 0
```

## Isolated Internal Network

For VMs that shouldn't be reachable from the LAN (e.g. a database tier), create a bridge with **no physical ports**:

```bash
auto vmbr1
iface vmbr1 inet static
    address 10.10.0.1/24
    bridge-ports none
    bridge-stp off
    bridge-fd 0
```

VMs on `vmbr1` can only talk to each other and to the Proxmox host. Add NAT on the host if they need internet access:

```bash
iptables -t nat -A POSTROUTING -s 10.10.0.0/24 -o vmbr0 -j MASQUERADE
```

## VLANs

If your switch supports 802.1q, you can trunk VLANs through a single physical port and create per-VLAN bridges on Proxmox:

```bash
auto enp3s0.10
iface enp3s0.10 inet manual

auto vmbr10
iface vmbr10 inet manual
    bridge-ports enp3s0.10
    bridge-stp off
    bridge-fd 0
```

## Lessons Learned

- Always test networking changes with a console session open — it's easy to accidentally cut off SSH access.
- `bridge-fd 0` disables the forwarding delay; skip this on production switches but it's fine for a homelab.
- Use `ip route` and `ip link` to debug — `ifconfig` lies.
