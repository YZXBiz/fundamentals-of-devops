---
sidebar_position: 4
title: "Orchestration"
description: "Master orchestration tools for managing apps at scale. Learn server, VM, container, and serverless orchestration with Ansible, AWS ASG, Kubernetes, and AWS Lambda."
---

import { ProcessFlow, StackDiagram, CardGrid, ComparisonTable, TreeDiagram, colors } from '@site/src/components/diagrams';

# Chapter 3. How to Manage Your Apps by Using Orchestration Tools

In Chapter 2, you learned how to manage your infrastructure as code. In this chapter, you're going to shift your focus from managing infrastructure to managing apps. This brings us to the domain of orchestration tools, which are tools designed to handle the many requirements that are unique to running apps.

For example, one requirement is figuring out how many copies of your app to run. Running a single copy of your app, as you did in the previous chapter, is fine for learning, and for some use cases, a single copy may be all you ever need. But if your business depends on that app, having just a single copy may cause problems, such as outages due to hardware issues (e.g., the server dies), outages due to software issues (e.g., a bug that causes your app to crash), and outages due to load (e.g., your app becomes so popular, it exceeds the capacity of a single server). In short, a single copy of your app is a single point of failure. To run applications in production, you typically need multiple copies, called replicas, of your app.

Some of the other requirements of running an app include automatically restarting it if it crashes, deploying more replicas when there is heavy load, balancing load across multiple replicas, communicating with other apps, and so on. If you search around, you'll quickly find many orchestration tools that can handle these requirements for you, such as Kubernetes, OpenShift, EC2, Amazon Elastic Container Service (ECS), Nomad, AWS Lambda, Google Cloud Functions, and Azure Serverless. Which one should you use? How do these tools compare?

Most orchestration tools can be grouped into one of the following four categories:

- **Server orchestration** (e.g., use Ansible to deploy code onto a cluster of servers)
- **VM orchestration** (e.g., deploy VMs into an EC2 Auto Scaling group)
- **Container orchestration** (e.g., deploy containers into a Kubernetes cluster)
- **Serverless orchestration** (e.g., deploy functions using AWS Lambda)

To help you navigate the orchestration space, this chapter will walk you through each of these categories. Along the way, you'll work through examples that deploy the same app by using each of these approaches, which will let you see how different orchestration approaches perform across a variety of dimensions (e.g., rolling out updates, load balancing, auto scaling, and auto healing), so that you can pick the right tool for the job. Let's get started by understanding exactly what orchestration is and why it's important.

## Table of Contents

