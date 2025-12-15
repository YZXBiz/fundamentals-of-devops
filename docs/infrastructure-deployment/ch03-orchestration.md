---
sidebar_position: 4
title: "Orchestration"
description: "Master orchestration tools for managing apps at scale. Learn server, VM, container, and serverless orchestration with Ansible, AWS ASG, Kubernetes, and AWS Lambda."
---

import { ProcessFlow, StackDiagram, CardGrid, ComparisonTable, TreeDiagram, colors } from '@site/src/components/diagrams';

# Chapter 3. How to Manage Your Apps by Using Orchestration Tools

## Table of Contents

1. [An Introduction to Orchestration](#1-an-introduction-to-orchestration)
2. [Server Orchestration](#2-server-orchestration)
3. [VM Orchestration](#3-vm-orchestration)
4. [Container Orchestration](#4-container-orchestration)
5. [Serverless Orchestration](#5-serverless-orchestration)
6. [Comparing Orchestration Options](#6-comparing-orchestration-options)
7. [Adopting Orchestration](#7-adopting-orchestration)
8. [Conclusion](#8-conclusion)

## Introduction

In Chapter 2, you learned how to manage your infrastructure as code. This chapter shifts focus from managing infrastructure to managing applications.

Running a single copy of your app creates a single point of failure. Production apps need multiple copies (replicas) to handle:
- Hardware failures (server crashes)
- Software failures (application bugs)
- Traffic spikes (exceeding single-server capacity)

Orchestration tools automate app management requirements: restarting crashed apps, scaling replicas under load, balancing traffic, and coordinating communication between services.

### The Four Orchestration Categories

<CardGrid cards={[
  {
    title: "Server Orchestration",
    description: "Deploy code onto a cluster of servers using tools like Ansible",
    color: colors.slate
  },
  {
    title: "VM Orchestration",
    description: "Deploy VM images into auto-scaling groups in the cloud",
    color: colors.blue
  },
  {
    title: "Container Orchestration",
    description: "Deploy container images into clusters using Kubernetes",
    color: colors.green
  },
  {
    title: "Serverless Orchestration",
    description: "Deploy functions using AWS Lambda or similar FaaS platforms",
    color: colors.purple
  }
]} />

This chapter walks through each category with hands-on examples deploying the same app using different approaches. You'll compare how each handles updates, load balancing, auto scaling, and auto healing.

## 1. An Introduction to Orchestration

### 1.1. What is Orchestration?

**In plain English:** Orchestration is like a conductor directing an orchestra. The conductor tells musicians when to start or stop, play louder or softer, and coordinates all parts to work together.

**In technical terms:** An orchestration tool directs software clusters, coordinating applications to start or stop, allocating hardware resources, and managing the number of running replicas.

**Why it matters:** Without orchestration, you'd manually manage every aspect of running apps in production—an impossible task at scale.

:::tip[Insight]
The term "orchestration" is now associated with Kubernetes, but the underlying needs have existed since programmers first deployed apps for users. Every production app needs orchestration, whether you use modern tools or build custom solutions.
:::

<StackDiagram
  title="Orchestration Layers: Infrastructure to Applications"
  layers={[
    {
      name: "Physical Infrastructure",
      description: "Servers, networking, storage",
      color: colors.slate,
      height: 60
    },
    {
      name: "Virtualization Layer",
      description: "VMs, containers, or serverless runtime",
      color: colors.blue,
      height: 70
    },
    {
      name: "Orchestration Platform",
      description: "Ansible, Kubernetes, ECS, Lambda",
      color: colors.green,
      height: 80
    },
    {
      name: "Application Services",
      description: "Your apps, microservices, functions",
      color: colors.purple,
      height: 90
    },
    {
      name: "User Traffic",
      description: "Load balancers, API gateways",
      color: colors.orange,
      height: 50
    }
  ]}
/>

### 1.2. Core Orchestration Problems

Every production app needs solutions for these challenges:

#### 1.2.1. Deployment

**In plain English:** You need a way to install your app on servers and update it without users noticing downtime.

**In technical terms:** Deploy one or more replicas of your app and periodically roll out updates using zero-downtime deployment strategies.

**Why it matters:** Users expect apps to be always available. Downtime during updates damages user trust and costs money.

#### 1.2.2. Scheduling

**In plain English:** You need to decide which apps run on which servers, like assigning seats on a bus to use all available space.

**In technical terms:** Allocate apps to servers ensuring each gets required resources (CPU, memory, disk). Schedulers use bin packing algorithms to maximize resource efficiency.

**Why it matters:** Poor scheduling wastes money on idle resources or causes performance issues from resource contention.

#### 1.2.3. Rollback

**In plain English:** When an update breaks your app, you need an "undo" button to restore the working version.

**In technical terms:** Revert all replicas to a previous version when problems occur during updates.

**Why it matters:** Bugs happen. Fast rollback minimizes user impact and business disruption.

#### 1.2.4. Auto Scaling

**In plain English:** Your app should automatically grow or shrink based on how many people are using it, like adding checkout lanes when the store gets busy.

**In technical terms:** Automatically scale apps up or down in response to load changes using vertical scaling (more resources per server) or horizontal scaling (more servers/replicas).

**Why it matters:** Manual scaling is too slow and error-prone. Over-provisioning wastes money; under-provisioning causes outages.

#### 1.2.5. Auto Healing

**In plain English:** Something needs to watch your app, detect when it's sick, and automatically fix or replace it.

**In technical terms:** Monitor apps to detect unhealthy states (unresponsive or malfunctioning) and automatically restart or replace failing apps or servers.

**Why it matters:** Manual intervention takes time. Auto healing reduces downtime from minutes or hours to seconds.

#### 1.2.6. Load Balancing

**In plain English:** When you have multiple copies of your app, you need traffic cops to direct users evenly to all copies.

**In technical terms:** Distribute incoming traffic across multiple replicas using algorithms like round-robin, hash-based, or least-response-time.

**Why it matters:** Without load balancing, some replicas sit idle while others get overloaded, wasting resources and degrading performance.

#### 1.2.7. Configuration

**In plain English:** Your app needs different settings in different environments, like using a test credit card processor in development and the real one in production.

**In technical terms:** Configure apps differently per environment (dev, stage, prod) with environment-specific values for domain names, memory settings, and external services.

**Why it matters:** Hard-coded values cause bugs when code moves between environments. Flexible configuration prevents mistakes.

#### 1.2.8. Secrets Management

**In plain English:** Your app needs passwords and API keys, but you can't write them directly in code where everyone can see them.

**In technical terms:** Securely pass sensitive configuration data (passwords, API keys, certificates) to apps without exposing them in source code or logs.

**Why it matters:** Leaked credentials cause security breaches. Proper secrets management is non-negotiable for production apps.

#### 1.2.9. Service Communication

**In plain English:** When you run multiple apps that need to talk to each other, they need a reliable phone system with caller ID and encryption.

**In technical terms:** Enable apps to discover and communicate with each other, including service discovery, authentication, authorization, encryption, error handling, and observability (service mesh).

**Why it matters:** Modern apps are distributed systems. Reliable communication between services is critical for system functionality.

#### 1.2.10. Disk Management

**In plain English:** If your app saves files, you need to ensure the right files end up with the right copy of your app.

**In technical terms:** Ensure correct persistent storage (hard drives, volumes) is attached to the right app replicas as they're deployed, moved, or restarted.

**Why it matters:** Data loss or corruption destroys user trust. Proper disk management ensures data integrity and availability.

:::warning[Historical Context]
In the pre-cloud era, most companies wrote bespoke solutions—custom scripts gluing together various tools. Today, the industry standardizes around four broad approaches: server, VM, container, and serverless orchestration.
:::

## 2. Server Orchestration

### 2.1. What is Server Orchestration?

**In plain English:** Set up a group of servers, install your app on them, and update the apps directly on those same servers when you need changes.

**In technical terms:** Configure a fixed cluster of servers, deploy applications across them, and perform in-place updates using configuration management tools or deployment scripts.

**Why it matters:** This is the original orchestration approach, still common in legacy systems. Understanding it helps you migrate to modern approaches.

The server orchestration approach:
- Set up a cluster of servers
- Deploy apps across the servers
- Update servers in place when rolling out changes

Common tools include:
- Configuration management: Chef, Puppet, Ansible
- Deployment scripts: Capistrano, Deployer, Mina
- Custom ad hoc scripts

:::tip[Insight]
Server orchestration is an older, mutable infrastructure approach utilizing a fixed set of servers that you maintain and update in place. This contrasts with immutable infrastructure where you replace servers rather than update them.
:::

### 2.2. Example: Deploy an App Securely and Reliably by Using Ansible

This example improves on Chapter 2's single-server deployment by:
- Running multiple server instances for redundancy
- Using a non-root user for security
- Implementing automatic restart on crashes
- Deploying with proper process supervision

#### 2.2.1. Create the Server Infrastructure

Navigate to your working directory and set up folders:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch3/ansible
$ cp ch2/ansible/create_ec2_instances_playbook.yml ch3/ansible/
$ cp ch2/ansible/inventory.aws_ec2.yml ch3/ansible/
$ cd ch3/ansible
```

Create `sample-app-vars.yml` to configure three servers:

```yaml
num_instances: 3
base_name: sample_app_instances
http_port: 8080
```

**What this does:**
- `num_instances: 3` creates three servers for redundancy
- `base_name` provides a consistent naming pattern
- `http_port: 8080` opens the application port (non-privileged)

Run the playbook to create servers:

```bash
$ ansible-playbook \
  -v create_ec2_instances_playbook.yml \
  --extra-vars "@sample-app-vars.yml"
```

Create `group_vars/sample_app_instances.yml` for SSH configuration:

```yaml
ansible_user: ec2-user
ansible_ssh_private_key_file: sample_app_instances.key
ansible_host_key_checking: false
```

#### 2.2.2. Configure Servers with Security Best Practices

Create `configure_sample_app_playbook.yml`:

```yaml
- name: Configure servers to run the sample-app
  hosts: sample_app_instances
  gather_facts: true
  become: true
  roles:
    - role: nodejs-app
    - role: sample-app
      become_user: app-user
```

**Key improvements over Chapter 2:**

1. **Separation of concerns:** The `nodejs-app` role configures Node.js infrastructure; `sample-app` role deploys the application
2. **Non-root execution:** Apps run as `app-user`, not root (reduces security risk)
3. **Process supervision:** PM2 manages the app, automatically restarting on crashes
4. **Persistence:** PM2 configuration survives server reboots

The `nodejs-app` role handles:
- Adding Node.js Yum repository
- Installing Node.js
- Creating `app-user` with limited permissions
- Installing and configuring PM2 process manager

The `sample-app` role handles:
- Copying application code
- Starting the app with PM2
- Saving PM2 configuration for persistence

Deploy the configuration:

```bash
$ ansible-playbook -v -i inventory.aws_ec2.yml configure_sample_app_playbook.yml
```

Test by opening `http://<IP>:8080` in your browser for each server.

:::warning[Security Note]
Running apps as root is dangerous. If an attacker compromises your app, they gain full system access. Always use dedicated service accounts with minimal permissions.
:::

### 2.3. Example: Deploy a Load Balancer by Using Ansible and nginx

Three servers provide redundancy but create usability problems. Users need a single endpoint.

#### 2.3.1. What is a Load Balancer?

**In plain English:** A load balancer is like a restaurant host who distributes diners evenly across all available servers so no server gets overwhelmed.

**In technical terms:** Software that distributes incoming requests across multiple servers/apps using algorithms (round-robin, hash-based, least-response-time) to maximize efficiency.

**Why it matters:** Load balancers provide a single entry point while distributing work, improving both availability and performance.

#### 2.3.2. Deploy nginx as a Load Balancer

Create `nginx-vars.yml`:

```yaml
num_instances: 1
base_name: nginx_instances
http_port: 80
```

Create the nginx instance:

```bash
$ ansible-playbook \
  -v create_ec2_instances_playbook.yml \
  --extra-vars "@nginx-vars.yml"
```

Create `requirements.yml` to use a pre-built nginx role:

```yaml
- name: nginx
  src: https://github.com/brikis98/devops-book-nginx-role
  version: 1.0.0
```

Install the role:

```bash
$ ansible-galaxy role install -r requirements.yml
```

Create `configure_nginx_playbook.yml` to configure nginx for load balancing:

```yaml
- name: Configure nginx as load balancer
  hosts: nginx_instances
  gather_facts: true
  become: true
  roles:
    - role: nginx
      backend_servers: "{{ groups['sample_app_instances'] }}"
      backend_port: 8080
```

Deploy:

```bash
$ ansible-playbook -v -i inventory.aws_ec2.yml configure_nginx_playbook.yml
```

Open the nginx server's URL in your browser. Refresh multiple times—each request goes to a different backend server using round-robin distribution.

:::tip[Insight]
Load balancers enable horizontal scaling. Instead of making one server bigger (vertical scaling), you add more servers and distribute load (horizontal scaling). This is more flexible and cost-effective.
:::

### 2.4. Example: Roll Out Updates with Ansible

Updating all servers simultaneously causes downtime. Rolling deployments update servers one at a time.

#### 2.4.1. Configure Rolling Deployments

Update `configure_sample_app_playbook.yml`:

```yaml
- name: Configure servers to run the sample-app
  hosts: sample_app_instances
  gather_facts: true
  become: true
  serial: 1
  max_fail_percentage: 30
  roles:
    - role: nodejs-app
    - role: sample-app
      become_user: app-user
```

**Key parameters:**
- `serial: 1` updates one server at a time
- `max_fail_percentage: 30` aborts if more than 30% of servers fail

#### 2.4.2. Deploy an Update

Update your `app.js` to display "Fundamentals of DevOps!" instead of "Hello, World!"

Run the playbook:

```bash
$ ansible-playbook -v -i inventory.aws_ec2.yml configure_sample_app_playbook.yml
```

**What happens:**
1. Ansible updates the first server
2. That server briefly goes down (seconds)
3. nginx routes traffic to the remaining two servers
4. The updated server comes back online
5. Repeat for servers 2 and 3

Users experience zero downtime because nginx always has healthy servers to route to.

:::warning[Rolling Deployment Caveat]
Rolling deployments require backward-compatible changes. If your update changes the database schema or API contract, you need more sophisticated deployment strategies (blue-green, canary).
:::

### 2.5. Get Your Hands Dirty

Try these exercises to deepen understanding:

1. **Scale to four instances:** Modify `sample-app-vars.yml` to create four servers and redeploy
2. **Test server restart:** Restart one EC2 instance and observe nginx behavior
3. **Test server termination:** Terminate one instance and determine how to restore it
4. **Experiment with serial values:** Try `serial: 2` to update two servers simultaneously

When finished, manually terminate all EC2 instances to avoid AWS charges.

### 2.6. Server Orchestration: Pros and Cons

**Advantages:**
- Simple conceptual model
- Full control over server configuration
- Works with any application type
- No additional infrastructure required

**Disadvantages:**
- Mutable infrastructure leads to configuration drift
- Manual scaling processes
- No built-in auto healing
- Server maintenance overhead
- Difficult to achieve true immutability

## 3. VM Orchestration

### 3.1. What is VM Orchestration?

**In plain English:** Create snapshots of fully-configured servers (VM images), use those snapshots to create new servers, and when you need to update, create new snapshots and swap old servers for new ones.

**In technical terms:** Build VM images with applications and dependencies pre-installed, deploy images across virtual server clusters, scale server count dynamically, and replace old servers with new ones during updates.

**Why it matters:** VM orchestration provides immutable infrastructure—you never update existing servers, you replace them. This eliminates configuration drift and makes deployments more predictable.

The VM orchestration approach:
- Create VM images with apps fully installed and configured
- Deploy VM images across server clusters
- Scale the number of servers based on demand
- Replace old servers with new ones when deploying updates

This approach works best with cloud providers (AWS, Google Cloud, Azure) where you can quickly spin up and tear down virtual servers.

:::tip[Insight]
VM orchestration is an immutable infrastructure approach that deploys and manages VM images across virtualized servers. "Immutable" means servers are never modified after creation—they're replaced instead.
:::

### 3.2. Example: Build a VM Image by Using Packer

#### 3.2.1. Set Up the Packer Project

Create directories and copy base files:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch3/packer
$ cd ch3/packer
```

Copy the Packer template and sample app from Chapter 2, then enhance it.

#### 3.2.2. Create an Enhanced Packer Template

Create `sample-app.pkr.hcl` with these key enhancements:

```hcl
packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "sample_app" {
  ami_name      = "sample-app-packer-{{timestamp}}"
  instance_type = "t2.micro"
  region        = "us-east-2"
  source_ami_filter {
    filters = {
      name                = "amzn2-ami-hvm-*-x86_64-gp2"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["amazon"]
    most_recent = true
  }
  ssh_username = "ec2-user"
}

build {
  sources = ["source.amazon-ebs.sample_app"]

  provisioner "file" {
    source      = "sample-app"
    destination = "/tmp/sample-app"
  }

  provisioner "shell" {
    script = "install.sh"
  }
}
```

Create `install.sh` to configure the VM:

```bash
#!/usr/bin/env bash
set -e

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Create app user
sudo useradd -m -s /bin/bash app-user

# Move app to app-user home
sudo mv /tmp/sample-app /home/app-user/
sudo chown -R app-user:app-user /home/app-user/sample-app

# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 to start on boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u app-user --hp /home/app-user
```

#### 3.2.3. Build the AMI

Initialize and build:

```bash
$ packer init sample-app.pkr.hcl
$ packer build sample-app.pkr.hcl
```

Building takes 3-5 minutes. Packer outputs the new AMI ID when complete.

**What happens during the build:**
1. Packer launches a temporary EC2 instance
2. Runs provisioners to install software and copy files
3. Creates an AMI (snapshot) from the instance
4. Terminates the temporary instance

:::tip[Insight]
VM images capture the entire server state. Every instance launched from the same AMI is identical, eliminating "works on my machine" problems.
:::

### 3.3. Example: Deploy a VM Image in an Auto Scaling Group by Using OpenTofu

#### 3.3.1. What is an Auto Scaling Group?

**In plain English:** An auto scaling group is like a restaurant manager who hires or fires servers based on how busy the restaurant is, and replaces any server who gets sick.

**In technical terms:** AWS Auto Scaling Groups (ASG) automatically maintain a desired number of EC2 instances, replace unhealthy instances, and scale capacity up or down based on demand or schedule.

**Why it matters:** ASGs automate server management, providing self-healing infrastructure and dynamic capacity without manual intervention.

#### 3.3.2. Deploy with OpenTofu

Create `ch3/tofu/live/asg-sample/main.tf`:

```hcl
provider "aws" {
  region = "us-east-2"
}

module "asg" {
  source  = "brikis98/devops/book//modules/asg"
  version = "1.0.0"

  name             = "sample-app-asg"
  ami_name         = "sample-app-packer-*"
  user_data        = filebase64("${path.module}/user-data.sh")
  app_http_port    = 8080
  instance_type    = "t2.micro"
  min_size         = 3
  max_size         = 10
}
```

**Key parameters:**
- `ami_name` uses a wildcard to find the latest matching AMI
- `min_size: 3` ensures at least three instances always run
- `max_size: 10` allows scaling up to ten instances
- `user_data` runs a script on each instance at boot

Create `user-data.sh`:

```bash
#!/usr/bin/env bash
set -e

su app-user <<'EOF'
cd /home/app-user/sample-app
pm2 start app.config.js
pm2 save
EOF
```

Deploy:

```bash
$ cd ch3/tofu/live/asg-sample
$ tofu init
$ tofu apply
```

AWS launches three instances from your AMI. The ASG monitors them and replaces any that become unhealthy.

### 3.4. Example: Deploy an Application Load Balancer by Using OpenTofu

#### 3.4.1. What is an Application Load Balancer?

**In plain English:** An Application Load Balancer (ALB) is like a smart receptionist who not only distributes visitors across departments but also checks if departments are available before sending people there.

**In technical terms:** AWS ALBs distribute incoming HTTP/HTTPS traffic across multiple targets, perform health checks to route traffic only to healthy instances, and support advanced routing rules.

**Why it matters:** ALBs provide more features than basic load balancers: content-based routing, WebSocket support, HTTP/2, and native AWS integration.

#### 3.4.2. Add the ALB Module

Update `main.tf`:

```hcl
module "alb" {
  source  = "brikis98/devops/book//modules/alb"
  version = "1.0.0"

  name                  = "sample-app-alb"
  alb_http_port         = 80
  app_http_port         = 8080
  app_health_check_path = "/"
}

module "asg" {
  source  = "brikis98/devops/book//modules/asg"
  version = "1.0.0"

  name              = "sample-app-asg"
  ami_name          = "sample-app-packer-*"
  user_data         = filebase64("${path.module}/user-data.sh")
  app_http_port     = 8080
  instance_type     = "t2.micro"
  min_size          = 3
  max_size          = 10
  target_group_arns = [module.alb.target_group_arn]
}
```

The `target_group_arns` parameter connects the ASG to the ALB.

Deploy:

```bash
$ tofu apply
```

OpenTofu outputs the ALB domain name. Open it in your browser to see your app.

**How it works:**
1. User requests hit the ALB
2. ALB checks which instances are healthy
3. ALB routes requests to healthy instances using round-robin
4. If an instance fails health checks, ALB stops routing to it
5. ASG detects the unhealthy instance and replaces it

:::warning[Health Checks Are Critical]
Configure health check paths carefully. If health checks fail incorrectly, the ALB routes no traffic and your app appears down even though instances are running.
:::

### 3.5. Example: Roll Out Updates with OpenTofu and Auto Scaling Groups

#### 3.5.1. Configure Instance Refresh

Add instance refresh configuration to the ASG module:

```hcl
module "asg" {
  # ... (other parameters) ...

  instance_refresh = {
    min_healthy_percentage = 100
    max_healthy_percentage = 200
    auto_rollback          = true
  }
}
```

**What these parameters mean:**
- `min_healthy_percentage: 100` ensures all capacity remains available during updates
- `max_healthy_percentage: 200` allows deploying double capacity temporarily
- `auto_rollback: true` reverts if health checks fail after replacement

#### 3.5.2. Deploy an Update

Update your `app.js` to display "Fundamentals of DevOps!"

Build a new AMI:

```bash
$ cd ../../packer
$ packer build sample-app.pkr.hcl
```

Apply the OpenTofu configuration:

```bash
$ cd ../tofu/live/asg-sample
$ tofu apply
```

**What happens during instance refresh:**
1. ASG launches new instances with the new AMI
2. Waits for new instances to pass health checks
3. Terminates old instances
4. Repeats until all instances are replaced
5. If health checks fail, automatically rolls back

This provides zero-downtime deployment with automatic rollback on failure.

:::tip[Insight]
Instance refresh provides sophisticated deployment strategies without custom scripting. AWS manages the complexity of safe rollouts and rollbacks.
:::

### 3.6. Get Your Hands Dirty

Experiment with VM orchestration:

1. **Add version numbers:** Include version numbers in AMI names for precise control
2. **Scale to four instances:** Update `min_size` to 4 and apply
3. **Test instance termination:** Manually terminate an instance and observe ASG auto healing
4. **Adjust health check settings:** Experiment with health check intervals and thresholds

When finished, clean up:

```bash
$ tofu destroy
```

### 3.7. VM Orchestration: Pros and Cons

**Advantages:**
- Immutable infrastructure eliminates configuration drift
- Built-in auto scaling and auto healing
- Fast instance launch (minutes)
- Strong isolation between workloads
- Cloud-native integration

**Disadvantages:**
- Slower build times (5-30 minutes) than containers
- Less efficient resource usage (whole VMs vs. containers)
- Larger images (GBs vs. MBs)
- Limited portability (AMIs are AWS-specific)
- Higher operational overhead than serverless

## 4. Container Orchestration

### 4.1. What is Container Orchestration?

**In plain English:** Package your app with everything it needs into a lightweight box (container), deploy many boxes across servers (potentially multiple boxes per server), and when you need to update, create new boxes and swap them in.

**In technical terms:** Build container images with applications and dependencies, deploy images across server clusters with intelligent bin-packing, automatically scale containers and servers based on load, and replace old containers with new ones during updates.

**Why it matters:** Container orchestration combines the immutability benefits of VMs with better speed, efficiency, and portability. Containers have become the dominant deployment model for modern applications.

The container orchestration approach:
- Create container images with apps and dependencies
- Deploy images across clusters with multiple containers per server
- Use bin packing to maximize resource efficiency
- Scale containers and servers automatically
- Replace old containers with new ones during updates

:::tip[Insight]
Container orchestration is an immutable infrastructure approach that deploys and manages container images across a cluster of servers. Containers started becoming popular around 2013 with Docker and Kubernetes.
:::

### 4.2. Why Containers Beat VMs

Container orchestration offers key advantages over VM orchestration:

#### 4.2.1. Speed

**In plain English:** Building a container image is like packing a suitcase—quick and simple. Building a VM image is like moving your entire house.

**In technical terms:** Container images typically build in 1-5 minutes compared to 5-30 minutes for VM images.

**Why it matters:** Faster builds mean faster iteration cycles and quicker deployments.

#### 4.2.2. Efficiency

**In plain English:** Containers are like tetris—they pack tightly together on servers. VMs are like storage units—each takes up a fixed amount of space.

**In technical terms:** Container orchestration tools use sophisticated bin-packing schedulers to maximize resource utilization across clusters.

**Why it matters:** Better efficiency means lower infrastructure costs and higher server utilization.

#### 4.2.3. Portability

**In plain English:** Containers work everywhere—your laptop, any cloud, on-premises servers. VMs are tied to specific platforms.

**In technical terms:** Container images use standardized formats (OCI) that work across all major clouds, on-premises infrastructure, and local development.

**Why it matters:** Avoid vendor lock-in and use the same artifacts from development through production.

#### 4.2.4. Local Development

**In plain English:** Running containers on your laptop is easy and fast. Running VMs locally is slow and resource-intensive.

**In technical terms:** Containers share the host OS kernel, making them lightweight enough for practical local development workflows.

**Why it matters:** Developers can run the exact production environment locally, eliminating environment-related bugs.

#### 4.2.5. Functionality

**In plain English:** Container orchestration tools are like Swiss Army knives with features for every need. VM orchestration tools are more basic.

**In technical terms:** Container orchestration platforms provide comprehensive solutions for scheduling, service discovery, secrets management, rolling deployments, health checks, and more out of the box.

**Why it matters:** Less custom scripting and integration work to achieve production-ready deployments.

### 4.3. Example: A Crash Course on Docker

#### 4.3.1. Install Docker

Install Docker Desktop (minimum version 4.0) from docker.com.

#### 4.3.2. Run Your First Container

**In plain English:** Run a container to see how it isolates your application from everything else on your computer.

**In technical terms:** Use `docker run` to launch a container from an image:

```bash
$ docker run -it ubuntu:24.04 bash
```

**What happens:**
1. Docker downloads the Ubuntu 24.04 image from Docker Hub (a public image registry)
2. Creates an isolated container from the image
3. Runs bash inside the container
4. Connects your terminal to the container's bash shell

Try running commands inside the container:

```bash
root@abc123:/# ls -al
root@abc123:/# pwd
root@abc123:/# cat /etc/os-release
```

You're in a completely isolated Ubuntu filesystem, separate from your host OS.

Exit the container:

```bash
root@abc123:/# exit
```

:::tip[Insight]
Docker containers provide OS-level isolation. Each container has its own filesystem, processes, and network stack, but they all share the host OS kernel—making them much lighter than VMs.
:::

### 4.4. Example: Create a Docker Image for a Node.js App

#### 4.4.1. Set Up the Project

Create project structure:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch3/docker
$ cd ch3/docker
```

Copy your `sample-app` folder here.

#### 4.4.2. Create a Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:21.7
WORKDIR /home/node/app
COPY app.js .
EXPOSE 8080
USER node
CMD ["node", "app.js"]
```

**What each line does:**

- `FROM node:21.7` starts from the official Node.js 21.7 image
- `WORKDIR /home/node/app` sets the working directory inside the container
- `COPY app.js .` copies your app code into the container
- `EXPOSE 8080` documents that the app listens on port 8080
- `USER node` runs the app as the `node` user (not root) for security
- `CMD ["node", "app.js"]` defines the command to run when the container starts

#### 4.4.3. Build the Image

Build the Docker image:

```bash
$ docker build -t sample-app:v1 .
```

The `-t` flag tags the image as `sample-app:v1`.

**What happens during build:**
1. Docker reads the Dockerfile
2. Executes each instruction in order
3. Each instruction creates a new layer
4. Final image is the combination of all layers

#### 4.4.4. Run the Container

Run your containerized app:

```bash
$ docker run -p 8080:8080 -it --init sample-app:v1
```

**Flags explained:**
- `-p 8080:8080` maps port 8080 on your computer to port 8080 in the container
- `-it` runs interactively with a terminal
- `--init` uses an init process to handle signals properly

Open `http://localhost:8080` in your browser. You should see "Hello, World!"

:::warning[Port Mapping Required]
Containers are isolated from the host network. Without `-p 8080:8080`, you couldn't access the app even though it's listening on port 8080 inside the container.
:::

### 4.5. Example: Deploy a Dockerized App with Kubernetes

#### 4.5.1. What is Kubernetes?

**In plain English:** Kubernetes is like an air traffic controller for containers. It decides where containers should run, monitors them, and handles problems automatically.

**In technical terms:** Kubernetes (K8s) is a container orchestration platform consisting of a control plane (cluster management) and worker nodes (servers running containers).

**Why it matters:** Kubernetes solves all the core orchestration problems (deployment, scaling, healing, load balancing) with a standardized, portable platform.

#### 4.5.2. Kubernetes Architecture

Kubernetes consists of:

**Control Plane Components:**
- API Server: The front-end for the Kubernetes control plane
- Scheduler: Assigns pods to nodes based on resource requirements
- Controller Manager: Runs controller processes (replication, endpoints, etc.)
- etcd: Consistent, distributed key-value store for cluster state

**Worker Node Components:**
- kubelet: Ensures containers are running in pods
- kube-proxy: Maintains network rules for pod communication
- Container runtime: Runs containers (Docker, containerd, etc.)

#### 4.5.3. Enable Kubernetes in Docker Desktop

Open Docker Desktop settings and enable Kubernetes. This creates a single-node Kubernetes cluster on your computer.

#### 4.5.4. Install and Configure kubectl

Install kubectl (Kubernetes command-line tool) following the official documentation.

Configure kubectl to use your local cluster:

```bash
$ kubectl config use-context docker-desktop
$ kubectl get nodes
```

You should see one node (your computer) in the Ready state.

### 4.6. Example: Create a Kubernetes Deployment

#### 4.6.1. What is a Deployment?

**In plain English:** A Deployment is like a manager who ensures the right number of your app copies are always running, replaces failed copies, and handles updates.

**In technical terms:** A Kubernetes Deployment manages a set of identical pods (groups of containers), maintains the desired replica count, performs rolling updates, and enables rollbacks.

**Why it matters:** Deployments provide declarative app management—you specify what you want, and Kubernetes handles how to achieve it.

#### 4.6.2. Create the Deployment Configuration

Create `sample-app-deployment.yml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app-deployment
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: sample-app-pods
    spec:
      containers:
        - name: sample-app
          image: sample-app:v1
          ports:
            - containerPort: 8080
          env:
            - name: NODE_ENV
              value: production
  selector:
    matchLabels:
      app: sample-app-pods
```

**Key sections:**

- `replicas: 3` tells Kubernetes to run three copies
- `template` defines the pod specification (containers, ports, environment)
- `selector` tells the Deployment which pods it manages (using labels)
- `env` sets environment variables inside containers

#### 4.6.3. Apply the Deployment

Apply the configuration:

```bash
$ kubectl apply -f sample-app-deployment.yml
```

Check the deployment:

```bash
$ kubectl get deployments
$ kubectl get pods
```

You should see three pods in the Running state.

**What Kubernetes did:**
1. Read your desired state (three replicas)
2. Compared to current state (zero pods)
3. Created three pods to match desired state
4. Scheduled pods onto available nodes
5. Started containers in each pod

:::tip[Insight]
Kubernetes uses a reconciliation loop: constantly comparing desired state (your YAML) to actual state (running pods) and taking actions to make them match. This self-healing approach is fundamental to Kubernetes.
:::

### 4.7. Example: Deploy a Load Balancer with Kubernetes

#### 4.7.1. What is a Kubernetes Service?

**In plain English:** A Service is like a phone number that stays the same even if you change phones. Pods come and go, but the Service provides a stable address.

**In technical terms:** A Kubernetes Service provides stable networking for a set of pods, including service discovery (DNS name), load balancing across pods, and external access options.

**Why it matters:** Pod IP addresses change when pods restart or get replaced. Services provide stable endpoints for communication.

#### 4.7.2. Create the Service Configuration

Create `sample-app-service.yml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: sample-app-loadbalancer
spec:
  type: LoadBalancer
  selector:
    app: sample-app-pods
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```

**Key sections:**

- `type: LoadBalancer` creates an external load balancer (Docker Desktop maps to localhost)
- `selector: app: sample-app-pods` routes traffic to pods with this label
- `port: 80` exposes the service on port 80
- `targetPort: 8080` forwards to port 8080 in the pods

#### 4.7.3. Apply the Service

Apply the configuration:

```bash
$ kubectl apply -f sample-app-service.yml
$ kubectl get services
```

In Docker Desktop, the LoadBalancer type maps to `localhost`. Open `http://localhost` in your browser.

Each request gets routed to a different pod using round-robin load balancing.

### 4.8. Example: Roll Out Updates with Kubernetes

#### 4.8.1. Configure Rolling Updates

Update `sample-app-deployment.yml` to specify rolling update strategy:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app-deployment
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 3
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: sample-app-pods
    spec:
      containers:
        - name: sample-app
          image: sample-app:v1
          ports:
            - containerPort: 8080
          env:
            - name: NODE_ENV
              value: production
  selector:
    matchLabels:
      app: sample-app-pods
```

**Rolling update parameters:**

- `maxSurge: 3` allows creating three extra pods during updates (temporary over-capacity)
- `maxUnavailable: 0` ensures zero pods are unavailable during updates (zero downtime)

#### 4.8.2. Deploy an Update

Update your `app.js` to display "Fundamentals of DevOps!"

Build a new Docker image:

```bash
$ docker build -t sample-app:v2 .
```

Update `sample-app-deployment.yml` to use `sample-app:v2`.

Apply the update:

```bash
$ kubectl apply -f sample-app-deployment.yml
```

Watch the rollout:

```bash
$ kubectl rollout status deployment/sample-app-deployment
```

**What Kubernetes does:**
1. Creates new pods with v2 image
2. Waits for new pods to become ready
3. Terminates old pods with v1 image
4. Repeats until all pods are running v2
5. Service continues routing to healthy pods throughout

Users experience zero downtime.

:::tip[Insight]
Kubernetes rolling updates provide sophisticated deployment control with simple declarative configuration. The same YAML-based approach works identically in development and production.
:::

### 4.9. Example: Deploy a Kubernetes Cluster in AWS by Using EKS

Local Kubernetes is great for learning, but production requires managed clusters.

#### 4.9.1. What is EKS?

**In plain English:** Amazon EKS is like hiring AWS to run your Kubernetes cluster so you don't have to manage the control plane servers.

**In technical terms:** Amazon Elastic Kubernetes Service (EKS) is a managed Kubernetes service that operates the control plane, handles upgrades, and provides high availability.

**Why it matters:** Running Kubernetes control planes is complex. EKS reduces operational burden, allowing you to focus on applications.

#### 4.9.2. Deploy an EKS Cluster

Create `ch3/tofu/live/eks-sample/main.tf`:

```hcl
provider "aws" {
  region = "us-east-2"
}

module "cluster" {
  source  = "brikis98/devops/book//modules/eks-cluster"
  version = "1.0.0"

  name              = "eks-sample"
  eks_version       = "1.32"
  instance_type     = "t2.micro"
  min_worker_nodes  = 3
  max_worker_nodes  = 10
}
```

Deploy:

```bash
$ cd ch3/tofu/live/eks-sample
$ tofu init
$ tofu apply
```

EKS cluster creation takes 10-15 minutes.

#### 4.9.3. Configure kubectl for EKS

Authenticate kubectl to your EKS cluster:

```bash
$ aws eks update-kubeconfig --region us-east-2 --name eks-sample
$ kubectl get nodes
```

You should see three worker nodes in the Ready state.

### 4.10. Example: Push a Docker Image to ECR

AWS needs access to your Docker images. Use Amazon Elastic Container Registry (ECR).

#### 4.10.1. Create an ECR Repository

Create `ch3/tofu/live/ecr-sample/main.tf`:

```hcl
provider "aws" {
  region = "us-east-2"
}

module "repo" {
  source  = "brikis98/devops/book//modules/ecr-repo"
  version = "1.0.0"

  name = "sample-app"
}
```

Deploy:

```bash
$ cd ch3/tofu/live/ecr-sample
$ tofu init
$ tofu apply
```

OpenTofu outputs the ECR repository URL.

#### 4.10.2. Build Multi-Architecture Images

EKS worker nodes might use different CPU architectures (x86_64 or ARM64). Build multi-architecture images:

```bash
$ docker buildx create --use --platform=linux/amd64,linux/arm64 --name multi-platform-builder
$ docker buildx build --platform=linux/amd64,linux/arm64 --load -t sample-app:v3 .
```

#### 4.10.3. Push to ECR

Authenticate Docker to ECR:

```bash
$ aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin <YOUR_ECR_REPO_URL>
```

Tag and push your image:

```bash
$ docker tag sample-app:v3 <YOUR_ECR_REPO_URL>:v3
$ docker push <YOUR_ECR_REPO_URL>:v3
```

### 4.11. Example: Deploy a Dockerized App into an EKS Cluster

Update your Deployment to use the ECR image URL:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-app-deployment
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 3
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: sample-app-pods
    spec:
      containers:
        - name: sample-app
          image: <YOUR_ECR_REPO_URL>:v3
          ports:
            - containerPort: 8080
          env:
            - name: NODE_ENV
              value: production
  selector:
    matchLabels:
      app: sample-app-pods
```

Deploy to EKS:

```bash
$ kubectl apply -f sample-app-deployment.yml
$ kubectl apply -f sample-app-service.yml
$ kubectl get services
```

In EKS, the LoadBalancer type creates an AWS Elastic Load Balancer. The `get services` command shows the ELB domain name.

Open the ELB URL in your browser—your app is running in production Kubernetes!

### 4.12. Get Your Hands Dirty

Experiment with container orchestration:

1. **Deploy an ALB:** Use AWS Load Balancer Controller to deploy an Application Load Balancer instead of Classic Load Balancer
2. **Test worker node termination:** Terminate a worker node and observe how EKS and the ELB handle it
3. **Add health checks:** Configure liveness and readiness probes in your Deployment
4. **Experiment with scaling:** Manually scale the Deployment to different replica counts

When finished:

```bash
$ tofu destroy
```

Run this in both the `eks-sample` and `ecr-sample` directories.

### 4.13. Container Orchestration: Pros and Cons

**Advantages:**
- Fast build and deployment (1-5 minutes)
- Efficient resource usage with bin-packing
- Portable across all clouds and on-premises
- Practical local development
- Comprehensive orchestration features
- Industry-standard platform (Kubernetes)

**Disadvantages:**
- Steep learning curve (Kubernetes is complex)
- Higher operational overhead than serverless
- Requires understanding of containers and orchestration
- More moving parts than simpler approaches
- Potential for over-engineering simple applications

## 5. Serverless Orchestration

### 5.1. What is Serverless Orchestration?

**In plain English:** Write just your application code as individual functions, upload them to a cloud provider, and let the provider handle everything else—servers, scaling, load balancing, all of it.

**In technical terms:** Create deployment packages containing function source code, upload to a Functions-as-a-Service (FaaS) provider, configure triggers (HTTP, events, schedules), and let the provider execute functions on demand.

**Why it matters:** Serverless represents the ultimate abstraction—you think only about code, not infrastructure. The provider handles scaling, availability, and resource management automatically.

The serverless orchestration approach:
- Write individual functions (single-purpose code)
- Package source code (app code only, no OS or runtime)
- Upload to serverless provider (AWS Lambda, Google Cloud Functions, Azure Functions)
- Configure triggers (HTTP requests, file uploads, queue messages, schedules)
- Provider executes functions on demand
- Update by uploading new function code

:::tip[Insight]
Serverless orchestration is an immutable infrastructure approach that deploys and manages functions without you having to think about servers at all. It's called "serverless" not because there are no servers, but because you never see or manage them.
:::

### 5.2. Advantages of FaaS

#### 5.2.1. Focus on Code, Not Hardware

**In plain English:** You never think about how many servers to run, how big they should be, or what happens when they fail.

**In technical terms:** The FaaS provider handles all infrastructure concerns: server provisioning, auto scaling, auto healing, load balancing, and capacity planning.

**Why it matters:** Eliminates entire categories of operational work, letting teams focus on business logic.

#### 5.2.2. Focus on Code, Not OS

**In plain English:** You don't install operating systems, patch security vulnerabilities, or configure system software.

**In technical terms:** Deployment packages contain only application code and dependencies. The provider manages the runtime environment, OS, security patches, and system maintenance.

**Why it matters:** Reduces the surface area for security vulnerabilities and eliminates OS maintenance work.

#### 5.2.3. Even More Speed

**In plain English:** Deploying a function update takes seconds instead of minutes.

**In technical terms:** FaaS deployments typically complete in under a minute compared to 1-5 minutes for containers or 5-30 minutes for VMs.

**Why it matters:** Faster deployments enable more rapid iteration and quicker incident response.

#### 5.2.4. Even More Efficiency

**In plain English:** Short tasks use resources for seconds rather than keeping entire servers running 24/7.

**In technical terms:** Short-lived functions can be scheduled more efficiently than long-running applications, with better resource sharing and multi-tenancy.

**Why it matters:** Higher density means lower costs for the provider, savings passed to customers.

#### 5.2.5. Perfect Scaling with Usage

**In plain English:** You pay only for the exact milliseconds your code runs, and cost automatically goes to zero when nobody uses it.

**In technical terms:** FaaS pricing charges per execution and compute time, with automatic scale-to-zero when idle. Performance optimizations directly reduce costs.

**Why it matters:** Perfect cost alignment with usage. No paying for idle servers. Making code faster saves money.

### 5.3. Limitations of FaaS

Despite advantages, FaaS has constraints:

#### 5.3.1. Size Limits

Deployment packages typically have size limits (e.g., 50MB for AWS Lambda without layers, 250MB with layers). Request and response payloads also have size limits.

#### 5.3.2. Time Limits

Functions have maximum execution times (e.g., 15 minutes for AWS Lambda). Long-running batch jobs don't fit this model.

#### 5.3.3. Limited Disk Space

Temporary storage is limited and ephemeral. Functions can't maintain large local datasets.

#### 5.3.4. Limited Performance Tuning

You can't fine-tune OS settings, networking stack, or runtime parameters like you can with servers.

#### 5.3.5. Debugging Challenges

No direct server access makes debugging harder. You rely on logging and distributed tracing.

#### 5.3.6. Cold Starts

First invocation after idle periods incurs startup latency (cold start). Subsequent invocations are faster (warm).

#### 5.3.7. Stateful Connections

Long-running connections (WebSockets, database connection pools) require workarounds with serverless architectures.

:::warning[Choose the Right Tool]
Serverless isn't suitable for all workloads. Long-running processes, high-throughput applications, and stateful systems often work better with containers or VMs.
:::

### 5.4. Example: Deploy a Serverless Function with AWS Lambda

#### 5.4.1. Create the Lambda Function Code

Create `ch3/tofu/live/lambda-sample/src/index.js`:

```javascript
exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain'
    },
    body: 'Hello, World!'
  };
};
```

**What this does:**
- `exports.handler` defines the function Lambda will invoke
- `event` contains trigger information (HTTP request, S3 event, etc.)
- Return value includes HTTP status code, headers, and body

#### 5.4.2. Deploy with OpenTofu

Create `ch3/tofu/live/lambda-sample/main.tf`:

```hcl
provider "aws" {
  region = "us-east-2"
}

module "function" {
  source  = "brikis98/devops/book//modules/lambda"
  version = "1.0.0"

  name                  = "lambda-sample"
  src_dir               = "${path.module}/src"
  runtime               = "nodejs20.x"
  handler               = "index.handler"
  memory_size           = 128
  timeout               = 5

  environment_variables = {
    NODE_ENV = "production"
  }
}
```

**Key parameters:**
- `src_dir` points to your function code
- `runtime` specifies the execution environment
- `handler` identifies which function to invoke (`file.function`)
- `memory_size` allocates memory in MB (CPU allocated proportionally)
- `timeout` sets maximum execution time in seconds

Deploy:

```bash
$ cd ch3/tofu/live/lambda-sample
$ tofu init
$ tofu apply
```

OpenTofu packages your code, uploads to AWS, and creates the Lambda function.

### 5.5. Example: Deploy a Lambda Function URL

#### 5.5.1. What is a Function URL?

**In plain English:** A function URL is like a doorbell for your function—anyone can press it (make an HTTP request) and your function runs.

**In technical terms:** Lambda Function URLs provide built-in HTTP(S) endpoints for Lambda functions without requiring API Gateway or ALB.

**Why it matters:** Simplest way to expose a Lambda function to HTTP traffic, with no additional infrastructure.

#### 5.5.2. Add the Function URL

Update `main.tf`:

```hcl
module "function_url" {
  source  = "brikis98/devops/book//modules/lambda-url"
  version = "1.0.0"

  function_name = module.function.name
}

output "function_url" {
  value = module.function_url.url
}
```

Apply:

```bash
$ tofu apply
```

OpenTofu outputs the function URL. Open it in your browser to see "Hello, World!"

**What happens when you access the URL:**
1. AWS receives the HTTP request
2. If no warm instance exists, Lambda cold-starts a new execution environment (300-1000ms)
3. Lambda invokes your handler function
4. Your function returns the response
5. Lambda returns the HTTP response
6. The execution environment stays warm for ~10-15 minutes for subsequent requests

:::tip[Insight]
Lambda automatically scales from zero to thousands of concurrent executions. You never configure capacity—AWS handles it based on incoming request rate.
:::

### 5.6. Get Your Hands Dirty

Experiment with serverless orchestration:

1. **Chain functions:** Create a second Lambda function that invokes the first one programmatically
2. **Try different triggers:** Configure Lambda to trigger from S3 uploads, DynamoDB streams, or SQS queues
3. **Add error handling:** Implement retry logic and dead letter queues
4. **Monitor performance:** Use CloudWatch metrics to observe cold start vs. warm invocation latency

When finished:

```bash
$ tofu destroy
```

### 5.7. Serverless Orchestration: Pros and Cons

**Advantages:**
- Zero infrastructure management
- Perfect cost scaling (pay per use, scale to zero)
- Fastest deployment times (< 1 minute)
- Automatic scaling and healing
- Maximum focus on business logic
- Lowest operational overhead

**Disadvantages:**
- Execution time limits (15 minutes for AWS Lambda)
- Size constraints (deployment packages, payloads)
- Cold start latency
- Limited control over performance
- Debugging challenges (no server access)
- Vendor lock-in (platform-specific APIs)
- Not suitable for long-running or stateful workloads

## 6. Comparing Orchestration Options

<ComparisonTable
  title="Orchestration Approaches: Key Characteristics"
  items={[
    {
      feature: "Infrastructure Model",
      option1: "Mutable servers",
      option2: "Immutable VMs",
      option3: "Immutable containers",
      option4: "Functions (no servers)"
    },
    {
      feature: "Deployment Time",
      option1: "Slow (minutes)",
      option2: "5-30 minutes",
      option3: "1-5 minutes",
      option4: "< 1 minute"
    },
    {
      feature: "Scaling",
      option1: "Manual",
      option2: "Auto (ASG)",
      option3: "Auto (K8s)",
      option4: "Auto + scale-to-zero"
    },
    {
      feature: "Resource Efficiency",
      option1: "Low",
      option2: "Medium",
      option3: "High",
      option4: "Very High"
    },
    {
      feature: "Operational Overhead",
      option1: "High",
      option2: "Medium",
      option3: "Medium-High",
      option4: "Low"
    },
    {
      feature: "Flexibility",
      option1: "High",
      option2: "High",
      option3: "Medium",
      option4: "Low"
    },
    {
      feature: "Best For",
      option1: "Legacy apps",
      option2: "Traditional apps",
      option3: "Microservices",
      option4: "Event-driven"
    }
  ]}
  option1Label="Server"
  option2Label="VM"
  option3Label="Container"
  option4Label="Serverless"
  option1Color={colors.slate}
  option2Color={colors.blue}
  option3Color={colors.green}
  option4Color={colors.purple}
/>

### 6.1. When to Use Server Orchestration

**Ideal for:**
- Legacy applications that can't easily be containerized
- Simple deployments with a few servers
- Organizations with limited DevOps expertise
- Maximum flexibility and control requirements
- Applications with unusual OS or kernel requirements

**Avoid when:**
- You need immutable infrastructure
- Scaling requirements are dynamic
- You're building new applications (prefer modern approaches)

### 6.2. When to Use VM Orchestration

**Ideal for:**
- Traditional applications needing immutable infrastructure
- Organizations migrating from on-premises to cloud
- Strong workload isolation requirements
- Applications with specific OS dependencies
- Compliance requirements mandating VM isolation

**Avoid when:**
- Build time is critical (containers are faster)
- Resource efficiency is a priority (containers pack better)
- You need multi-cloud portability (VMs are platform-specific)

### 6.3. When to Use Container Orchestration

**Ideal for:**
- Modern microservices architectures
- Applications requiring rapid deployment cycles
- Multi-cloud or hybrid cloud deployments
- Organizations with DevOps expertise
- High-density workload consolidation
- Applications needing sophisticated orchestration

**Avoid when:**
- Your team lacks container expertise (steep learning curve)
- Applications are simple with minimal scaling needs (potential over-engineering)
- You want to minimize operational overhead (serverless is simpler)

### 6.4. When to Use Serverless Orchestration

**Ideal for:**
- Event-driven architectures
- Highly variable or unpredictable traffic patterns
- Rapid prototyping and MVP development
- Minimizing operational overhead
- Cost-sensitive projects benefiting from scale-to-zero
- Short-lived, stateless workloads

**Avoid when:**
- Functions need to run longer than time limits
- You require fine-grained performance control
- Cold start latency is unacceptable
- Applications maintain long-running connections
- You want to avoid vendor lock-in

:::tip[Insight]
The right orchestration approach depends on your application architecture, team capabilities, and business requirements. Many organizations use multiple approaches for different workloads—containers for core services, serverless for event processing, VMs for legacy apps.
:::

## 7. Adopting Orchestration

### 7.1. Start Small

**In plain English:** Don't try to transform your entire infrastructure overnight. Start with one non-critical application.

**In technical terms:** Choose a low-risk application for initial orchestration adoption. Learn the tools and processes before expanding scope.

**Why it matters:** Orchestration tools have learning curves. Small-scale adoption limits risk while building expertise.

### 7.2. Invest in Training

**In plain English:** Give your team time to learn before expecting production deployments.

**In technical terms:** Allocate dedicated time for training, experimentation, and skill development. Consider formal training or workshops.

**Why it matters:** Rushing into production without proper knowledge leads to outages and frustration. Investment in learning pays off.

### 7.3. Automate Gradually

**In plain English:** Start with basic deployment automation, then add advanced features over time.

**In technical terms:** Begin with simple deployments, then incrementally add auto scaling, health checks, monitoring, secrets management, and other features.

**Why it matters:** Trying to implement everything at once is overwhelming. Gradual automation builds confidence and expertise.

### 7.4. Monitor and Measure

**In plain English:** Track whether orchestration is actually helping—measure deployment time, failures, and costs.

**In technical terms:** Establish baseline metrics before adoption and track deployment frequency, mean time to recovery (MTTR), failure rates, and resource utilization.

**Why it matters:** Metrics validate whether orchestration delivers expected benefits and identify areas for improvement.

### 7.5. Plan for the Transition

**In plain English:** Migrations always take longer than you think. Budget realistic time.

**In technical terms:** Create a phased migration plan with clearly defined milestones, success criteria, and rollback procedures.

**Why it matters:** Unrealistic timelines create pressure for shortcuts that compromise quality and stability.

:::warning[Migration Reality]
Orchestration adoption is a significant undertaking. Even "simple" migrations uncover unexpected complexities. Plan for at least 2-3x your initial time estimate.
:::

## 8. Conclusion

You now understand the four main orchestration approaches and how to choose the right one.

### 8.1. Key Takeaways

**Server orchestration is good for simple deployments** but becomes difficult to manage at scale. Mutable infrastructure leads to configuration drift and operational challenges.

**VM orchestration provides immutable infrastructure** with good isolation and cloud integration, but slower deployment cycles (5-30 minutes) and less efficient resource usage.

**Container orchestration offers speed and efficiency** with fast builds (1-5 minutes), portable images, and sophisticated features. Kubernetes has become the de facto standard.

**Serverless orchestration minimizes operational overhead** and provides perfect cost scaling, but has limitations on execution time, state management, and flexibility.

**Most organizations use multiple orchestration approaches** for different workload types. Choose based on specific application requirements, not universal mandates.

**Adopt orchestration incrementally** starting small, investing in training, and building expertise over time. Avoid big-bang migrations.

### 8.2. Looking Forward

The orchestration landscape continues evolving:

- Kubernetes has become the de facto standard for container orchestration
- Serverless is growing rapidly for event-driven workloads
- Hybrid approaches combining containers and serverless are emerging
- Platform engineering teams build internal platforms on orchestration tools

Understanding all these approaches helps you pick the right tool for each job and adapt as technologies evolve.

### 8.3. Next Steps

In the next chapter, you'll learn about version control and testing—essential practices for managing the code that defines your infrastructure and applications.

---

**Previous:** [Infrastructure as Code](/infrastructure-deployment/ch02-infrastructure-as-code) | **Next:** [Version, Build, and Test](/code-cicd/ch04-version-build-test)
