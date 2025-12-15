---
sidebar_position: 2
title: "Chapter 7: How to Set Up Networking"
description: "Learn how to set up public and private networking, access private networks securely, and manage service communication in microservice architectures using DNS, VPCs, bastion hosts, and service meshes."
---

import { ProcessFlow, StackDiagram, CardGrid, ComparisonTable, TreeDiagram, ConnectionDiagram, colors } from '@site/src/components/diagrams';

# Chapter 7. How to Set Up Networking

In Chapter 6, you learned how to split your deployments into multiple environments and how to split your codebase into multiple services.

Both actions rely heavily on networking—namely, services need to be able to talk to other services over the network, and environments need to be isolated from one another so they can't talk to each other over the network.

**In plain English:** Networking is like a postal system for computers - it delivers messages between machines while controlling who can talk to whom.

**In technical terms:** Networking plays two key roles: connectivity (enabling communication between services) and security (isolating environments and controlling access).

**Why it matters:** Every production app needs networking. Misconfigurations cause 80% of production outages. Understanding networking is essential for building reliable, secure systems.

In this chapter, you'll go deeper into networking, learning the high-level concepts you need in order to connect and secure your applications.

> **Insight**
>
> Master DNS, VPCs, and security groups - they cause the majority of networking issues in production systems.

## Table of Contents