1. [An Introduction to Orchestration](#an-introduction-to-orchestration)
2. [Server Orchestration](#server-orchestration)
3. [VM Orchestration](#vm-orchestration)
4. [Container Orchestration](#container-orchestration)
5. [Serverless Orchestration](#serverless-orchestration)
6. [Comparing Orchestration Options](#comparing-orchestration-options)
7. [Adopting Orchestration](#adopting-orchestration)
8. [Conclusion](#conclusion)

## An Introduction to Orchestration

In the world of classical music, a conductor is responsible for orchestration: the conductor directs the orchestra, coordinating all the individual members to start or stop playing, to increase or decrease the tempo, and to play quieter or louder. In the world of software, an orchestration tool is responsible for orchestration: it directs software clusters, coordinating all the individual apps to start or stop, to increase or decrease the hardware resources available to them, and to increase or decrease the number of replicas.

These days, for many people, the term "orchestration" is associated with Kubernetes, but the underlying needs have been around since the first programmer ran the first app for others to use. Anyone running an app in production needs to solve most or all of the following core orchestration problems:

**Deployment**
You need a way to deploy one or more replicas of your app onto your servers and to periodically roll out updates to your replicas, ideally without your users experiencing downtime (known as a zero-downtime deployment).

**Scheduling**
For each deployment, you need to decide which apps should run on which servers, ensuring that each app gets the resources (CPU, memory, disk space) it needs. This is known as scheduling. With some orchestration tools, you do the scheduling yourself, manually. Other orchestration tools provide a scheduler that can do it automatically, and this scheduler usually implements some sort of bin packing algorithm to try to use the resources available as efficiently as possible.

**Rollback**
If a problem occurs when rolling out an update, you need a way to roll back all replicas to a previous version.

**Auto scaling**
As load goes up or down, you need a way to automatically scale your app up or down in response. With vertical scaling, you scale the resources available to your existing servers up or down, such as getting faster CPUs, more memory, or bigger hard drives. With horizontal scaling, you deploy more servers and/or more replicas of your app across your servers.

**Auto healing**
You need something to monitor your apps, detect whether they are not healthy (i.e., the app is not responding correctly or at all), and to automatically restart or replace unhealthy apps or servers.

**Load balancing**
If you are running multiple replicas of your app, you may need a way to distribute traffic across all those replicas.

**Configuration**
If you have multiple environments, you need a way to configure the app differently in each environment (e.g., use different domain names or different memory settings in dev, stage, and prod).

**Secrets management**
You may need a way to securely pass sensitive configuration data to your apps (e.g., passwords, API keys).

**Service communication**
If you are running multiple apps, you may need to give them a way to communicate with one another, including a way to find out how to connect to other apps (service discovery), and ways to control and monitor that communication, including authentication, authorization, encryption, error handling, and observability (service mesh).

**Disk management**
If your app stores data on a hard drive, then as you deploy replicas of your app, you need to ensure that the right hard drives end up with the right replicas.

Over the years, dozens of approaches have been used to solve each of these problems. In the pre-cloud era, since every on-prem deployment was different, most companies wrote their own bespoke solutions, typically consisting of gluing together various scripts and tools to solve each problem. Nowadays, the industry is starting to standardize around four broad types of solutions: server orchestration, VM orchestration, container orchestration, and serverless orchestration. The following sections dive into each of these, starting with server orchestration.

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

## Server Orchestration

The original approach used in the pre-cloud era, and one that, for better or worse, is still fairly common today, is to do the following:

- Set up a bunch of servers.
- Deploy your apps across the servers.
- When you need to roll out changes, update the servers in place.

I've seen companies use a variety of tools for implementing this approach, including configuration management tools (e.g., Chef, Puppet, and Ansible, as you saw in Chapter 2), specialized deployment scripts (e.g., Capistrano, Deployer, Mina), and, perhaps most common of all, ad hoc scripts.

Because this approach predates the cloud era, it also predates most attempts at creating standardized tooling for it, and I'm not aware of any single, commonly accepted name for it. Most people would just refer to it as "deployment tooling," as deployment was the primary focus (as opposed to auto scaling, auto healing, and service discovery). For the purposes of this book, I'll refer to it as server orchestration, to disambiguate it from the newer orchestration approaches you'll see later, such as VM and container orchestration.

> **Insight**
>
> Server orchestration is an older, mutable infrastructure approach utilizing a fixed set of servers that you maintain and update in place.

To get a feel for server orchestration, let's use Ansible. In Chapter 2, you saw how to deploy a single EC2 instance using Ansible. In this section, you'll see how to use Ansible to deploy multiple instances to run the sample app, configure nginx to distribute load across the instances, and roll out updates across the instances without downtime.

### Example: Deploy an App Securely and Reliably by Using Ansible

> **Example Code**
>
> As a reminder, you can find all the code examples in the book's repo in GitHub.

The first thing you need for server orchestration is a bunch of servers. You can spin up several EC2 instances by reusing the Ansible playbook and inventory file you created in Chapter 2. Head into the `fundamentals-of-devops` folder you've been using to work through the examples in this book, create a new `ch3/ansible` subfolder, and copy into that subfolder `create_ec2_instances_playbook.yml` and `inventory.aws_ec2.yml` from Chapter 2:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch3/ansible
$ cp ch2/ansible/create_ec2_instances_playbook.yml ch3/ansible/
$ cp ch2/ansible/inventory.aws_ec2.yml ch3/ansible/
$ cd ch3/ansible
```

This time, you'll override the default variables in the playbook to create multiple EC2 instances with different names and ports. To do this, create a file called `sample-app-vars.yml` with the contents shown in Example 3-1.

**Example 3-1.** Sample app variables file (`ch3/ansible/sample-app-vars.yml`)

```yaml
num_instances: 3
base_name: sample_app_instances
http_port: 8080
```

This variables file will create three servers named `sample_app_instances` that allow incoming HTTP requests on port 8080. To run the playbook, authenticate to AWS, and run the `ansible-playbook` command, adding the `--extra-vars` flag to pass in the variables file:

```bash
$ ansible-playbook \
  -v create_ec2_instances_playbook.yml \
  --extra-vars "@sample-app-vars.yml"
```

Next, you'll need to create a group variables file to configure the SSH user, private key, and host key checking settings. Since `sample-app-vars.yml` set `base_name` to `sample_app_instances`, create a file called `group_vars/sample_app_instances.yml` with the contents shown in Example 3-2.

**Example 3-2.** Sample app group variables (`ch3/ansible/group_vars/sample_app_instances.yml`)

```yaml
ansible_user: ec2-user
ansible_ssh_private_key_file: sample_app_instances.key
ansible_host_key_checking: false
```

Now you can configure the servers in this group to run the Node.js sample app, but with improved security and reliability. As explained in "Watch Out for Snakes: These Examples Have Several Problems", the code used to deploy apps in the previous chapters had security and reliability issues (e.g., running the app as a root user, listening on port 80, and no automatic app restart in case of crashes). It's time to fix these issues and get this code closer to something you could use in production.

Create a new playbook called `configure_sample_app_playbook.yml` with the contents shown in Example 3-3.

**Example 3-3.** Sample app playbook (`ch3/ansible/configure_sample_app_playbook.yml`)

```yaml
- name: Configure servers to run the sample-app
  hosts: sample_app_instances  # 1
  gather_facts: true
  become: true
  roles:
    - role: nodejs-app  # 2
    - role: sample-app  # 3
      become_user: app-user  # 4
```

Here's what this playbook does:

1. **Target the sample_app_instances group.**
2. **Use the nodejs-app role**: Instead of a single sample-app role that does everything, as you saw in Chapter 2, the code in this chapter uses two roles. The first role, called `nodejs-app`, is responsible for configuring a server to run Node.js apps.
3. **Use the sample-app role**: The second role is called `sample-app`, and it's responsible for running the sample app.
4. **Run as app-user**: The sample-app role will be executed as the OS user `app-user`, which is a user that the nodejs-app role creates, rather than as the root user.

For the `nodejs-app` role, create the file `roles/nodejs-app/tasks/main.yml` with code to:
- Add the Node.js Yum repository
- Install Node.js
- Create an `app-user` with limited permissions
- Install PM2 (a process supervisor) and configure it to run at startup

For the `sample-app` role, you copy the app code, start it using PM2, and save the PM2 app list so it survives reboots.

To try this code, authenticate to AWS and run:

```bash
$ ansible-playbook -v -i inventory.aws_ec2.yml configure_sample_app_playbook.yml
```

Ansible will discover your servers, and on each one, install Node.js and run your sample app. Open `http://<IP>:8080` in your web browser, and you should see the familiar "Hello, World!" text.

### Example: Deploy a Load Balancer by Using Ansible and nginx

While three servers is great for redundancy, it's not so great for usability, as your users typically want just a single endpoint to hit. This requires deploying a load balancer.

A load balancer is a piece of software that can distribute load across multiple servers or apps. You give your users a single endpoint to hit, which is the load balancer, and under the hood, the load balancer forwards the requests it receives to multiple endpoints, using various algorithms (e.g., round-robin, hash-based, or least-response-time) to process requests as efficiently as possible.

You'll deploy nginx as your load balancer. First, create one more EC2 instance using a new variables file `nginx-vars.yml`:

```yaml
num_instances: 1
base_name: nginx_instances
http_port: 80
```

Run the playbook:

```bash
$ ansible-playbook \
  -v create_ec2_instances_playbook.yml \
  --extra-vars "@nginx-vars.yml"
```

Configure the nginx instance by using an Ansible role from the book's sample code repo. Create `requirements.yml`:

```yaml
- name: nginx
  src: https://github.com/brikis98/devops-book-nginx-role
  version: 1.0.0
```

Install the role:

```bash
$ ansible-galaxy role install -r requirements.yml
```

Create `configure_nginx_playbook.yml` to configure nginx to load-balance across your sample app servers. Run it:

```bash
$ ansible-playbook -v -i inventory.aws_ec2.yml configure_nginx_playbook.yml
```

Open the nginx server URL in your browser, and you should see "Hello, World!" Each time you refresh, nginx will send the request to a different EC2 instance using round-robin load balancing.

### Example: Roll Out Updates with Ansible

Ansible supports rolling deployments. Update `configure_sample_app_playbook.yml`:

```yaml
- name: Configure servers to run the sample-app
  # ... (other params omitted) ...
  serial: 1  # 1
  max_fail_percentage: 30  # 2
```

1. Setting `serial` to 1 tells Ansible to apply changes to one server at a time.
2. The `max_fail_percentage` parameter tells Ansible to abort if more than 30% of servers hit an error.

Update the text in `app.js` to "Fundamentals of DevOps!" and rerun the playbook. Ansible will roll out the change to one server at a time, ensuring zero downtime.

> **Get Your Hands Dirty**
>
> - Figure out how to scale from three to four instances
> - Try restarting one instance - how does nginx handle it?
> - Try terminating one instance - how can you restore it?
>
> When done, manually undeploy the EC2 instances to avoid charges.

Now that you've seen server orchestration, let's move on to VM orchestration.

## VM Orchestration

The idea with VM orchestration is to do the following:

- Create VM images that have your apps and all their dependencies fully installed and configured.
- Deploy the VM images across a cluster of servers.
- Scale the number of servers up or down depending on your needs.
- When you need to deploy an update, create new VM images, deploy those onto new servers, and then undeploy the old servers.

This is a slightly more modern approach that works best with cloud providers such as AWS, Google Cloud, and Azure, where the servers are all virtual servers, so you can spin up new ones and tear down old ones in minutes.

> **Insight**
>
> VM orchestration is an immutable infrastructure approach that deploys and manages VM images across virtualized servers.

Let's go through an example of VM orchestration. You will learn how to build a VM image using Packer, deploy the VM image across multiple instances, configure a load balancer to distribute load across the instances, and roll out updates across the instances without downtime.

### Example: Build a VM Image by Using Packer

Head into the `fundamentals-of-devops` folder and create a new subfolder for the Packer code:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch3/packer
```

Copy the Packer template and install script from Chapter 2, along with the sample app code. Update the Packer template to:
- Copy the sample-app folder to the server
- Install Node.js, create an app-user, install PM2, and configure PM2 to run on boot

Build the AMI:

```bash
$ cd ch3/packer
$ packer init sample-app.pkr.hcl
$ packer build sample-app.pkr.hcl
```

When the build is done (3-5 minutes), Packer will output the ID of the newly created AMI.

### Example: Deploy a VM Image in an Auto Scaling Group by Using OpenTofu

The next step is to deploy the AMI. You'll use an AWS Auto Scaling group (ASG), which can deploy multiple instances and manage them automatically.

Use the `asg` module from the book's sample code repo. Create a `live/asg-sample` folder and add `main.tf`:

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

The user data script simply starts the app:

```bash
#!/usr/bin/env bash
set -e

su app-user <<'EOF'
cd /home/app-user/sample-app
pm2 start app.config.js
pm2 save
EOF
```

### Example: Deploy an Application Load Balancer by Using OpenTofu

Use the `alb` module to deploy an Application Load Balancer:

```hcl
module "alb" {
  source  = "brikis98/devops/book//modules/alb"
  version = "1.0.0"

  name                  = "sample-app-alb"
  alb_http_port         = 80
  app_http_port         = 8080
  app_health_check_path = "/"
}
```

Connect the ALB to the ASG by setting `target_group_arns`:

```hcl
module "asg" {
  # ... (other params omitted) ...
  target_group_arns = [module.alb.target_group_arn]
}
```

Deploy:

```bash
$ tofu init
$ tofu apply
```

Open the ALB domain name in your browser - you should see "Hello, World!"

### Example: Roll Out Updates with OpenTofu and Auto Scaling Groups

Enable instance refresh in the ASG:

```hcl
module "asg" {
  # ... (other params omitted) ...

  instance_refresh = {
    min_healthy_percentage = 100
    max_healthy_percentage = 200
    auto_rollback          = true
  }
}
```

Update the app to say "Fundamentals of DevOps!", build a new AMI with Packer, and run `tofu apply` again. AWS will perform a zero-downtime rolling deployment, replacing instances one at a time.

> **Get Your Hands Dirty**
>
> - Add version numbers to AMI names for precise control
> - Scale from three to four instances
> - Try terminating an instance - how do ALB and ASG handle it?
>
> When done, run `tofu destroy` to clean up.

You've now seen server and VM orchestration. Let's move on to container orchestration.

## Container Orchestration

With container orchestration, you do the following:

- Create container images that have your apps and all their dependencies fully installed and configured.
- Deploy the container images across a cluster of servers, with potentially multiple containers per server, packed in as efficiently as possible (bin packing).
- Automatically scale the number of servers or containers up or down, depending on load.
- When you need to deploy an update, create new container images, deploy them into the cluster, and then undeploy the old containers.

Although containers have been around for decades, container orchestration started to explode in popularity around 2013, with the emergence of Docker and Kubernetes. The reason for this popularity is that containers and container orchestration offer advantages over VMs and VM orchestration:

**Speed**
Containers typically build faster than VMs (1-5 minutes vs 5-30 minutes).

**Efficiency**
Container orchestration tools have built-in schedulers that use bin packing algorithms to use resources efficiently.

**Portability**
Containers and container orchestration are supported everywhere - on prem and in all major clouds.

**Local development**
Running containers locally is lightweight and practical, unlike VMs.

**Functionality**
Container orchestration tools solved more orchestration problems out of the box than VM orchestration tools.

> **Insight**
>
> Container orchestration is an immutable infrastructure approach that deploys and manages container images across a cluster of servers.

Let's learn Docker, followed by Kubernetes, and finally use Docker and Kubernetes in AWS.

### Example: A Crash Course on Docker

First, install Docker Desktop (minimum version 4.0). Use the `docker run` command to run Docker images locally:

```bash
$ docker run -it ubuntu:24.04 bash
```

Docker downloads the Ubuntu image from Docker Hub and runs it in an isolated container. Try running commands like `ls -al` - you're in a completely isolated filesystem!

Exit with Ctrl-D. Docker containers are isolated from the host OS and from each other.

### Example: Create a Docker Image for a Node.js App

Create a `ch3/docker` folder and copy the sample app. Create a Dockerfile:

```dockerfile
FROM node:21.7
WORKDIR /home/node/app
COPY app.js .
EXPOSE 8080
USER node
CMD ["node", "app.js"]
```

Build the Docker image:

```bash
$ docker build -t sample-app:v1 .
```

Run it:

```bash
$ docker run -p 8080:8080 -it --init sample-app:v1
```

Open `http://localhost:8080` - you should see "Hello, World!"

### Example: Deploy a Dockerized App with Kubernetes

Kubernetes (K8S) is a container orchestration tool consisting of:

**Control plane**
Manages the cluster, stores state, monitors containers, coordinates actions.

**Worker nodes**
Servers that run your container workloads.

Enable Kubernetes in Docker Desktop. Install kubectl and configure it:

```bash
$ kubectl config use-context docker-desktop
$ kubectl get nodes
```

Create a Kubernetes Deployment in `sample-app-deployment.yml`:

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

Apply it:

```bash
$ kubectl apply -f sample-app-deployment.yml
$ kubectl get deployments
$ kubectl get pods
```

### Example: Deploy a Load Balancer with Kubernetes

Create a Kubernetes Service in `sample-app-service.yml`:

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

Apply it:

```bash
$ kubectl apply -f sample-app-service.yml
$ kubectl get services
```

Open `http://localhost` - you should see "Hello, World!"

### Example: Roll Out Updates with Kubernetes

Enable rolling updates in the Deployment:

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 3
      maxUnavailable: 0
```

Update the app, build `sample-app:v2`, update the Deployment YAML, and apply:

```bash
$ docker build -t sample-app:v2 .
$ kubectl apply -f sample-app-deployment.yml
```

Kubernetes performs a zero-downtime rolling deployment!

### Example: Deploy a Kubernetes Cluster in AWS by Using EKS

For production, use Amazon EKS to manage your Kubernetes cluster. Use the `eks-cluster` module:

```hcl
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
$ tofu init
$ tofu apply
```

Authenticate:

```bash
$ aws eks update-kubeconfig --region us-east-2 --name eks-sample
$ kubectl get nodes
```

### Example: Push a Docker Image to ECR

Create an ECR repository:

```hcl
module "repo" {
  source  = "brikis98/devops/book//modules/ecr-repo"
  version = "1.0.0"

  name = "sample-app"
}
```

Build for multiple architectures:

```bash
$ docker buildx create --use --platform=linux/amd64,linux/arm64 --name multi-platform-builder
$ docker buildx build --platform=linux/amd64,linux/arm64 --load -t sample-app:v3 .
```

Tag and push:

```bash
$ docker tag sample-app:v3 <YOUR_ECR_REPO_URL>:v3
$ docker push <YOUR_ECR_REPO_URL>:v3
```

### Example: Deploy a Dockerized App into an EKS Cluster

Update your Deployment to use the ECR image URL and apply:

```bash
$ kubectl apply -f sample-app-deployment.yml
$ kubectl apply -f sample-app-service.yml
$ kubectl get services
```

Open the ELB URL - you should see your app running in EKS!

> **Get Your Hands Dirty**
>
> - Deploy an ALB instead of Classic Load Balancer
> - Try terminating a worker node - how do ELB and EKS handle it?
>
> When done, run `tofu destroy` on both modules.

You've now seen server orchestration, VM orchestration, and container orchestration. That leaves just one orchestration approach: serverless orchestration.

## Serverless Orchestration

The idea behind serverless is to allow you to focus entirely on your app code, without having to think about servers at all. The original model referred to as "serverless" was functions as a service (FaaS), which works as follows:

- Create a deployment package with source code for one function
- Upload to your serverless provider (AWS, Google Cloud, Azure)
- Configure triggers (e.g., HTTP request, file upload, queue message)
- When triggered, the provider executes your function
- To update, create and upload a new deployment package

> **Insight**
>
> Serverless orchestration is an immutable infrastructure approach that deploys and manages functions without you having to think about servers at all.

Key advantages of FaaS:

**Focus on code, not hardware**
You don't think about servers, clusters, auto scaling, or auto healing.

**Focus on code, not OS**
The deployment package includes only app code. The provider handles the OS.

**Even more speed**
Build-and-deploy takes less than a minute vs 1-5 minutes for containers.

**Even more efficiency**
Short-running functions can be scheduled more efficiently than long-running apps.

**Perfect scaling with usage**
Pay only for what you use, including scale-to-zero. Performance improvements directly reduce costs.

Limitations of FaaS:

- Size limits (deployment package, payloads)
- Time limits (e.g., 15 minutes max for AWS Lambda)
- Limited disk space (ephemeral storage)
- Limited control over performance tuning
- Debugging challenges (no direct server access)
- Cold starts (initial run overhead)
- Complications with long-running connections

### Example: Deploy a Serverless Function with AWS Lambda

Use the `lambda` module to deploy a Lambda function:

```hcl
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

Create `src/index.js`:

```javascript
exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: 'Hello, World!'
  };
};
```

Deploy:

```bash
$ tofu init
$ tofu apply
```

### Example: Deploy a Lambda Function URL

Add a function URL to trigger the Lambda:

```hcl
module "function_url" {
  source  = "brikis98/devops/book//modules/lambda-url"
  version = "1.0.0"

  function_name = module.function.name
}
```

Apply and open the function URL - you should see "Hello, World!"

> **Get Your Hands Dirty**
>
> - Create a second Lambda function triggered by the first
> - Try other Lambda triggers (S3, DynamoDB, SQS)
>
> When done, run `tofu destroy`.

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

## Comparing Orchestration Options

Now that you've seen all four orchestration approaches, how do they compare? Here are some key considerations:

### When to Use Server Orchestration

- Legacy applications that can't easily be containerized
- Simple deployments with a few servers
- Organizations with limited DevOps expertise
- When you need maximum flexibility and control

### When to Use VM Orchestration

- Traditional applications that need immutable infrastructure
- Organizations migrating from on-prem to cloud
- When you need strong isolation between workloads
- Applications with specific OS requirements

### When to Use Container Orchestration

- Modern microservices architectures
- Applications that need rapid deployment cycles
- When you need portability across clouds
- Organizations with DevOps expertise
- High-density workload consolidation

### When to Use Serverless Orchestration

- Event-driven architectures
- Highly variable or unpredictable traffic
- Prototype and MVP development
- When you want to minimize operational overhead
- Cost-sensitive projects that benefit from scale-to-zero

> **Insight**
>
> The right orchestration approach depends on your application architecture, team capabilities, and business requirements. Many organizations use multiple approaches for different workloads.

## Adopting Orchestration

Adopting any orchestration approach requires careful planning:

**Start small**
Don't try to migrate everything at once. Start with one non-critical application.

**Invest in training**
Orchestration tools have learning curves. Give your team time to learn.

**Automate gradually**
Start with basic deployment automation, then add more sophisticated features over time.

**Monitor and measure**
Track metrics like deployment time, failure rates, and resource utilization.

**Plan for the transition**
Budget time for the migration. It always takes longer than expected.

## Conclusion

You now understand the four main orchestration approaches and when to use each one. Here are the key takeaways:

1. **Server orchestration is good for simple deployments** but becomes difficult to manage at scale with mutable infrastructure.

2. **VM orchestration provides immutable infrastructure** with good isolation but slower deployment cycles.

3. **Container orchestration offers speed and efficiency** with fast builds, portable images, and sophisticated orchestration features.

4. **Serverless orchestration minimizes operational overhead** and provides perfect cost scaling but has limitations on execution time and flexibility.

5. **Most organizations use multiple orchestration approaches** for different types of workloads based on their specific requirements.

6. **Adopt orchestration incrementally** starting small and building up expertise over time.

The orchestration landscape continues to evolve. Kubernetes has become the de facto standard for container orchestration, while serverless is growing rapidly for event-driven workloads. Understanding all these approaches helps you pick the right tool for each job.

In the next chapter, you'll learn about version control and testing, which are essential for managing the code that defines your infrastructure and applications.

---

**Previous:** [Infrastructure as Code](/infrastructure-deployment/ch02-infrastructure-as-code) | **Next:** [Version, Build, and Test](/code-cicd/ch04-version-build-test)