1. [Public Networking](#1-public-networking)
   - [Public IP Addresses](#11-public-ip-addresses)
   - [Domain Name System](#12-domain-name-system)
   - [Example: Register and Configure a Domain Name in Amazon Route 53](#13-example-register-and-configure-a-domain-name-in-amazon-route-53)
2. [Private Networking](#2-private-networking)
   - [Physical Private Networks](#21-physical-private-networks)
   - [Virtual Private Networks](#22-virtual-private-networks)
   - [Example: Create a VPC in AWS](#23-example-create-a-vpc-in-aws)
3. [Accessing Private Networks](#3-accessing-private-networks)
   - [Castle-and-Moat Model](#31-castle-and-moat-model)
   - [Zero Trust Architecture](#32-zero-trust-architecture)
   - [SSH](#33-ssh)
   - [RDP](#34-rdp)
   - [VPN](#35-vpn)
4. [Service Communication in Private Networks](#4-service-communication-in-private-networks)
   - [Service Discovery](#41-service-discovery)
   - [Service Communication Protocol](#42-service-communication-protocol)
   - [Service Mesh](#43-service-mesh)

## 1. Public Networking

Just about everything you've deployed so far in this book has been accessible directly over the public internet.

For example, you were able to access the EC2 instance you deployed in Chapter 1 by using a public IP address like 3.22.99.215, and the load balancer you deployed in Chapter 3 by using a domain name like xx.us-east-2.elb.amazonaws.com.

Where did that IP and domain name come from, and how do they work? That's the focus of this section.

<ConnectionDiagram
  title="Network Topology Overview"
  description="The flow from client to services through public and private networks"
  nodes={[
    { id: 'client', label: 'User Device', type: 'client', x: 100, y: 100 },
    { id: 'dns', label: 'DNS Server', type: 'server', x: 300, y: 100 },
    { id: 'lb', label: 'Load Balancer\n(Public IP)', type: 'loadbalancer', x: 500, y: 100 },
    { id: 'app1', label: 'App Server 1\n(Private IP)', type: 'server', x: 400, y: 250 },
    { id: 'app2', label: 'App Server 2\n(Private IP)', type: 'server', x: 600, y: 250 },
  ]}
  connections={[
    { from: 'client', to: 'dns', label: 'DNS lookup', bidirectional: false },
    { from: 'client', to: 'lb', label: 'HTTP request', bidirectional: false },
    { from: 'lb', to: 'app1', label: 'Forward', bidirectional: true },
    { from: 'lb', to: 'app2', label: 'Forward', bidirectional: true },
  ]}
/>

### 1.1. Public IP Addresses

**In plain English:** An IP address is like a phone number for computers - it identifies where to send messages on the internet.

**In technical terms:** The Internet Protocol (IP) provides a set of rules for routing and addressing data across networks. IP addresses identify endpoints on the network and specify locations for routing traffic.

**Why it matters:** Every device on the internet needs an IP address. Understanding how they work is fundamental to networking.

Just about the entire internet runs on top of the Internet Protocol (IP), which is a set of rules for routing and addressing data across networks.

The first major version of IP, IPv4, which has been around since the 1980s, remains the dominant protocol today. Its successor, IPv6, started rolling out around 2006 and is gradually gaining adoption.

IP addresses are a central part of IP. Each address identifies one endpoint on the network and specifies the location of that endpoint so you can route traffic to it.

**IPv4 characteristics:**
- 32-bit numbers
- Displayed as four groups of decimal digits (e.g., 11.22.33.44)
- Only 2³² (roughly 4 billion) possible unique addresses
- We've had far more than 4 billion internet-connected devices for a long time

**IPv6 characteristics:**
- 128-bit addresses
- Displayed as eight groups of hexadecimal digits (e.g., 2001:0db8:85a3:0000:0000:8a2e:0370:7334)
- 2¹²⁸ (roughly 340 undecillion) possible unique addresses
- Unlikely to ever run out

> **Warning**
>
> IPv6 adoption worldwide is still under 50%. Many older networking devices don't support IPv6, so adoption takes a long time, as it requires updating software and hardware across thousands of devices and networks around the world.

Therefore, most of what you do with networking for now, and most of what this chapter focuses on, will be IPv4.

#### How to get a public IP address

The Internet Assigned Numbers Authority (IANA) owns all public IP addresses and assigns them in a hierarchical manner:

1. **Top level:** IANA delegates blocks of IP addresses to internet registries that cover specific regions of the world
2. **Regional level:** These registries delegate blocks to network operators within their region (ISPs, cloud providers, enterprise companies)
3. **Device level:** Network operators assign IPs to specific devices

For example:
- When you sign up for an internet connection at home with an ISP, that ISP assigns you an IP address from its block of IPs
- When you deploy EC2 instances in AWS, AWS assigns you an IP address from its block of IPs

> **Key Takeaway #1**
>
> You get public IP addresses from network operators such as cloud providers and ISPs.

IP addresses are a fundamental building block of the internet, and they work well for computers talking to other computers, but they aren't particularly human-friendly.

If the only way to access your servers was to memorize a bunch of random numbers that may change from time to time, the internet and World Wide Web probably wouldn't have made it very far.

Fortunately, we have the Domain Name System.

### 1.2. Domain Name System

**In plain English:** DNS is like a phone book for the internet - it translates human-friendly names (like google.com) into computer-friendly IP addresses (like 172.253.116.139).

**In technical terms:** The Domain Name System (DNS) is a globally distributed hierarchy of nameservers that stores the mapping from domain names to IP addresses.

**Why it matters:** Without DNS, you'd have to memorize IP addresses for every website you visit. DNS makes the internet usable for humans.

The Domain Name System (DNS) is a service that allows you to use a memorable, consistent, human-friendly domain name instead of an IP address to access a web service.

For example, you can use www.google.com instead of 172.253.116.139 to access Google's servers.

#### How DNS resolution works

When you enter a fully qualified domain name (FQDN) such as www.google.com into your web browser, here is how that FQDN is resolved:

<ProcessFlow
  title="DNS Resolution Process"
  description="How domain names are converted to IP addresses"
  steps={[
    {
      name: 'Query DNS Resolver',
      description: 'Your computer asks resolver',
      example: 'ISP or cloud provider DNS',
      color: colors.blue
    },
    {
      name: 'Query Root Nameservers',
      description: 'Resolver asks for TLD',
      example: '13 known IP addresses for .com',
      color: colors.purple
    },
    {
      name: 'Query TLD Nameservers',
      description: 'Get authoritative nameservers',
      example: 'IANA provides google nameservers',
      color: colors.yellow
    },
    {
      name: 'Query Authoritative Nameservers',
      description: 'Get DNS records',
      example: 'A records with IPv4 addresses',
      color: colors.green
    },
    {
      name: 'Return IP Address',
      description: 'Browser connects to server',
      example: 'Use IP from A record',
      color: colors.orange
    }
  ]}
/>

**DNS record types:**
- **A records:** Store IPv4 addresses
- **AAAA records:** Store IPv6 addresses
- **CNAME records:** Store aliases for a domain name
- **TXT records:** Store arbitrary text

Going through so many rounds of requests to get some DNS records may seem inefficient, but DNS is typically pretty fast, and a lot of caching occurs along the way (e.g., your browser, OS, and DNS resolver may cache records for a period of time to reduce the number of lookups).

> **Key Takeaway #2**
>
> DNS allows you to access web services via memorable, human-friendly, consistent names.

#### How to register a domain name

So that's how DNS records are looked up, but how do they get there in the first place? Who decides who owns what domain?

As with most things related to the internet, this also goes back to IANA, which owns and manages all domain names.

IANA delegates the management of these domain names to accredited registrars, who are allowed to sell domain names to end users.

The registrars are often (but not always) the same companies that run authoritative name servers, such as Route 53, GoDaddy, and Namecheap.

Note that, technically, you never own a domain name. You can only lease it, for which you pay an annual fee. If you stop paying that fee, the registrar can lease it to someone else.

Once you lease a domain name, you then have permissions to configure the DNS records for that domain in its authoritative nameservers, which allows users all over the world to access your servers via that domain name.

DNS is a beautiful, scalable system, and getting your first domain name working can feel magical. Let's try out an example of this magic by registering and configuring a domain name in Route 53.

### 1.3. Example: Register and Configure a Domain Name in Amazon Route 53

In this section, you'll deploy a web app and set up a domain name for it.

We'll use Route 53 as the domain name registrar, and the web app will be a simple HTTP server running on several EC2 instances that respond with Hello, World!

This involves three steps: register a domain name, deploy EC2 instances, and configure DNS records.

#### Register a domain name

The first step is to register a domain name. Although you'll manage most of your infrastructure as code in this book, registering domain names involves multiple manual steps, so I typically do it using a web UI.

> **Warning: Registering Domain Names Costs Money!**
>
> While most of the examples in this book are part of the AWS free tier, registering domain names is not. The pricing varies based on the domain name you register. For example, as of 2025, most .com addresses cost $14 per year.

**Registration steps:**

1. Head to the Route 53 dashboard
2. Choose "Register a domain," and click "Get started"
3. Use the search box to find a domain name that is available for purchase
4. Once you've found a domain name that you like and is available, click Select to add it to your cart
5. Scroll to the bottom of the page, and click "Proceed to checkout"
6. Decide for how many years you want to register your domain, and if you want the registration to auto-renew
7. Click Next
8. Fill out the contact details for the domain

IANA requires every domain to have contact details, and anyone can look up the contact details for any domain by using whois.

If you want to keep your details private, at the bottom of the contact details page, you can choose to enable privacy protection to have Amazon list its own contact details on the domain, forwarding any messages about your domain to you while keeping your contact details private.

Once you've filled in the contact details, click Next, and you'll see a summary page where you can review what you're buying, agree to the terms and conditions, and click Submit to start the registration process.

The registration process takes 5–30 minutes, so be patient. You can monitor the process on the registration requests page.

During this process, Route 53 will send a confirmation email to the address you put on the contact details page. Once you get this email, click the link within it to confirm you own the email address.

When the registration process is complete, find your domain on the registered domains page, click it, and in the Details section, you should see a list of name servers.

When you register a domain in Route 53, it automatically configures its own servers as the authoritative nameservers for that domain. Route 53 also automatically creates a hosted zone for the domain, which is the container for the DNS records for that domain.

#### Deploy EC2 instances

The next step is to deploy some EC2 instances to run the "Hello, World" web app. Head into the folder where you've been working on the code samples for this book and create a new folder for this chapter, and within that, a new OpenTofu root module called ec2-dns:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch7/tofu/live/ec2-dns
$ cd ch7/tofu/live/ec2-dns
```

Within the ec2-dns root module, you can create several EC2 instances by using a module called ec2-instances. This module is similar to the OpenTofu code you wrote in Chapter 2 to deploy an EC2 instance, except the ec2-instances module can deploy multiple EC2 instances, and it allows you to specify the user data script to run.

To use this module, create a file called main.tf in the ec2-dns folder:

```hcl
provider "aws" {
  region = "us-east-2"
}

module "instances" {
  source = "brikis98/devops/book//modules/ec2-instances"
  version = "1.0.0"

  name           = "ec2-dns-example"
  num_instances  = 3  # Deploy three EC2 instances
  instance_type  = "t2.micro"
  ami_name       = "sample-app-packer-*"  # Use the sample-app AMI from Chapter 3
  http_port      = 8080  # Allow HTTP requests on port 8080
  user_data      = file("${path.module}/user-data.sh")  # Run user data script
}
```

For a user data script, copy the one from the asg-sample root module in Chapter 3, which uses PM2 to fire up the Node.js "Hello, World!" app:

```bash
$ cp ../../../../ch3/tofu/live/asg-sample/user-data.sh .
```

Finally, create outputs.tf with the contents to output the public IP addresses of the EC2 instances:

```hcl
output "instance_ips" {
  description = "The IPs of the EC2 instances"
  value       = module.instances.public_ips
}
```

Deploy as usual, authenticating to AWS, and running init and apply:

```bash
$ tofu init
$ tofu apply
```

When apply completes, you should see the IP addresses of the instances in the instance_ips output variable. Give the instances a minute or two to boot up, copy one of the IP addresses, and check that the web app is working:

```bash
$ curl http://3.145.172.12:8080
Hello, World!
```

#### Configure DNS records

Now that you have a web app running on several servers, you can point your domain name at them by adding the following code to the ec2-dns module:

```hcl
data "aws_route53_zone" "zone" {
  # TODO: fill in your own domain name!
  name = "fundamentals-of-devops-example.com"
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.zone.id

  # TODO: fill in your own domain name!
  name    = "www.fundamentals-of-devops-example.com"
  type    = "A"  # This is an A record, which points to IPv4 addresses
  records = module.instances.public_ips  # Point at the EC2 instance IPs
  ttl     = 300  # Set TTL to 300 seconds (5 minutes)
}
```

This code adds a DNS A record to your Route 53 hosted zone. The TTL (time to live) specifies the amount of time that DNS resolvers should cache the record.

Increasing the TTL will reduce latency for your users and load on your DNS server, but updates will take longer to take effect.

Add the domain name as an output variable in outputs.tf:

```hcl
output "domain_name" {
  description = "The domain name for the EC2 instances"
  value       = aws_route53_record.www.name
}
```

Run apply one more time. When it completes, test your domain name:

```bash
$ curl http://www.<YOUR-DOMAIN>:8080
Hello, World!
```

You can get more insight by using the dig command:

```bash
$ dig www.<YOUR-DOMAIN>
```

The answer section should show the IP addresses of your EC2 instances. If that's what you see, congrats, you just configured a domain name for your web app!

When you're done testing and experimenting, commit your code, and run tofu destroy to clean everything up.

> **Get Your Hands Dirty**
>
> Here are a few exercises you can try at home to go deeper:
>
> - This code uses individual EC2 instances so you could see an example of a standard DNS A record with individual IP addresses. Try deploying an ALB and configure an alias record, a nonstandard DNS extension, for the ALB.
> - Redirect your root domain (e.g., foo.com) to a subdomain (e.g., www.foo.com) so you don't inadvertently issue cookies that can be read by all subdomains.
> - Enable DNS Security Extensions (DNSSEC) for your domain to protect it from forged or manipulated DNS data.

You've now seen how to manage public IP addresses and public domain names, but it's important to understand that not everything should be publicly accessible over the internet.

One reason is that there aren't enough IP addresses in the world for everything to be public. Another reason is security.

Many devices are not locked down enough to be exposed publicly. As a result, a huge portion of networking is private, which is the focus of the next section.

## 2. Private Networking

**In plain English:** Private networking is like building walls around your house - it creates a protected space where only authorized people can enter.

**In technical terms:** Private networks are set up by organizations solely for that organization's use, locked down so they can be accessed only by authorized individuals from within that organization.

**Why it matters:** Defense in depth. Multiple layers of security ensure you're never one mistake away from a disaster. Private networks add a critical security layer.

Private networking is part of a defense-in-depth strategy, which establishes multiple, redundant layers of security.

Consider a medieval castle with its moat, concentric walls, gates, towers, keeps, soldiers, and traps. If one layer failed, you could fall back to the others and still stay safe.

You should design your software architecture similarly, with multiple layers of defense.

For example, the servers you've deployed so far throughout this book have all been accessible over the public internet. All that kept them safe are the firewalls (security groups) that block access to all ports by default.

This is a pretty thin layer of protection. All it takes is one mistake, one port open that shouldn't be, and your servers may become vulnerable.

If one person making a mistake is all it takes to cause a security incident, the fault isn't with that person but with the way you've set up your security.

> **Key Takeaway #3**
>
> Use a defense-in-depth strategy to ensure that you're never one mistake away from a disaster.

A more secure approach is to deploy just about all your servers into private networks. These networks are set up by organizations solely for that organization's use, such as office, university, data center, and home networks.

Typically, private networks are locked down so they can be accessed only by authorized individuals from within that organization.

**Advantages of private networks:**

- **Defense in depth:** Servers in private networks have at least two layers of protection - first, a malicious actor would have to be able to get into your private network, and second, they would then have to find a vulnerability in a server
- **Isolate workloads:** Private networks give you a way to isolate different types of workloads (e.g., different products, teams, data stores, application servers)
- **Better control and monitoring:** Private networks give you fine-grained control over routing, including managing traffic patterns for north-south traffic (between your servers and the outside world) and east-west traffic (between servers within your network)

> **Key Takeaway #4**
>
> Deploy all your servers into private networks by default, exposing only a handful of locked-down servers to the public internet.

<StackDiagram
  title="VPC Network Structure"
  description="Layered view of VPC with public and private subnets"
  layers={[
    {
      label: 'Internet Gateway',
      color: colors.blue,
      items: ['Public Internet Access']
    },
    {
      label: 'Public Subnet (DMZ)',
      color: colors.green,
      items: ['Load Balancer', 'Bastion Host', 'NAT Gateway']
    },
    {
      label: 'Private Subnet',
      color: colors.purple,
      items: ['App Server 1', 'App Server 2', 'App Server 3']
    },
    {
      label: 'Data Subnet',
      color: colors.red,
      items: ['Database Primary', 'Database Replica', 'Cache']
    }
  ]}
/>

### 2.1. Physical Private Networks

**In plain English:** Physical private networks are like the local network in your office - devices connected by cables to switches and routers that create a separate, isolated network.

**In technical terms:** Physical private networks connect computers through switches and routers, using private IP address ranges, with connectivity rules that control access.

**Why it matters:** Understanding physical networks helps you grasp how virtual networks work in the cloud.

Let's walk through an overview of how physical networks work:

**Connecting computers:**
- Two computers: Easy - single cable
- N computers: Connect all to a single switch (requires only N cables, not N²)
- Multiple networks: Use routers to connect networks

These connected computers form a network. Connecting two networks is easy; you typically do it using routers. Connecting n networks is hard, as you have that n² problem again.

The solution is to connect those routers by using the internet.

The term "internet" is derived from interconnected networks: a network of networks. Many of those networks are private. For example, you might have a private network in your house or a private network in a data center.

Most private networks have several key characteristics:

1. **Only authorized devices may connect to the private network**
2. **The private network uses private IP address ranges**
3. **The private network defines connectivity rules**
4. **Most devices in a private network access the public internet through a gateway**

#### The private network uses private IP address ranges

IPv4 reserves the following IP addresses for private networks (RFC 1918):

**CIDR notation:**
- 10.0.0.0/8
- 172.16.0.0/12
- 192.168.0.0/16

While every public IP address must be unique, these private IPs are used over and over again in just about all private networks.

#### Most devices in a private network access the public internet through a gateway

Devices in a private network are not accessible from the public internet. This is great from a security perspective, but what if those devices need limited access to the internet?

Here are a few of the most common types of gateways:

<CardGrid
  title="Gateway Types"
  description="Common gateway solutions for private networks"
  cards={[
    {
      title: 'Load Balancers',
      description: 'Inbound traffic',
      items: [
        'Route public internet requests',
        'To app servers in private network',
        'Provide single public endpoint',
        'Distribute traffic across servers'
      ],
      color: colors.blue
    },
    {
      title: 'NAT Gateway',
      description: 'Outbound traffic',
      items: [
        'Network address translation',
        'Requests originating in private network',
        'Routed out to public internet',
        'Hides private IP addresses'
      ],
      color: colors.green
    },
    {
      title: 'Forward Proxy',
      description: 'Controlled outbound',
      items: [
        'Specialized NAT gateway',
        'Outbound requests only to trusted endpoints',
        'Carefully managed whitelist',
        'Enhanced security control'
      ],
      color: colors.purple
    },
    {
      title: 'ISP Router',
      description: 'Home network',
      items: [
        'Router from your ISP',
        'Configures itself as NAT gateway',
        'Allows home devices internet access',
        'Single public IP for many devices'
      ],
      color: colors.yellow
    }
  ]}
/>

**Gateway benefits:**

1. Allow devices in a private network to talk to public networks
2. Hide the devices in the private network, providing a layer of protection
3. Share one or a small number of public IP addresses among thousands of devices

### 2.2. Virtual Private Networks

**In plain English:** Virtual networks are like imaginary cables and switches in the cloud - you configure them entirely in software rather than dealing with physical equipment.

**In technical terms:** Software-defined networking that cloud providers offer, allowing you to create isolated networks (VPCs) with configurable subnets, route tables, and firewalls - all managed through code.

**Why it matters:** In the cloud, you control virtual networks rather than physical networks. Understanding VPCs is essential for cloud deployments.

If you deploy into the cloud, the cloud provider has already taken care of all the physical networking for you. What you can control is a virtual network, which you configure entirely in software (which is why it's sometimes referred to as software-defined networking).

#### Virtual networks in the cloud

Each cloud provider offers slightly different networking features, but they typically have the following basic characteristics in common:

<ProcessFlow
  title="Virtual Network Components"
  description="Building blocks of cloud virtual networks"
  steps={[
    {
      name: 'Create VPC',
      description: 'Virtual Private Cloud',
      example: 'Isolated network in the cloud',
      color: colors.blue
    },
    {
      name: 'Add Subnets',
      description: 'Network subdivisions',
      example: 'IP ranges like 10.0.0.0/24',
      color: colors.green
    },
    {
      name: 'Assign IPs',
      description: 'Resources get IPs from subnet',
      example: 'Auto-assigned from subnet range',
      color: colors.purple
    },
    {
      name: 'Configure Routes',
      description: 'Route tables control traffic',
      example: 'Public vs. private subnet routing',
      color: colors.yellow
    },
    {
      name: 'Block with Firewalls',
      description: 'Security groups, ACLs',
      example: 'Allow/deny specific traffic',
      color: colors.orange
    },
    {
      name: 'Add Gateways',
      description: 'Access public internet',
      example: 'Internet gateway, NAT gateway',
      color: colors.red
    }
  ]}
/>

#### Virtual networks in orchestration tools

Some orchestration tools create their own virtual network, such as Kubernetes networking and Red Hat OpenShift Networking.

This is because many orchestration tools are designed to work in any data center or cloud, and to be able to solve the core orchestration problems that involve networking in a way that's portable, these tools create their own virtual networks.

> **Insight**
>
> If you're using an orchestration tool that has its own virtual network, you're going to have to integrate two sets of networking technologies: one from the orchestration tool, and one from your data center or cloud provider.

### 2.3. Example: Create a VPC in AWS

Here you'll create a custom VPC in AWS and deploy some EC2 instances into it. This VPC will have the following configuration:

- **IP address range:** 10.0.0.0/16 (one of the private IP address ranges from RFC 1918)
- **Public subnet:** Directly accessible from the public internet (a DMZ)
- **Private subnet:** Not directly accessible from the public internet

To use the vpc module, create a new OpenTofu root module called vpc-ec2:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch7/tofu/live/vpc-ec2
$ cd ch7/tofu/live/vpc-ec2
```

Inside the vpc-ec2 folder, create main.tf:

```hcl
provider "aws" {
  region = "us-east-2"
}

module "vpc" {
  source = "brikis98/devops/book//modules/vpc"
  version = "1.0.0"

  name       = "example-vpc"
  cidr_block = "10.0.0.0/16"
}
```

By itself, a VPC doesn't do much, so let's deploy some EC2 instances into it. Update main.tf to deploy an EC2 instance in the public subnet:

```hcl
module "public_instance" {
  source = "brikis98/devops/book//modules/ec2-instances"
  version = "1.0.0"

  name          = "public-instance"
  num_instances = 1
  instance_type = "t2.micro"
  ami_name      = "sample-app-packer-*"
  http_port     = 8080
  user_data     = file("${path.module}/user-data.sh")
  vpc_id        = module.vpc.vpc.id
  subnet_id     = module.vpc.public_subnet.id
}
```

Copy the user data script from Chapter 3:

```bash
$ cp ../../../../ch3/tofu/live/asg-sample/user-data.sh .
```

Now update main.tf to deploy an instance in the private subnet:

```hcl
module "private_instance" {
  source = "brikis98/devops/book//modules/ec2-instances"
  version = "1.0.0"

  name          = "private-instance"
  num_instances = 1
  instance_type = "t2.micro"
  ami_name      = "sample-app-packer-*"
  http_port     = 8080
  user_data     = file("${path.module}/user-data.sh")
  vpc_id        = module.vpc.vpc.id
  subnet_id     = module.vpc.private_subnet.id
}
```

Create outputs.tf:

```hcl
output "public_instance_public_ip" {
  description = "The public IP of the public instance"
  value       = module.public_instance.public_ips[0]
}

output "public_instance_private_ip" {
  description = "The private IP of the public instance"
  value       = module.public_instance.private_ips[0]
}

output "private_instance_public_ip" {
  description = "The public IP of the private instance"
  value       = module.private_instance.public_ips[0]
}

output "private_instance_private_ip" {
  description = "The private IP of the private instance"
  value       = module.private_instance.private_ips[0]
}
```

Deploy the vpc-ec2 module:

```bash
$ tofu init
$ tofu apply
```

When apply completes, you should see the private IP addresses for both instances, as well as the public IP of the public instance, but not the public IP of the private instance (it'll be an empty string).

This is not a bug; since you deployed the private instance into a private subnet, that instance shouldn't have a public IP address!

To see whether the instances are working, make an HTTP request to the public IP and port 8080 of the public instance:

```bash
$ curl http://3.144.105.254:8080
Hello, World!
```

If that works, congrats, you now have an instance successfully running in a custom VPC!

> **Get Your Hands Dirty**
>
> Here are a few exercises you can try at home to go deeper:
>
> - Update the VPC module to deploy a NAT gateway so that resources running in the private subnet can access the public internet.
> - Update the VPC module to deploy each type of subnet (public and private) across multiple AZs so that your architecture is resilient to the failure of a single AZ.

## 3. Accessing Private Networks

**In plain English:** Private networks are secure because they block outside access - but you still need a way for authorized users to get in.

**In technical terms:** Secure, controlled access to private networks can be achieved through two primary approaches: the castle-and-moat model and zero trust architecture.

**Why it matters:** You need to balance security (keeping bad actors out) with accessibility (letting authorized users in). The access model you choose fundamentally impacts your security posture.

Deploying a server in a private network ensures that you can't access that server directly from the public internet. This is mostly a good thing, but if you can't access those servers either, that's a problem.

Fortunately, there are ways to grant secure, controlled access to your private networks. Broadly speaking, there are two primary ways to do this: the castle-and-moat model and the zero trust architecture.

### 3.1. Castle-and-Moat Model

**In plain English:** The castle-and-moat model is like a gated community - once you get past the guard at the gate, you can move freely inside.

**In technical terms:** A security model based on a secure perimeter (walls, moat, drawbridge) with a soft interior. It's hard to get into the network, but once you're inside, you have relatively free access.

**Why it matters:** This was the traditional approach for many years, but it has significant security weaknesses in modern, distributed environments.

The traditional approach used at many companies for managing access to private networks is the castle-and-moat model, based on the analogy to a castle with a secure perimeter (walls, moat, drawbridge, etc.), and a soft interior.

It's hard to get into the castle, but once you're inside, you have free rein to move around.

A common solution is to deploy a bastion host. In a fortress, a bastion is a structure designed to stick out of the wall, allowing for more reinforcement and extra armaments.

In a network, a bastion host is a server designed to be visible outside the network (in the DMZ), with extra hardening and monitoring.

The idea is that you keep the vast majority of your servers private, with the network acting as a secure perimeter, and you use the bastion host as the sole entry point to that network.

### 3.2. Zero Trust Architecture

**In plain English:** Zero trust is like airport security - everyone gets checked at every checkpoint, even if you're already inside the terminal.

**In technical terms:** A security model based on "never trust, always verify." You never trust a user or device just because they have access to a location on the network. Every connection requires authentication and encryption.

**Why it matters:** Modern environments (remote work, cloud, BYOD) make the old perimeter-based security obsolete. Zero trust adapts to this reality.

The castle-and-moat approach originated in a world where you had a physical network in an office, you had to physically be in the office to access the network, and you had to use a company computer.

In short, your location on the network mattered.

This is increasingly not the world we live in, as many networks are virtual, many employees work remotely, and many personal devices need to connect to the network.

This has led to the rise of zero trust architecture (ZTA), which is based on the concept of "never trust, always verify": you never trust a user or device just because they have access to a location on the network.

**Core principles of ZTA:**

- **Authenticate every user:** Every connection requires the user to authenticate, typically using SSO and MFA
- **Authenticate every device:** You can connect from any device, as long as you've gone through the company's processes to install security controls
- **Encrypt every connection:** All network communication must be over encrypted channels
- **Define policies for authentication and authorization:** Each piece of software in the network can define policies indicating who is allowed to access that software
- **Enforce least-privilege access controls:** You get access only to the resources you absolutely need to do your specific task
- **Continuously monitor and validate:** The assumption with ZTA is that you're constantly under attack, so you need to continuously log and audit all traffic

> **Key Takeaway #5**
>
> In the castle-and-moat model, you create a strong network perimeter to protect all the resources in your private network; in the zero trust architecture, you create a strong perimeter around each individual resource.

Zero trust isn't a single tool you adopt, but something you integrate into every part of your architecture, including user and device management, infrastructure access, and service communication.

### 3.3. SSH

**In plain English:** SSH is like a secure telephone line to a remote computer - you can execute commands as if you were sitting right at that computer.

**In technical terms:** Secure Shell (SSH) is a client-server protocol that uses public-key cryptography for authentication and encryption, allowing you to connect to a computer over the network to execute commands.

**Why it matters:** SSH is the standard way to access servers remotely. Understanding SSH is essential for managing infrastructure.

Secure Shell (SSH) is a client-server protocol that allows you to connect to a computer over the network to execute commands.

For example, when a developer connects to a bastion host over SSH, they get a remote terminal where they can run commands and access the private network.

SSH is ubiquitous and generally considered a mature and secure protocol. Under the hood, SSH uses public-key cryptography for authentication and encryption.

#### How to use SSH

**Configure the client:**

1. Create a public- and private-key pair
2. Store the private key securely on your computer, so only you can access it

**Configure one or more servers:**

1. Run SSH as a background process (daemon), typically using the sshd binary
2. Update the server's firewall to allow SSH connections, typically on port 22
3. Configure who is allowed to authenticate by adding their public key to the authorized keys file

Now you can use the SSH client to connect to the server, and get a terminal where you can run commands as if you were sitting directly at that server.

#### Example: SSH bastion host in AWS

Let's update the VPC example so you can access both instances over SSH using an EC2 key pair.

> **Warning: EC2 Key Pairs Are Not Recommended in Production**
>
> This example uses EC2 key pairs so you can try an idiomatic SSH experience. However, AWS supports associating only a single, permanent, manually managed EC2 key pair with each EC2 instance during provisioning, so I don't recommend using this mechanism as your primary SSH key-management strategy in production. Instead, you should use tools like EC2 Instance Connect, Teleport, or Tailscale.

Head to the EC2 key pair page and click "Create key pair." Enter a name, leave all other settings at their defaults, and click "Create key pair."

AWS will prompt you to download the private key to your computer. Save it in a secure location, such as your ~/.ssh folder.

Next, add a passphrase to the private key:

```bash
$ ssh-keygen -p -f <KEYPAIR>.pem
```

Set the permissions so only your OS user can access it:

```bash
$ chmod 400 <KEYPAIR>.pem
```

Update main.tf in the vpc-ec2 root module to specify the name of your key pair:

```hcl
module "public_instance" {
  key_name = "<YOUR_KEYPAIR_NAME>"  # TODO: fill in your EC2 key pair name
  # ... (other params omitted) ...
}

module "private_instance" {
  key_name = "<YOUR_KEYPAIR_NAME>"  # TODO: fill in your EC2 key pair name
  # ... (other params omitted) ...
}
```

Deploy these changes:

```bash
$ tofu apply
```

Grab the public IP address of the public instance and SSH to the server:

```bash
$ ssh -i <KEYPAIR>.pem ec2-user@<PUBLIC_IP>
```

After authenticating, you should be connected to the server via SSH. You can now run commands on this EC2 instance. For example, you can test the private instance:

```bash
[ec2-user@ip-10-0-1-26 ~]$ curl <PRIVATE_IP>:8080
Hello, World!
```

Congrats, you're able to access an instance in a private network!

To SSH to the private instance, press Ctrl-D to disconnect, use ssh-agent to manage your keys, and enable agent forwarding:

```bash
$ ssh-add <KEYPAIR>.pem
$ ssh -A ec2-user@<PUBLIC_IP>
```

Then SSH to the private instance:

```bash
[ec2-user@ip-10-0-1-26 ~]$ ssh ec2-user@<PRIVATE_IP>
```

You now have a terminal on the private instance. To disconnect, hit Ctrl-D twice.

> **Get Your Hands Dirty**
>
> Here are a few exercises you can try at home to go deeper:
>
> - Instead of EC2 key pairs, try using EC2 Instance Connect or Session Manager. How do these options compare?
> - Try SSH port forwarding to forward port 8080 on your computer to port 8080 of the private EC2 instance.
> - Try SSH SOCKS proxy to route all traffic via the public EC2 instance.

### 3.4. RDP

**In plain English:** RDP is like using a Windows computer through your screen - you see the full desktop and can use the mouse and keyboard as if you were sitting at that computer.

**In technical terms:** Remote Desktop Protocol (RDP) is a way to connect to a Windows server remotely and manage it via the full Windows UI, providing complete desktop experience over the network.

**Why it matters:** RDP makes Windows servers accessible to non-technical users, but has security vulnerabilities that require careful management.

Remote Desktop Protocol (RDP) is a way to connect to a Windows server remotely and to manage it via the full Windows UI. It's just like being at the computer: you can use the mouse, keyboard, and all the desktop apps.

Being able to use the full Windows UI makes RDP accessible to all roles at a company (not just developers), and it can be a nicer experience than being limited to a terminal.

However, RDP works only with Windows servers, and it is somewhat notorious for security vulnerabilities, so you can't expose it directly to the public internet.

### 3.5. VPN

**In plain English:** A VPN is like a secret tunnel connecting your device to a private network - your device acts as if it's plugged directly into that network, even from anywhere in the world.

**In technical terms:** A virtual private network (VPN) extends a private network across multiple networks or devices. The fact that you're on a VPN is transparent to the software running on those devices.

**Why it matters:** VPNs provide secure access to private networks from any device, anywhere. Essential for remote work and connecting distributed infrastructure.

A virtual private network (VPN) is a way to extend a private network across multiple networks or devices. The fact that you're on a VPN is transparent to the software running on those devices.

The software can communicate with the private network as if the device were plugged physically into the network.

VPN clients are available for almost every OS (including smartphones), allowing you to access private networks from your own devices in a way that's accessible to all roles at a company.

Most VPN tools are built around either IPsec or TLS, two protocols that are generally considered mature and secure.

**VPN use cases:**

- **Connect remote employees to an office or data center network**
- **Connect two data centers together**
- **Hide internet browsing behavior**

## 4. Service Communication in Private Networks

**In plain English:** When you break your app into multiple services, those services need to find and talk to each other - like employees in a large company needing a directory and phone system.

**In technical terms:** Service communication in microservices requires three technical decisions: service discovery (finding endpoints), communication protocol (message format), and service mesh (security, resiliency, observability).

**Why it matters:** As soon as you have multiple services, you need solutions for these problems. The choices you make impact scalability, reliability, and security.

In Chapter 6, you saw that a common way to deal with problems of scale is to break the codebase into multiple services that are deployed independently and communicate with one another by sending messages over the network.

To support service communication, you'll have to make three technical decisions:

1. **Service discovery:** How does one service figure out the endpoint(s) to use for another service?
2. **Service communication protocol:** What is the format of the messages that services send to one another?
3. **Service mesh:** How do you handle security, resiliency, observability, and traffic management?

### 4.1. Service Discovery

**In plain English:** Service discovery is like a phone book for your services - when Service A needs to call Service B, it looks up Service B's current address and phone number.

**In technical terms:** The process by which services determine the IP addresses and ports of other services, despite those addresses frequently changing as services scale up/down and move between servers.

**Why it matters:** Every microservices architecture needs a service discovery solution. Without it, services can't find and communicate with each other.

As soon as you have one service, A, that needs to talk to another service, B, you have to figure out service discovery: how does A figure out the right IP addresses to use to talk to B?

This can be a challenging problem, as each service may have multiple replicas running on multiple servers, and the number of replicas and which servers they are running on may change frequently.

> **Key Takeaway #6**
>
> As soon as you have more than one service, you will need to figure out a service discovery solution.

<TreeDiagram
  title="Service Discovery Options Hierarchy"
  description="Different approaches to solving service discovery"
  root={{
    label: 'Service Discovery',
    children: [
      {
        label: 'Generic Tools',
        children: [
          { label: 'Configuration Files' },
          { label: 'Load Balancers' },
          { label: 'DNS' }
        ]
      },
      {
        label: 'Purpose-Built Tools',
        children: [
          {
            label: 'Library-Based',
            children: [
              { label: 'Consul Client' },
              { label: 'Eureka' }
            ]
          },
          {
            label: 'Local Proxy',
            children: [
              { label: 'Consul DNS/Template' },
              { label: 'Envoy' },
              { label: 'Kubernetes Service Discovery' }
            ]
          }
        ]
      }
    ]
  }}
/>

#### Service discovery tools

**Generic tools approach:**

- **Configuration files:** Hardcode server IP addresses in configuration files (works if IPs don't change often)
- **Load balancers:** Deploy an internal load balancer in front of your services and hardcode just the endpoints for the load balancer
- **DNS:** Create a DNS record that points to the IP addresses for each service, and use a convention for service discovery

**Purpose-built tools approach:**

- **Library:** Tools like Consul and Eureka come with a service registry and a service discovery library that you incorporate into your application code
- **Local proxy:** Tools like Consul DNS, gRPC with etcd, and Envoy run a local proxy on the same servers as your apps that handles service discovery transparently

<ComparisonTable
  title="Service Discovery Tool Comparison"
  description="Comparing different service discovery approaches"
  items={[
    {
      name: 'Configuration Files',
      criteria: {
        'Manual Error': 'Poor',
        'Update Speed': 'Poor',
        'Scalability': 'Poor',
        'Transparency': 'Fair',
        'Latency': 'Excellent',
        'Performance': 'Excellent',
        'Infrastructure': 'Excellent'
      }
    },
    {
      name: 'Load Balancers',
      criteria: {
        'Manual Error': 'Fair',
        'Update Speed': 'Good',
        'Scalability': 'Fair',
        'Transparency': 'Fair',
        'Latency': 'Poor',
        'Performance': 'Excellent',
        'Infrastructure': 'Poor'
      }
    },
    {
      name: 'DNS',
      criteria: {
        'Manual Error': 'Excellent',
        'Update Speed': 'Fair',
        'Scalability': 'Good',
        'Transparency': 'Excellent',
        'Latency': 'Fair',
        'Performance': 'Excellent',
        'Infrastructure': 'Good'
      }
    },
    {
      name: 'Registry + Library',
      criteria: {
        'Manual Error': 'Excellent',
        'Update Speed': 'Excellent',
        'Scalability': 'Excellent',
        'Transparency': 'Poor',
        'Latency': 'Excellent',
        'Performance': 'Excellent',
        'Infrastructure': 'Poor'
      }
    },
    {
      name: 'Local Proxy',
      criteria: {
        'Manual Error': 'Excellent',
        'Update Speed': 'Excellent',
        'Scalability': 'Excellent',
        'Transparency': 'Excellent',
        'Latency': 'Good',
        'Performance': 'Poor',
        'Infrastructure': 'Poor'
      }
    }
  ]}
/>

### 4.2. Service Communication Protocol

**In plain English:** The communication protocol is like choosing a language for services to speak - they need to agree on how to format messages so they can understand each other.

**In technical terms:** The protocol defines two primary choices: message encoding (how to serialize data) and network encoding (how to send that data over the network).

**Why it matters:** The protocol you choose impacts performance, ease of debugging, client support, and developer productivity.

A big part of breaking your code into services is defining an API for the service. One of the key decisions you'll have to make is the protocol you will use for that API, which consists of two primary choices:

- **Message encoding:** How will you serialize data?
- **Network encoding:** How will you send that data over the network?

#### Common protocols

**REST APIs: HTTP + JSON**
- The de facto standard for building web APIs
- Easy to understand and debug
- Wide client support
- Good ecosystem

**Serialization libraries**
- Protocol Buffers, Cap'n Proto, FlatBuffers
- Define a schema and compile stubs
- More efficient encoding
- Strong typing

**RPC libraries**
- gRPC and Connect
- Designed for remote procedure calls
- Built on Protocol Buffers
- Better performance for internal services

#### Key factors to consider

- **Programming language support:** What languages does your team use?
- **Client support:** What clients does your API need to support?
- **Schema and code generation:** Can you automatically generate client stubs and documentation?
- **Ease of debugging:** How hard is it to test and debug?
- **Performance:** How efficient is the encoding?
- **Ecosystem:** How big is the community and tooling?

> **Insight**
>
> As a general rule, I default to HTTP + JSON for most APIs and consider alternatives only in special cases.

### 4.3. Service Mesh

**In plain English:** A service mesh is like an air traffic control system for microservices - it manages all the communication between services, handling security, routing, and monitoring automatically.

**In technical terms:** A networking layer designed to help manage communication between applications in a microservice architecture by providing a single, unified solution to security, observability, resiliency, and traffic management problems.

**Why it matters:** In large microservices architectures with hundreds of services, a service mesh becomes invaluable for managing complexity without updating every service's code.

A service mesh is a networking layer designed to help manage communication between applications in a microservice architecture by providing a single, unified solution to the following problems:

- **Security:** Enforcing encryption, authentication, and authorization
- **Observability:** Distributed tracing, metrics, and logging
- **Resiliency:** Retries, timeouts, circuit breakers, and rate limiting
- **Traffic management:** Load balancing, canary deployments, and traffic mirroring

Almost all of these are problems of scale. If you have only two or three services, a service mesh may be unnecessary overhead.

If you have hundreds of services owned by dozens of teams and high load, a service mesh becomes invaluable.

> **Key Takeaway #7**
>
> A service mesh can improve security, observability, resiliency, and traffic management in a microservice architecture, without having to update the application code of each service.

Service mesh tools include Kubernetes-specific options like Linkerd, Istio, and Cilium; managed services like AWS App Mesh and Google Cloud Service Mesh; and platform-agnostic options like Consul service mesh and Kuma.

### 4.4. Example: Istio Service Mesh with Kubernetes Microservices

Istio is a popular service mesh for Kubernetes. Let's see how Istio can help you manage the two microservices you deployed with Kubernetes in Chapter 6.

First, make a copy of those sample apps:

```bash
$ cd fundamentals-of-devops
$ cp -r ch6/sample-app-frontend ch7/
$ cp -r ch6/sample-app-backend ch7/
```

You'll need a Kubernetes cluster. Use the one from Docker Desktop:

```bash
$ kubectl config use-context docker-desktop
```

Download and install the latest Istio release (minimum version 1.22). Use istioctl to install Istio:

```bash
$ istioctl install --set profile=minimal -y
```

Configure Istio to inject its sidecar into all Pods in the default namespace:

```bash
$ kubectl label namespace default istio-injection=enabled
```

Install the sample add-ons including Kiali, Prometheus, Grafana, and Jaeger:

```bash
$ cd istio-<VERSION>
$ kubectl apply -f samples/addons
$ kubectl rollout status deployment/kiali -n istio-system
```

Verify the installation:

```bash
$ istioctl verify-install
```

Deploy the frontend and backend apps:

```bash
$ cd ../sample-app-backend
$ kubectl apply -f sample-app-deployment.yml
$ kubectl apply -f sample-app-service.yml
$ cd ../sample-app-frontend
$ kubectl apply -f sample-app-deployment.yml
$ kubectl apply -f sample-app-service.yml
```

Make a request to the frontend:

```bash
$ curl localhost

<p>Hello from <b>backend microservice</b>!</p>
```

Open the Kiali dashboard to see the traffic visualization:

```bash
$ istioctl dashboard kiali
```

Click Traffic Graph in the left menu to see a visualization of the path your requests take through your microservices.

This shows one of the key benefits of a service mesh: observability.

To add security, create istio/istio-auth.yml:

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: require-mtls
  namespace: default
spec:
  mtls:
    mode: STRICT

---
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: allow-nothing
  namespace: default
spec:
  {}
```

This creates an authentication policy requiring mutual TLS and an authorization policy blocking all service calls by default.

Deploy these policies:

```bash
$ cd ../istio
$ kubectl apply -f istio-auth.yml
```

Now requests to the frontend are rejected. To allow frontend access, update the frontend's kubernetes-config.yml to combine the Deployment, Service, and authentication policies:

```yaml
apiVersion: apps/v1
kind: Deployment
# ... deployment config ...

---
apiVersion: v1
kind: Service
# ... service config ...

---
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: allow-without-mtls
  namespace: default
spec:
  selector:
    matchLabels:
      app: sample-app-frontend-pods
  mtls:
    mode: DISABLE
```

Add a service account and authorization policy:

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: sample-app-frontend-service-account

---
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: sample-app-frontend-allow-http
spec:
  selector:
    matchLabels:
      app: sample-app-frontend-pods
  action: ALLOW
  rules:
  - to:
    - operation:
        methods: ["GET"]
```

Update the backend similarly with its own service account and authorization policy that allows only the frontend to access it:

```yaml
---
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: sample-app-backend-allow-frontend
spec:
  selector:
    matchLabels:
      app: sample-app-backend-pods
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/default/sa/sample-app-frontend-service-account"]
    to:
    - operation:
        methods: ["GET"]
```

Deploy the changes:

```bash
$ kubectl apply -f kubernetes-config.yml
```

Test the frontend:

```bash
$ curl --write-out '\n%{http_code}\n' localhost

<p>Hello from <b>backend microservice</b>!</p>
200
```

Congrats! You now have microservices running in Kubernetes with secure communication via a service mesh.

All communication between services is encrypted, authenticated, and authorized—without modifying the Node.js source code.

> **Get Your Hands Dirty**
>
> Here are a few exercises you can try at home to go deeper:
>
> - Try out some of Istio's traffic management functionality, such as request timeouts, circuit breaking, and traffic shifting.
> - Consider whether Istio's ambient mode is a better fit for your workloads than the default sidecar mode.

## Conclusion

You've now seen the central role that networking plays in connectivity and security, as per the seven key takeaways from this chapter:

1. You get public IP addresses from network operators such as cloud providers and ISPs.
2. DNS allows you to access web services via memorable, human-friendly, consistent names.
3. Use a defense-in-depth strategy to ensure that you're never one mistake away from a disaster.
4. Deploy all your servers into private networks by default, exposing only a handful of locked-down servers to the public internet.
5. In the castle-and-moat model, you create a strong network perimeter to protect all the resources in your private network; in the zero trust architecture, you create a strong perimeter around each individual resource.
6. As soon as you have more than one service, you will need to figure out a service discovery solution.
7. A service mesh can improve security, observability, resiliency, and traffic management in a microservice architecture, without having to update the application code of each service.

As you went through this chapter, you repeatedly came across several key security concepts such as authentication and secrets. These concepts affect not only networking but all aspects of software delivery, so let's move on to Chapter 8, where we do a deeper dive on security.

---

**Previous:** [Multiple Services](/code-cicd/ch06-multiple-services) | **Next:** [Security](/operations-architecture/ch08-security)
