---
sidebar_position: 3
title: "Infrastructure as Code"
description: "Master infrastructure as code with ad hoc scripts, configuration management tools, server templating, and provisioning tools. Learn to automate infrastructure with Ansible, Packer, and OpenTofu."
---

import { ProcessFlow, StackDiagram, CardGrid, ComparisonTable, TreeDiagram, colors } from '@site/src/components/diagrams';

# Chapter 2. How to Manage Your Infrastructure as Code

In Chapter 1, you learned how to deploy your app by using PaaS and IaaS, but it required a lot of manual steps clicking around a web UI. This is fine while you're learning and experimenting, but managing everything at a company this way—sometimes called ClickOps—quickly leads to problems:

**Deployments are slow and tedious**
You can't deploy frequently or respond to problems or opportunities quickly.

**Deployments are error prone and inconsistent**
You end up with lots of bugs, outages, and late-night debugging sessions. You become fearful and slow to introduce new features.

**Only one person knows how to deploy**
That person is overloaded and never has time for long-term improvements. If they were to leave or get hit by a bus, everything would grind to a halt.

Fortunately, these days, there is a better way to do things: you can manage your infrastructure as code (IaC). Instead of clicking around manually, you use code to define, deploy, update, and destroy your infrastructure. This represents a key insight of DevOps: most tasks that you used to do manually can now be automated using code, as shown in Table 2-1.

**Table 2-1.** A key insight of DevOps is that you can manage almost everything as code

| Task | How to manage as code | Example | Chapter |
|------|----------------------|---------|---------|
| Provision servers | Provisioning tools | Use OpenTofu to deploy a server | This chapter |
| Configure servers | Server templating tools | Use Packer to create an image of a server | This chapter |
| Configure apps | Configuration files and services | Read configuration from a JSON file | Chapter 6 |
| Configure networking | Software-defined networking | Use Istio as a service mesh | Chapter 7 |
| Build apps | Build systems | Build your app with npm | Chapter 4 |
| Test apps | Automated tests | Write automated tests using Jest | Chapter 4 |
| Deploy apps | Automated deployment | Do a rolling deployment with Kubernetes | Chapter 3 |
| Scale apps | Auto scaling | Set up auto-scaling policies in AWS | Chapter 3 |
| Recover from outages | Auto healing | Set up liveness probes in Kubernetes | Chapter 3 |
| Manage databases | Schema migrations | Use Knex.js to update your database schema | Chapter 9 |
| Test for compliance | Policy as code | Check compliance via Open Policy Agent | Chapter 4 |

If you search around, you'll quickly find many tools that allow you to manage your infrastructure as code, including Chef, Puppet, Ansible, Pulumi, Terraform, OpenTofu, AWS, CloudFormation, Docker, and Packer. Which one should you use? Many of the comparisons you find online do little more than list the general properties of each tool and make it sound like you could be equally successful with any of them. And while that's true in theory, it's not true in practice. These tools differ considerably from one another, and your odds of success go up significantly if you know how to pick the right tool for the job.

This chapter will help you navigate the IaC space by introducing you to the four most common categories of IaC tools:

- Ad hoc scripts (e.g., using a Bash script to deploy a server)
- Configuration management tools (e.g., using Ansible to deploy a server)
- Server templating tools (e.g., using Packer to build an image of a server)
- Provisioning tools (e.g., using OpenTofu to deploy a server)

You'll work through examples to deploy the same infrastructure by using each of these approaches, which will allow you to see how different IaC categories perform across a variety of dimensions (e.g., verbosity, consistency, and scale), so that you can pick the right tool for the job.

Note that this chapter focuses on tools for managing infrastructure, whereas the next chapter focuses on tools for managing apps. These two domains have a lot of overlap, as you deploy infrastructure to run apps, and you may even deploy those apps by using IaC tools (you'll see examples of just that in this chapter). However, as you'll see, there are key differences between the infrastructure domain and the app domain. In the infrastructure domain, you use IaC tools such as OpenTofu to configure servers, load balancers, and networks. In the app domain you use orchestration tools such as Kubernetes to handle scheduling, auto scaling, auto healing, and service communication.

Before digging into the details of various IaC tools, it's worth asking, why bother? Learning and adopting new tools has a cost, so what are the benefits of IaC that make this worthwhile? This is the focus of the next section.

## Table of Contents

1. [The Benefits of IaC](#the-benefits-of-iac)
2. [Ad Hoc Scripts](#ad-hoc-scripts)
3. [Configuration Management Tools](#configuration-management-tools)
4. [Server Templating Tools](#server-templating-tools)
5. [Provisioning Tools](#provisioning-tools)
6. [Using Multiple IaC Tools Together](#using-multiple-iac-tools-together)
7. [Adopting IaC](#adopting-iac)
8. [Conclusion](#conclusion)

## The Benefits of IaC

When your infrastructure is defined as code, you can use a variety of software engineering practices to dramatically improve your software delivery processes, including the following:

**Speed and safety**
Instead of a person doing deployments manually, which is slow and error prone, defining your infrastructure as code allows a computer to carry out the deployment steps, which will be significantly faster and more reliable.

**Documentation**
If your infrastructure is defined as code, the state of your infrastructure is in source files that anyone can read, rather than locked away in a single person's head. IaC acts as a form of documentation, allowing everyone in the organization to understand how things work.

**Version control**
Storing your IaC source files in version control (which you'll do in Chapter 4) makes it easier to collaborate on your infrastructure, debug issues (e.g., by checking the version history to find out what changed), and to resolve issues (e.g., by reverting back to a previous version).

**Validation**
If the state of your infrastructure is defined in code, for every single change, you can perform a code review, run a suite of automated tests, and pass the code through static analysis tools—all practices known to significantly reduce the chance of defects (you'll see examples of all these practices in Chapter 4).

**Self-service**
If your infrastructure is defined in code, developers can kick off their own deployments instead of relying on others to do it.

**Reuse**
You can package your infrastructure into reusable modules so that instead of doing every deployment for every product in every environment from scratch, you can build on top of known, documented, battle-tested pieces.

**Happiness**
One other important, and often overlooked, reason that you should use IaC is happiness. Manual deployments are repetitive and tedious. Most people resent this type of work, since it involves no creativity, no challenge, and no recognition. You could deploy code perfectly for months, and no one will take notice—until that one day when you mess it up. IaC offers a better alternative that allows computers to do what they do best (automation) and developers to do what they do best (creativity).

Now that you have a sense of why IaC is so valuable, in the following sections, you'll explore the most common categories of IaC tools, starting with ad hoc scripts.

<CardGrid
  columns={2}
  cards={[
    {
      title: "Ad Hoc Scripts",
      description: "Write custom scripts in Bash, Python, or Ruby to automate tasks",
      items: [
        "Great for one-off tasks",
        "Full programming flexibility",
        "No special tooling required",
        "Can become messy at scale"
      ],
      color: colors.slate
    },
    {
      title: "Configuration Management",
      description: "Tools like Ansible, Chef, and Puppet for server configuration",
      items: [
        "Designed for server config",
        "Agent-based or agentless",
        "Mutable infrastructure",
        "Idempotent operations"
      ],
      color: colors.blue
    },
    {
      title: "Server Templating",
      description: "Create VM or container images with Packer and Docker",
      items: [
        "Immutable infrastructure",
        "Fast, consistent deploys",
        "Snapshot entire systems",
        "Works with orchestration"
      ],
      color: colors.green
    },
    {
      title: "Provisioning Tools",
      description: "Deploy infrastructure with OpenTofu, Terraform, CloudFormation",
      items: [
        "Declarative approach",
        "Full CRUD support",
        "State management",
        "Multi-cloud capable"
      ],
      color: colors.purple
    }
  ]}
/>

## Ad Hoc Scripts

The first approach you might think of for managing your infrastructure as code is to use an ad hoc script. You take whatever task you were doing manually, break it into discrete steps, and use your favorite scripting language (e.g., Bash, Ruby, Python) to capture each of those steps in code. When you run that code, it can automate the process of creating infrastructure for you. The best way to understand this is to try it out, so let's go through an example of an ad hoc script written in Bash, and then you'll learn about the strengths and weaknesses of using scripts for managing infrastructure.

### Example: Deploy an EC2 Instance by Using a Bash Script

> **Example Code**
>
> As a reminder, you can find all the code examples in the book's repo in GitHub.

As an example, let's create a Bash script that automates all the manual steps you did in Chapter 1 to deploy a simple Node.js app in AWS. Head into the `fundamentals-of-devops` folder you created in Chapter 1 to work through the examples in this book, and create a new subfolder for this chapter and the Bash script:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch2/bash
```

Copy the exact same user data script from Chapter 1 into a file called `user-data.sh` within the `ch2/bash` folder:

```bash
$ cp ch1/ec2-user-data-script/user-data.sh ch2/bash/
```

Next, create a Bash script called `deploy-ec2-instance.sh`, with the contents shown in Example 2-1.

**Example 2-1.** Bash script to deploy an EC2 instance (`ch2/bash/deploy-ec2-instance.sh`)

```bash
#!/usr/bin/env bash

set -e

export AWS_DEFAULT_REGION="us-east-2"
user_data=$(cat user-data.sh)

# 1
security_group_id=$(aws ec2 create-security-group \
  --group-name "sample-app" \
  --description "Allow HTTP traffic into the sample app" \
  --output text \
  --query GroupId)

# 2
aws ec2 authorize-security-group-ingress \
  --group-id "$security_group_id" \
  --protocol tcp \
  --port 80 \
  --cidr "0.0.0.0/0" > /dev/null

# 3
image_id=$(aws ec2 describe-images \
  --owners amazon \
  --filters 'Name=name,Values=al2023-ami-2023.*-x86_64' \
  --query 'reverse(sort_by(Images, &CreationDate))[:1] | [0].ImageId' \
  --output text)

# 4
instance_id=$(aws ec2 run-instances \
  --image-id "$image_id" \
  --instance-type "t2.micro" \
  --security-group-ids "$security_group_id" \
  --user-data "$user_data" \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=sample-app}]' \
  --output text \
  --query Instances[0].InstanceId)

public_ip=$(aws ec2 describe-instances \
  --instance-ids "$instance_id" \
  --output text \
  --query 'Reservations[*].Instances[*].PublicIpAddress')

# 5
echo "Instance ID = $instance_id"
echo "Security Group ID = $security_group_id"
echo "Public IP = $public_ip"
```

If you're not an expert in Bash syntax, all you have to know about this script is that it uses the AWS CLI to automate the exact steps you did manually in the AWS console in Chapter 1:

1. Create a security group.
2. Update the security group to allow inbound HTTP requests on port 80.
3. Look up the ID of the Amazon Linux AMI.
4. Deploy an EC2 instance that will run the Amazon Linux AMI from 3, on a t2.micro instance, with the security group from 1, the user data script from `user-data.sh`, and the Name tag set to `sample-app`.
5. Output the IDs of the security group and EC2 instance and the public IP of the EC2 instance.

> **Watch Out for Snakes: These Simplified Examples Are for Learning, Not Production**
>
> The examples in this chapter are still simplified for learning and not suitable for production usage, because of the security concerns and user data limitations explained in "Watch Out for Snakes: These Examples Have Several Problems". You'll see how to resolve these limitations in the next chapter.

If you want to run the script, you first need to give it execute permissions:

```bash
$ cd ch2/bash
$ chmod u+x deploy-ec2-instance.sh
```

Next, install the AWS CLI (minimum version 2.0), authenticate to AWS, and run the script as follows:

```bash
$ ./deploy-ec2-instance.sh
Instance ID = i-0335edfebd780886f
Security Group ID = sg-09251ea2fe2ab2828
Public IP = 52.15.237.52
```

After the script finishes, give the EC2 instance a minute or two to boot up and then try opening `http://<Public IP>` in your web browser, where `<Public IP>` is the IP address the script outputs at the end. You should see this:

```
Hello, World!
```

Congrats, you are now running your app by using an ad hoc script!

> **Get Your Hands Dirty**
>
> Here are a few exercises you can try at home to go deeper:
>
> - What happens if you run the Bash script a second time? Why?
> - How do you change the script to run multiple EC2 instances?
>
> When you're done experimenting with this script, you should manually undeploy the EC2 instance, as shown previously in Figure 1-9. This ensures that your account doesn't start accumulating any unwanted charges.

You've now seen one way to manage your infrastructure as code. Well, sort of. This script, and most ad hoc scripts, have quite a few drawbacks in terms of using them to manage infrastructure, as discussed next.

### How Ad Hoc Scripts Stack Up

You can use certain criteria, which I'll refer to as the IaC category criteria, to compare categories of IaC tools. In this section, I'll flush out how ad hoc scripts stack up according to the IaC category criteria; in later sections, you'll see how the other IaC categories perform along the same criteria, giving you a consistent way to compare the options. Here are the criteria:

**CRUD**
CRUD stands for create, read, update, and delete. To manage infrastructure as code, you typically need support for all four of these operations, whereas most ad hoc scripts handle only one: create. For example, this script can create a security group and EC2 instance, but if you run this script a second or third time, the script doesn't know how to "read" the state of the world, so it has no awareness that the security group and EC2 instance already exist, and will always try to create new infrastructure from scratch. Likewise, this script has no built-in support for deleting any of the infrastructure it creates (which is why you had to manually terminate the EC2 instance). So while ad hoc scripts make it faster to create infrastructure, they don't really help you manage it.

**Scale**
Solving the CRUD problem in an ad hoc script for a single EC2 instance is hard enough, but a real architecture may contain hundreds of instances, plus databases, load balancers, networking configuration, and so on. There's no easy way to scale up scripts to keep track of and manage so much infrastructure.

**Deployment strategies**
In real-world architectures, you typically need to use various deployment strategies to roll out updates, such as rolling deployments and blue-green deployments (you'll learn more about deployment strategies in Chapter 5). With ad hoc scripts, you'd have to write the logic for each deployment strategy from scratch.

**Idempotency**
To manage infrastructure, you typically want code that is idempotent, which means it's safe to rerun multiple times, as it will always produce the same effect as if you ran it once. Most ad hoc scripts are not idempotent. For example, if you ran the Bash script once, and it created the security group and EC2 instance, and then you ran the script again, it would try to create another security group and EC2 instance. This is probably not what you want, and it would also lead to an error, as you can't have two security groups with the same name.

**Consistency**
The great thing about ad hoc scripts is that you can use any programming language you want, and you can write the code however you want. The terrible thing about ad hoc scripts is that you can use any programming language you want, and you can write the code however you want. I wrote the Bash script one way; you might write it another way; your coworker may choose a different language entirely. If you've ever had to maintain a large repository of ad hoc scripts, you know that it almost always devolves into a mess of unmaintainable spaghetti code. As you'll see shortly, tools that are designed specifically for managing infrastructure as code often provide a single, idiomatic way to solve each problem, so your codebase tends to be more consistent and easier to maintain.

**Verbosity**
The Bash script to launch a simple EC2 instance, plus the user data script, add up to around 80 lines of code—and that's without the code for CRUD, deployment strategies, and idempotency. An ad hoc script that handles all these properly would be many times longer. And we're talking about just one EC2 instance; your production infrastructure may include hundreds of instances, plus databases, load balancers, network configurations, and so on. The amount of custom code it takes to manage all this with ad hoc scripts quickly becomes untenable. As you'll see shortly, tools designed specifically for managing infrastructure as code typically provide APIs that are more concise for accomplishing common infrastructure tasks.

Ad hoc scripts have always been, and will always be, a big part of software delivery. They are the glue and duct tape of the DevOps world. However, they are not the best choice as a primary tool for managing infrastructure as code.

> **Insight**
>
> Ad hoc scripts are great for small, one-off tasks, but not for managing all your infrastructure as code.

If you're going to be managing all your infrastructure as code, you should use an IaC tool that is purpose-built for the job, such as one of the ones discussed in the next several sections.

## Configuration Management Tools

After trying out ad hoc scripts and hitting all the issues mentioned in the previous section, the software industry moved on to configuration management tools, such as Chef, Puppet, and Ansible (full list). These tools first started to appear before cloud computing was ubiquitous, so they were originally designed to assume that someone else had done the work of setting up the hardware (e.g., your Ops team racked the servers in your own data center), and the primary purpose of these tools was to handle the software, including configuring the OS, installing dependencies, and deploying and updating apps.

Each configuration management tool has you write code in a different domain-specific language (DSL). For example, with Chef, you write code in a DSL built on top of Ruby, whereas with Ansible, you write code in a DSL built on top of YAML. Once you've written the code, most configuration management tools work to update your servers to match the desired state in your code. To update your servers, configuration management tools rely on the following two items:

**Management servers**
You run one or more management servers (Chef Server, Puppet Server, or Ansible Automation Controller), which are responsible for communicating with the rest of your servers, tracking the state of those servers, providing a central UI and API to manage those servers, and running a reconciliation loop to continuously ensure that the configuration of each server matches your desired configuration.

**Agents**
Chef and Puppet require you to install custom agents (Chef Client and Puppet Agent) on each server, which are responsible for connecting to and authenticating with the management servers. You can configure the management servers to either push changes to these agents or to have the agents pull changes from the management servers. Ansible, on the other hand, pushes changes to your servers over SSH, which is preinstalled on most Linux/Unix servers by default (you'll learn more about SSH in Chapter 7). Whether you rely on agents or SSH, this leads to a chicken-and-egg problem: to be able to configure your servers (with configuration management tools), you first have to configure your servers (install agents or set up SSH authentication). Solving this chicken-and-egg problem usually requires either manual intervention or additional tools.

The best way to understand configuration management is to see it in action, so let's go through an example of using Ansible to deploy and configure servers. Then you'll see how configuration management tools stack up against the IaC category criteria.

### Example: Deploy an EC2 Instance by Using Ansible

To be able to use configuration management, you first need a server. This section will show you how to deploy an EC2 instance by using Ansible. Note that deploying and managing servers (hardware) is not really what configuration management tools were designed to do, but for spinning up a single server for learning and testing, Ansible is good enough.

Create a new folder called `ansible`:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch2/ansible
$ cd ch2/ansible
```

Inside the Ansible folder, create an Ansible playbook called `create_ec2_instances_playbook.yml`, with the contents shown in Example 2-2.

**Example 2-2.** Ansible playbook to deploy EC2 instances (`ch2/ansible/create_ec2_instances_playbook.yml`)

```yaml
- name: Deploy EC2 instances in AWS
  hosts: localhost  # 1
  gather_facts: no
  environment:
    AWS_REGION: us-east-2
  vars:  # 2
    num_instances: 1
    base_name: sample_app_ansible
    http_port: 8080
  tasks:
    - name: Create security group  # 3
      amazon.aws.ec2_security_group:
        name: "{{ base_name }}"
        description: "{{ base_name }} HTTP and SSH"
        rules:
          - proto: tcp
            ports: ["{{ http_port }}"]
            cidr_ip: 0.0.0.0/0
          - proto: tcp
            ports: [22]
            cidr_ip: 0.0.0.0/0
      register: aws_security_group

    - name: Create a new EC2 key pair  # 4
      amazon.aws.ec2_key:
        name: "{{ base_name }}"
        file_name: "{{ base_name }}.key"  # 5
      no_log: true
      register: aws_ec2_key_pair

    - name: 'Get all Amazon Linux AMIs'  # 6
      amazon.aws.ec2_ami_info:
        owners: amazon
        filters:
          name: al2023-ami-2023.*-x86_64
      register: amazon_linux_amis

    - name: Create EC2 instances with Amazon Linux  # 7
      loop: "{{ range(num_instances | int) | list }}"
      amazon.aws.ec2_instance:
        name: "{{ '%s_%d' | format(base_name, item) }}"
        key_name: "{{ aws_ec2_key_pair.key.name }}"
        instance_type: t2.micro
        security_group: "{{ aws_security_group.group_id }}"
        image_id: "{{ amazon_linux_amis.images[-1].image_id }}"
        tags:
          Ansible: "{{ base_name }}"  # 8
```

An Ansible playbook specifies the hosts to run on, some variables, and then a list of tasks to execute on those hosts. Each task runs a module, which is a unit of code that can execute various commands. The preceding playbook does the following:

1. **Specify the hosts**: The `hosts` entry specifies where this playbook will run. Most playbooks run on remote hosts (on servers you're configuring), as you'll see in the next section, but this playbook runs on `localhost`, as it is just making a series of API calls to AWS to deploy a server.

2. **Define variables**: The `vars` block defines three variables used throughout the playbook: `num_instances`, which specifies the number of EC2 instances to create (default: 1); `base_name`, which specifies the name of all the resources created by this playbook (default: `sample_app_ansible`); and `http_port`, which specifies the port the instances should listen on for HTTP requests (default: 8080). In this chapter, you'll use the default values for all these variables, but in Chapter 3, you'll see how to override these variables.

3. **Create a security group**: The first task in the playbook uses the `amazon.aws.ec2_security_group` module to create a security group in AWS. The preceding code configures this security group to allow inbound HTTP requests on `http_port` and inbound SSH requests on port 22. Note the use of Jinja templating syntax, such as `{{ base_name }}` and `{{ http_port }}`, to dynamically fill in the values of the variables defined in 2.

4. **Create an EC2 key pair**: An EC2 key pair is a public/private key pair that can be used to authenticate to an EC2 instance over SSH.

5. **Save the private key**: Store the private key of the EC2 key pair locally in a file called `{{ base_name }}.key`, which with the default variable values will resolve to `sample_app_ansible.key`. You'll use this private key in the next section to authenticate to the EC2 instance.

6. **Look up the ID of the Amazon Linux AMI**: Use the `ec2_ami_info` module to do the same lookup you saw in the Bash script with `aws ec2 describe-images`.

7. **Create EC2 instances**: Create one or more EC2 instances (based on the `num_instances` variable) that run Amazon Linux and use the security group and public key from the previous steps.

8. **Tag the instance**: This sets the `Ansible` tag on the instance to `{{ base_name }}`, which will default to `sample_app_ansible`. You'll use this tag in the next section.

To run this Ansible playbook, install Ansible (minimum version 2.17), authenticate to AWS, and run the following:

```bash
$ ansible-playbook -v create_ec2_instances_playbook.yml
```

When the playbook finishes running, you should have a server running in AWS. Now you can see what configuration management tools are really designed to do: configure servers to run software.

### Example: Configure a Server by Using Ansible

For Ansible to be able to configure your servers, you have to provide an inventory, which is a file specifying which servers you want configured, and how to connect to them. If you have a set of physical servers on prem, you can put the IP addresses of those servers in an inventory file, as shown in Example 2-3.

**Example 2-3.** Static Ansible inventory (`inventory.yml`)

```yaml
webservers:
  hosts:
    10.16.10.5:
    10.16.10.6:
dbservers:
  hosts:
    10.16.20.3:
    10.16.20.4:
    10.16.20.5:
```

The preceding file organizes your servers into groups: the `webservers` group has two servers and the `dbservers` group has three servers. You'll then be able to write Ansible playbooks that target the hosts in specific groups.

If you are running servers in the cloud, where servers come and go often and IP addresses change frequently, you're better off using an inventory plugin that can dynamically discover your servers. For example, you can use the `aws_ec2` inventory plugin to discover the EC2 instance you deployed in the preceding section. Create a file called `inventory.aws_ec2.yml` with the contents shown in Example 2-4.

**Example 2-4.** Dynamic Ansible inventory (`ch2/ansible/inventory.aws_ec2.yml`)

```yaml
plugin: amazon.aws.aws_ec2
regions:
  - us-east-2
keyed_groups:
  - key: tags.Ansible  # 1
    leading_separator: ''  # 2
```

This code does the following:

1. Create groups based on the `Ansible` tag of the instance. In the preceding section, you set this tag to `sample_app_ansible`, so that will be the name of the group.
2. By default, Ansible adds a leading underscore to group names. This disables it so the group name matches the tag name.

For each group in your inventory, you can specify group variables to configure how to connect to the servers in that group. You define these variables in YAML files in the `group_vars` folder, with the name of the file set to the name of the group. For example, for the EC2 instance in the `sample_app_ansible` group, you should create a file in `group_vars/sample_app_ansible.yml` with the contents shown in Example 2-5.

**Example 2-5.** Group variables (`ch2/ansible/group_vars/sample_app_ansible.yml`)

```yaml
ansible_user: ec2-user  # 1
ansible_ssh_private_key_file: sample_app_ansible.key  # 2
ansible_host_key_checking: false  # 3
```

This file defines the following group variables:

1. Use `ec2-user` as the username to connect to the EC2 instance. This is the username you need to use with Amazon Linux AMIs.
2. Use the private key at `sample_app_ansible.key` to authenticate to the instance. This is the private key the playbook saved in the previous section.
3. Skip host key checking so you don't get interactive prompts from Ansible.

Alright, with the inventory stuff out of the way, you can now create a playbook to configure your server to run the Node.js sample app. Create a file called `configure_sample_app_playbook.yml` with the contents shown in Example 2-6.

**Example 2-6.** Sample app playbook (`ch2/ansible/configure_sample_app_playbook.yml`)

```yaml
- name: Configure the EC2 instance to run a sample app
  hosts: sample_app_ansible  # 1
  gather_facts: true
  become: true
  roles:
    - sample-app  # 2
```

This playbook does two things:

1. Target the servers in the `sample_app_ansible` group, which should be a group with the EC2 instance you deployed in the previous section.
2. Configure the servers by using an Ansible role called `sample-app`, as discussed next.

An Ansible role defines a logical profile of an application in a way that promotes modularity and code reuse. Ansible roles also provide a standardized way to organize tasks, templates, files, and other configuration as per the following folder structure:

```
roles
└── <role-name>
    ├── defaults
    │   └── main.yml
    ├── files
    │   └── foo.txt
    ├── handlers
    │   └── main.yml
    ├── tasks
    │   └── main.yml
    ├── templates
    │   └── foo.txt.j2
    └── vars
        └── main.yml
```

Each folder has a specific purpose: e.g., the `tasks` folder defines tasks to run on a server; the `files` folder has files to copy to the server; the `templates` folder lets you use Jinja templating to dynamically fill in data in files; and so on. Having this standardized structure makes it easier to navigate and understand an Ansible codebase.

To create the `sample-app` role for this playbook, create a `roles/sample-app` folder in the same directory as `configure_sample_app_playbook.yml`:

```
.
├── configure_sample_app_playbook.yml
├── group_vars
├── inventory.aws_ec2.yml
└── roles
    └── sample-app
        ├── files
        │   └── app.js
        └── tasks
            └── main.yml
```

Within `roles/sample-app`, you should create `files` and `tasks` subfolders, which are the only parts of the standardized role folder structure you'll need for this simple example. Copy the Node.js sample app from Chapter 1 into `files/app.js`:

```bash
$ cp ../../ch1/sample-app/app.js roles/sample-app/files/
```

Next, create `tasks/main.yml` with the code shown in Example 2-7.

**Example 2-7.** Sample app tasks (`ch2/ansible/roles/sample-app/tasks/main.yml`)

```yaml
- name: Add Node Yum repo  # 1
  yum_repository:
    name: nodesource-nodejs
    description: Node.js Packages for x86_64 Linux RPM based distros
    baseurl: https://rpm.nodesource.com/pub_23.x/nodistro/nodejs/x86_64
    gpgkey: https://rpm.nodesource.com/gpgkey/ns-operations-public.key

- name: Install Node.js
  yum:
    name: nodejs

- name: Copy sample app  # 2
  copy:
    src: app.js
    dest: app.js

- name: Start sample app  # 3
  shell: nohup node app.js &
```

This code does the following:

1. **Install Node.js**: This is the same code you used in the Bash script to install Node.js, but translated to use native Ansible modules for each step. The `yum_repository` module adds a repository to yum, and the `yum` module uses that repository to install Node.js.

2. **Copy the sample app**: Use the `copy` module to copy `app.js` to the server.

3. **Start the sample app**: Use the `shell` module to execute the node binary to run the app in the background.

To run this playbook, authenticate to AWS and run the following command:

```bash
$ ansible-playbook -v -i inventory.aws_ec2.yml configure_sample_app_playbook.yml
```

You should see log output at the end that looks something like this:

```
PLAY RECAP
xxx.us-east-2.compute.amazonaws.com : ok=5 changed=4 failed=0
```

The value on the left, `xxx.us-east-2.compute.amazonaws.com`, is a domain name you can use to access the instance. In your web brower, open `http://xxx.us-east-2.compute.amazonaws.com:8080` (note it's port 8080 this time, not 80) and you should see this:

```
Hello, World!
```

Congrats, you're now using a configuration management tool to manage your infrastructure as code!

> **Get Your Hands Dirty**
>
> Here are a few exercises you can try at home to go deeper:
>
> - What happens if you run the Ansible playbook a second time? How does this compare to the Bash script?
> - How would you have to change the playbook to configure multiple EC2 instances?
>
> When you're done experimenting with Ansible, manually undeploy the EC2 instance as shown previously in Figure 1-9.

### How Configuration Management Tools Stack Up

Here is how configuration management tools stack up against the IaC category criteria:

**CRUD**
Most configuration management tools support three of the four CRUD operations. They can create the initial configuration, read the current configuration to see whether it matches the desired configuration, and if not, update the existing configuration. That said, support for read and update is a bit hit or miss. It works well for reading and updating the configuration within a server (if you use tasks that are idempotent, as you'll see shortly), but for managing the servers themselves, or any other type of cloud infrastructure, it works only if you remember to assign each piece of infrastructure a unique name or tag, which is easy to do with just a handful of resources but becomes more challenging at scale.

Another challenge is that most configuration management tools do not support delete (which is why you had to undeploy the EC2 instance manually). Ansible does support a `state` parameter on most modules, which can be set to `absent` to tell that module to delete the resource it manages, but as Ansible does not track dependencies, using `state` in playbooks with steps that depend on each other can be difficult. For example, if you updated `create_ec2_instances_playbook.yml` to set `state` to `absent` on the `ec2_security_group` and `ec2_instance` modules, and ran the playbook, Ansible would try to delete the security group first and the EC2 instance second (since that's the order they appear in the playbook). This would result in an error, as the security group can't be deleted while it's in use by the EC2 instance.

**Scale**
Most configuration management tools are designed specifically for managing multiple remote servers. For example, if you had deployed three EC2 instances, the exact same playbook would configure all three to run the web server (you'll see an example of this in Chapter 3).

**Deployment strategies**
Some configuration management tools have built-in support for deployment strategies. For example, Ansible natively supports rolling deployments (you'll see an example of this in Chapter 3 too).

**Idempotency**
Some tasks you do with configuration management tools are idempotent, and some are not. For example, the `yum` task in Ansible is idempotent: it installs the software only if it's not installed already, so it's safe to rerun that task as many times as you want. On the other hand, arbitrary shell tasks may or may not be idempotent, depending on the shell commands you execute. For example, the preceding playbook uses a `shell` task to directly execute the node binary, which is not idempotent. After the first run, subsequent runs of this playbook will fail, as the Node.js app is already running and listening on port 8080, so you'll get an error about conflicting ports. In Chapter 3, you'll see a better way of running apps with Ansible that is idempotent.

**Consistency**
Most configuration management tools enforce a consistent, predictable structure to the code, including documentation, file layout, clearly named parameters, and secrets management. While every developer organizes their ad hoc scripts in a different way, most configuration management tools come with a set of conventions that makes it easier to navigate and maintain the code, as you saw with the folder structure for Ansible roles.

**Verbosity**
Most configuration management tools provide a DSL for specifying server configuration that is more concise than the equivalent in an ad hoc script. For example, the Ansible playbooks and role add up to about 80 lines of code, which at first may not seem any better than the Bash script (which was also roughly 80 lines), but the 80 lines of Ansible code are doing considerably more: the Ansible code supports most CRUD operations, deployment strategies, idempotency, scaling operations to many servers, and consistent code structure. An ad hoc script that supported all this would be many times the length.

Configuration management tools brought several advantages over ad hoc scripts, but they also introduced their own drawbacks. One big drawback is that some configuration management tools have a considerable setup cost; for example, you may need to set up management servers and agents. A second big drawback is that most configuration management tools were designed for a mutable infrastructure paradigm, where you have long-running servers that the configuration management tools update (mutate) over and over again, for many years. This can be problematic because of configuration drift, where over time, your long-running servers can build up unique histories of changes, so each server is subtly different from the others. This can make it hard to reason about what's deployed and even harder to reproduce the issue on another server, all of which makes debugging challenging.

As the cloud and virtualization become more and more ubiquitous, using an immutable infrastructure paradigm is becoming more common. In this paradigm, instead of long-running physical servers, you use short-lived virtual servers that you replace every time you do an update. This is inspired by functional programming, where variables are immutable, so after you've set a variable to a value, you can never change that variable again, and if you need to update something, you create a new variable. Because variables never change, reasoning about your code is easier.

The idea behind immutable infrastructure is similar. Once you've deployed a server, you never make changes to it again. If you need to update something, such as deploying a new version of your code, you deploy a new server. Because servers never change after being deployed, reasoning about what's deployed is easier. The typical analogy used here (my apologies to vegetarians and animal lovers) is cattle versus pets: with mutable infrastructure, you treat your servers like pets, giving each a unique name, taking care of it, and trying to keep it alive as long as possible; with immutable infrastructure, you treat your servers like cattle, each more or less indistinguishable from the others, with random or sequential IDs instead of names, and you kill them off and replace them regularly.

> **Insight**
>
> Configuration management tools are great for managing the configuration of servers, but not for deploying the servers themselves or other infrastructure.

While it's possible to use configuration management tools with immutable infrastructure patterns, it's not what they were originally designed for. That led to new approaches, as discussed in the next section.

## Server Templating Tools

An alternative to configuration management that has been growing in popularity recently is to use server templating tools, such as virtual machines (VMs) and containers. Instead of launching a bunch of servers and configuring them by running the same code on each one, the idea behind server templating tools is to create an image of a server that captures a self-contained "snapshot" of the entire filesystem. You can then use another IaC tool to install that image on your servers.

As shown in Figure 2-1, there are two types of tools for working with images.

**Virtual machines**
These emulate an entire computer system, including the hardware. You run a hypervisor, such as VMware vSphere, VirtualBox, or Parallels (full list), to virtualize (simulate) the underlying CPU, memory, hard drive, and networking. The benefit is that any VM image that you run on top of the hypervisor can see only the virtualized hardware, so it's fully isolated from the host machine and any other VM images, and it will run exactly the same way in all environments (e.g., your computer, a staging server, a production server). The drawback is that virtualizing all this hardware and running a totally separate OS for each VM incurs a lot of overhead in terms of CPU usage, memory usage, and startup time. You can define VM images as code by using tools such as Packer, which you typically use to create images for production servers, and Vagrant, which you typically use to create images for local development.

**Containers**
These emulate the user space of an OS. You run a container engine, such as Docker, Moby, or CRI-O (full list), to isolate processes, memory, mount points, and networking. The benefit is that any container you run on top of the container engine can see only its own user space, so it's isolated from the host machine and other containers, and will run exactly the same way in all environments. The drawback is that all the containers running on a single server share that server's OS kernel and hardware, so it's more difficult to achieve the level of isolation and security you get with a VM. However, because the kernel and hardware are shared, your containers can boot up in milliseconds and have virtually no CPU or memory overhead. You can define container images as code by using tools such as Docker.

You'll go through an example of using container images with Docker in Chapter 3. In this section, let's go through an example of using VM images with Packer. After that, you'll see how server templating tools stack up against the IaC category criteria.

<ProcessFlow
  title="IaC Tool Flow: From Code to Infrastructure"
  steps={[
    {
      name: "Write Code",
      description: "Define infrastructure in declarative or procedural code",
      detail: "HCL, YAML, JSON, or scripting languages"
    },
    {
      name: "Build Images",
      description: "Create VM or container images with all dependencies",
      detail: "Packer for VMs, Docker for containers"
    },
    {
      name: "Provision Infrastructure",
      description: "Deploy servers, networks, and resources",
      detail: "OpenTofu, Terraform, CloudFormation"
    },
    {
      name: "Configure Services",
      description: "Apply configuration management to running systems",
      detail: "Ansible, Chef, Puppet"
    },
    {
      name: "Deploy Applications",
      description: "Roll out apps with orchestration tools",
      detail: "Kubernetes, ECS, Lambda"
    }
  ]}
  colors={{
    primary: colors.purple,
    secondary: colors.purple,
    text: colors.slate
  }}
/>

### Example: Create a VM Image by Using Packer

As an example, let's take a look at using Packer to create a VM image for AWS called an AMI. First, create a folder called `packer`:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch2/packer
$ cd ch2/packer
```

Next, copy the Node.js sample app from Chapter 1 into the packer folder:

```bash
$ cp ../../ch1/sample-app/app.js .
```

Create a Packer template called `sample-app.pkr.hcl`, with the contents shown in Example 2-8.

**Example 2-8.** Packer template (`ch2/packer/sample-app.pkr.hcl`)

```hcl
packer {
  required_plugins {
    amazon = {
      version = ">= 1.3.1"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

data "amazon-ami" "amazon-linux" {  # 1
  filters = {
    name = "al2023-ami-2023.*-x86_64"
  }
  owners      = ["amazon"]
  most_recent = true
  region      = "us-east-2"
}

source "amazon-ebs" "amazon-linux" {  # 2
  ami_name        = "sample-app-packer-${uuidv4()}"
  ami_description = "Amazon Linux AMI with a Node.js sample app."
  instance_type   = "t2.micro"
  region          = "us-east-2"
  source_ami      = data.amazon-ami.amazon-linux.id
  ssh_username    = "ec2-user"
}

build {  # 3
  sources = ["source.amazon-ebs.amazon-linux"]

  provisioner "file" {  # 4
    source      = "app.js"
    destination = "/home/ec2-user/app.js"
  }

  provisioner "shell" {  # 5
    script       = "install-node.sh"
    pause_before = "30s"
  }
}
```

You create Packer templates by using the HashiCorp Configuration Language (HCL) in files with a `.hcl` extension. The preceding template does the following:

1. **Look up the ID of the Amazon Linux AMI**: Use the `amazon-ami` data source to do the same lookup you saw in the Bash script and Ansible playbook.

2. **Source images**: Packer will start a server running each source image you specify. This code will result in Packer starting an EC2 instance running the Amazon Linux AMI from 1.

3. **Build steps**: Packer then connects to the server (e.g., via SSH) and runs the build steps in the order you specified. When all the build steps have finished, Packer will take a snapshot of the server and shut down the server. This snapshot will be a new AMI that you can deploy, and its name will be set based on the name parameter in the source block from 2, which the preceding code sets to `sample-app-packer-<UUID>`, where UUID is a randomly generated value that ensures you get a unique AMI name every time you run `packer build`. This code runs two build steps, as described in 4 and 5.

4. **File provisioner**: The first build step runs a file provisioner to copy files to the server. This code uses this to copy the Node.js sample app code in `app.js` to the server.

5. **Shell provisioner**: The second build step runs a shell provisioner to execute shell scripts on the server. The code uses this to run the `install-node.sh` script, which is described next.

Create a file called `install-node.sh` with the contents shown in Example 2-9.

**Example 2-9.** Bash script to install Node.js (`ch2/packer/install-node.sh`)

```bash
#!/usr/bin/env bash

set -e

sudo tee /etc/yum.repos.d/nodesource-nodejs.repo > /dev/null <<EOF
[nodesource-nodejs]
baseurl=https://rpm.nodesource.com/pub_23.x/nodistro/nodejs/x86_64
gpgkey=https://rpm.nodesource.com/gpgkey/ns-operations-public.key
EOF
sudo yum install -y nodejs
```

This script is identical to the first part of the Bash script, using yum to install Node.js. More generally, the Packer template is nearly identical to the Bash script and Ansible playbook, except the result of executing Packer is not a server running your app, but the image of a server with your app and all its dependencies installed. The idea is to use other IaC tools to launch one or more servers running that image; you'll see an example of this in "Provisioning Tools".

To build the AMI, install Packer (minimum version 1.10), authenticate to AWS, and run the following commands:

```bash
$ packer init sample-app.pkr.hcl
$ packer build sample-app.pkr.hcl
```

The first command, `packer init`, installs any plugins used in this Packer template. Packer can create images for many cloud providers (e.g., AWS, Google Cloud, and Azure) and the code for each of these providers lives in separate plugins that you install via the init command. The second command, `packer build`, kicks off the build process. When the build is done, which typically takes 3–5 minutes, you should see some log output that looks like this:

```
==> Builds finished. The artifacts of successful builds are:
--> amazon-ebs.amazon_linux: AMIs were created:
us-east-2: ami-0ee5157dd67ca79fc
```

Congrats, you're now using a server templating tool to manage your server configuration as code! The `ami-xxx` value is the ID of the AMI that was created from this template. You'll see how to deploy this AMI in "Provisioning Tools".

> **Get Your Hands Dirty**
>
> Here are a few exercises you can try at home to go deeper:
>
> - What happens if you run `packer build` on this template a second time? Why?
> - Figure out how to update the Packer template so it builds images not only for AWS, but also images you can run on other clouds (e.g., Azure or Google Cloud) or on your own computer (e.g., VirtualBox or Docker).

### How Server Templating Tools Stack Up

How do server templating tools stack up against the IaC category criteria?

**CRUD**
Server templating needs to support only the create operation in CRUD. This is because server templating is a key component of the shift to immutable infrastructure. If you need to roll out a change, instead of updating an existing server, you use your server templating tool to create a new image, and deploy that image on a new server. So, with server templating, you're always creating totally new images; there's never a reason to read, update, or delete. That said, server templating tools aren't used in isolation; you need another tool to deploy these images (e.g., a provisioning tool, as you'll see shortly), and you typically want that tool to support all CRUD operations.

**Scale**
Server templating tools are highly scalable, as you can create an image once and then roll that same image out to 1 server or 1,000 servers, as necessary.

**Deployment strategies**
Server templating tools only create images; you use other tools and whatever deployment strategies those tools support to roll out the new images.

**Idempotency**
Server templating tools are idempotent by design. Since you create a new image every time, the tool executes the exact same steps every time. If you hit an error part of the way through, just rerun and try again.

**Consistency**
Most server templating tools enforce a consistent, predictable structure to the code, including documentation, file layout, and clearly named parameters.

**Verbosity**
Since server templating tools usually provide concise DSLs, don't have to deal with most CRUD operations, and are idempotent "for free," the amount of code you need is typically pretty small.

> **Insight**
>
> Server templating tools are great for managing the configuration of servers with immutable infrastructure practices.

As I mentioned a few times, server templating tools are powerful, but they don't work by themselves. You need another tool to deploy and manage the images you create, such as provisioning tools, which are the focus of the next section.

## Provisioning Tools

Whereas configuration management and server templating define the code that runs on each server, provisioning tools such as OpenTofu/Terraform, CloudFormation, and Pulumi (full list) are responsible for creating the servers themselves. In fact, you can use provisioning tools to create not only servers but also databases, caches, load balancers, queues, and many other aspects of your infrastructure.

Under the hood, most provisioning tools work by translating the code you write into API calls to the cloud provider you're using. For example, say you write OpenTofu code to create a server in AWS (which you will do next in this section). When you run OpenTofu, it will parse your code, and based on the configuration you specify, make API calls to AWS to create an EC2 instance, security group, etc.

Therefore, unlike with configuration management tools, you don't have to do any extra work to set up management servers or connectivity. All this is handled using the APIs and authentication mechanisms already provided by the cloud you're using. You'll get to try this out in the following sections, which walk through examples of using OpenTofu to deploy infrastructure, update infrastructure, package infrastructure into your own modules, and reuse infrastructure from third-party modules. After that, you'll see how provisioning tools stack up against the IaC category criteria.

### Example: Deploy an EC2 Instance by Using OpenTofu

As an example of using a provisioning tool, let's create an OpenTofu module that can deploy an EC2 instance. You write OpenTofu modules in HCL (the same language you used with Packer), in configuration files with a `.tf` extension. OpenTofu will find all files with that extension in a folder, so you can name the files whatever you want, but it's usually a good idea to follow the standard naming conventions, including putting the main resources in `main.tf`, input variables in `variables.tf`, and output variables in `outputs.tf`.

First, create a new `tofu/ec2-instance` folder for the module:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch2/tofu/ec2-instance
$ cd ch2/tofu/ec2-instance
```

Within the `tofu/ec2-instance` folder, create a file called `main.tf`, with the contents shown in Example 2-10.

**Example 2-10.** OpenTofu module (`ch2/tofu/ec2-instance/main.tf`)

```hcl
provider "aws" {  # 1
  region = "us-east-2"
}

resource "aws_security_group" "sample_app" {  # 2
  name        = var.name
  description = "Allow HTTP traffic into ${var.name}"
}

resource "aws_security_group_rule" "allow_http_inbound" {  # 3
  type              = "ingress"
  protocol          = "tcp"
  from_port         = 8080
  to_port           = 8080
  security_group_id = aws_security_group.sample_app.id
  cidr_blocks       = ["0.0.0.0/0"]
}

data "aws_ami" "sample_app" {  # 4
  filter {
    name   = "name"
    values = ["sample-app-packer-*"]
  }
  owners      = ["self"]
  most_recent = true
}

resource "aws_instance" "sample_app" {  # 5
  ami                    = data.aws_ami.sample_app.id
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.sample_app.id]
  user_data              = file("${path.module}/user-data.sh")

  tags = {
    Name = var.name
  }
}
```

The code in `main.tf` does something similar to the Bash script and Ansible playbook from earlier in the chapter:

1. **Configure the AWS provider**: OpenTofu works with many providers, such as AWS, Google Cloud, and Azure. This code configures the AWS provider to use the `us-east-2` (Ohio) region.

2. **Create a security group**: For each type of provider, there are many kinds of resources that you can create, such as servers, databases, and load balancers. The general syntax for creating a resource in OpenTofu is as follows:

   ```hcl
   resource "<PROVIDER>_<TYPE>" "<NAME>" {
     [CONFIG ...]
   }
   ```

   where `PROVIDER` is the name of a provider (e.g., `aws`), `TYPE` is the type of resource to create in that provider (e.g., `security_group`), `NAME` is an identifier you can use throughout the OpenTofu code to refer to this resource (e.g., `sample_app`), and `CONFIG` consists of one or more arguments specific to that resource. This code uses an `aws_security_group` resource to create a security group. It sets the name of the security group to `var.name`, which will be the value of the `name` input variable, as you'll see in Example 2-12.

3. **Allow HTTP requests**: Use the `aws_security_group_rule` resource to add a rule to the security group from 2 that allows inbound HTTP requests on port 8080.

4. **Look up the ID of the AMI you built with Packer**: Earlier, you saw how to look up AMI IDs in Bash, Ansible, and Packer. Here, you're seeing the OpenTofu version of an AMI lookup, but this time, instead of looking for a plain Amazon Linux AMI, the code is looking for the AMI you built with Packer earlier in this chapter, which was named `sample-app-packer-<UUID>`.

5. **Deploy an EC2 instance**: Use the `aws_instance` resource to create an EC2 instance that uses the AMI from 4, security group from 2, the user data script from `user-data.sh`, which you'll see in Example 2-11, and sets the Name tag to `var.name`.

Create a file called `user-data.sh` with the contents shown in Example 2-11.

**Example 2-11.** User data script (`ch2/tofu/ec2-instance/user-data.sh`)

```bash
#!/usr/bin/env bash
nohup node /home/ec2-user/app.js &
```

Note that this user data script is a fraction of the size of the one you saw in the Bash code. That's because all the dependencies (Node.js) and code (`app.js`) are already installed in the AMI by Packer. So the only thing this user data script does is start the sample app. This is a more idiomatic way to use user data.

Next, create a file called `variables.tf` to define input variables, which are like the input parameters of a function, as shown in Example 2-12.

**Example 2-12.** Input variables (`ch2/tofu/ec2-instance/variables.tf`)

```hcl
variable "name" {
  description = "The name for the EC2 instance and all resources."
  type        = string
}
```

This code defines an input variable called `name`, which allows you to specify the name to use for the EC2 instance, security group, and other resources. You'll see how to set variables shortly. Finally, create a file called `outputs.tf` with the contents shown in Example 2-13.

**Example 2-13.** Output variables (`ch2/tofu/ec2-instance/outputs.tf`)

```hcl
output "instance_id" {
  description = "The ID of the EC2 instance"
  value       = aws_instance.sample_app.id
}

output "security_group_id" {
  description = "The ID of the security group"
  value       = aws_security_group.sample_app.id
}

output "public_ip" {
  description = "The public IP of the EC2 instance"
  value       = aws_instance.sample_app.public_ip
}
```

This code defines output variables, which are like the return values of a function. These output variables will be printed to the log and can be shared with other modules. The code defines output variables for the EC2 instance ID, security group ID, and EC2 instance public IP.

Try this code by installing OpenTofu (minimum version 1.9), authenticating to AWS, and running the following command:

```bash
$ tofu init
```

Similar to Packer, OpenTofu works with many providers, and the code for each one lives in separate binaries that you install via the init command. Once init has completed, run the apply command to start the deployment process:

```bash
$ tofu apply
```

The first thing the apply command will do is prompt you for the `name` input variable:

```
var.name
  The name for the EC2 instance and all resources.

  Enter a value:
```

You can type in a name like `sample-app-tofu` and hit Enter. Alternatively, if you don't want to be prompted interactively, you can instead use the `-var` flag:

```bash
$ tofu apply -var name=sample-app-tofu
```

You can also set any input variable `foo` by using the environment variable `TF_VAR_foo`:

```bash
$ export TF_VAR_name=sample-app-tofu
$ tofu apply
```

One more option is to define a default value, as shown in Example 2-14.

**Example 2-14.** Define a default (`ch2/tofu/ec2-instance/variables.tf`)

```hcl
variable "name" {
  description = "The name for the EC2 instance and all resources."
  type        = string
  default     = "sample-app-tofu"
}
```

Once all input variables have been set, the apply command will show you the execution plan (just plan for short), which will look something like this (truncated for readability):

```
OpenTofu will perform the following actions:

  # aws_instance.sample_app will be created
  + resource "aws_instance" "sample_app" {
      + ami           = "ami-0ee5157dd67ca79fc"
      + instance_type = "t2.micro"
      ... (truncated) ...
    }

  # aws_security_group.sample_app will be created
  + resource "aws_security_group" "sample_app" {
      + description = "Allow HTTP traffic into the sample app"
      + name        = "sample-app-tofu"
      ... (truncated) ...
    }

  # aws_security_group_rule.allow_http_inbound will be created
  + resource "aws_security_group_rule" "allow_http_inbound" {
      + from_port = 8080
      + protocol  = "tcp"
      + to_port   = 8080
      + type      = "ingress"
      ... (truncated) ...
    }

Plan: 3 to add, 0 to change, 0 to destroy.
```

The plan lets you see what OpenTofu will do before actually making any changes, and prompts you for confirmation before continuing. This is a great way to sanity-check your code before unleashing it onto the world. The plan output is similar to the output of the diff command that is part of Unix, Linux, and git: anything with a plus sign (+) will be created, anything with a minus sign (–) will be deleted, anything with both a plus and a minus sign will be replaced, and anything with a tilde sign (~) will be modified in place. Every time you run apply, OpenTofu will show you this execution plan; you can also generate the execution plan without applying any changes by running `tofu plan` instead of `tofu apply`.

In the preceding plan output, you can see that OpenTofu is planning on creating an EC2 instance, security group, and security group rule, which is exactly what you want. Type `yes` and hit Enter to let OpenTofu proceed. When apply completes, you should see log output that looks like this:

```
Apply complete! Resources: 3 added, 0 changed, 0 destroyed.

Outputs:

instance_id = "i-0a4c593f4c9e645f8"
public_ip = "3.138.110.216"
security_group_id = "sg-087227914c9b3aa1e"
```

It's the three output variables, including the public IP address in `public_ip`. Wait a minute or two for the EC2 instance to boot up, open `http://<public_ip>:8080`, and you should see this:

```
Hello, World!
```

Congrats, you're using a provisioning tool to manage your infrastructure as code!

### Example: Update and Destroy Infrastructure by Using OpenTofu

One of the big advantages of provisioning tools is that they support not just deploying infrastructure, but also updating and destroying it. For example, now that you've deployed an EC2 instance via OpenTofu, make a change to the configuration, such as adding a new `Test` tag with the value `update`, as shown in Example 2-15.

**Example 2-15.** Update the tags on the EC2 instance (`ch2/tofu/ec2-instance/main.tf`)

```hcl
resource "aws_instance" "sample_app" {
  # ... (other params omitted) ...

  tags = {
    Name = var.name
    Test = "update"
  }
}
```

Run the apply command again, and you should see output that looks like this:

```bash
$ tofu apply

aws_security_group.sample_app: Refreshing state...
aws_security_group_rule.allow_http_inbound: Refreshing state...
aws_instance.sample_app: Refreshing state...

OpenTofu will perform the following actions:

  # aws_instance.sample_app will be updated in-place
  ~ resource "aws_instance" "sample_app" {
        id   = "i-0738de27643533e98"
      ~ tags = {
            "Name" = "sample-app-tofu"
          + "Test" = "update"
        }
      # (31 unchanged attributes hidden)

      # (8 unchanged blocks hidden)
    }

Plan: 0 to add, 1 to change, 0 to destroy.
```

Every time you run OpenTofu, it records information about the infrastructure it created in an OpenTofu state file. OpenTofu manages state by using backends; if you don't specify a backend, the default is to use the local backend, which stores state locally in a `terraform.tfstate` file in the same folder as the OpenTofu module (you'll see how to use other backends in Chapter 5). This file contains a custom JSON format that records a mapping from the OpenTofu resources in your configuration files to the representation of those resources in the real world.

When you run apply the first time on the `ec2-instance` module, OpenTofu records in the state file the IDs of the EC2 instance, security group, security group rules, and any other resources it created. When you run apply again, you can see **Refreshing state** in the log output, which is OpenTofu updating itself on the latest status of the world. As a result, the plan output that you see is the diff between what's currently deployed in the real world and what's in your OpenTofu code. The preceding diff shows that OpenTofu wants to create a single tag called `Test`, which is exactly what you want, so type `yes` and hit Enter, and you'll see OpenTofu perform an update operation, updating the EC2 instance with your new tag.

When you're done testing, you can run `tofu destroy` to have OpenTofu undeploy everything it deployed earlier:

```bash
$ tofu destroy

OpenTofu will perform the following actions:

  # aws_instance.sample_app will be destroyed
  - resource "aws_instance" "sample_app" {
      - ami                          = "ami-0ee5157dd67ca79fc" -> null
      - associate_public_ip_address  = true -> null
      - id                           = "i-0738de27643533e98" -> null
      ... (truncated) ...
    }

  # aws_security_group.sample_app will be destroyed
  - resource "aws_security_group" "sample_app" {
      - id          = "sg-066de0b621838841a" -> null
      ... (truncated) ...
    }

  # aws_security_group_rule.allow_http_inbound will be destroyed
  - resource "aws_security_group_rule" "allow_http_inbound" {
      - from_port = 8080 -> null
      - protocol  = "tcp" -> null
      - to_port   = 8080 -> null
      ... (truncated) ...
    }

Plan: 0 to add, 0 to change, 3 to destroy.
```

When you run destroy, OpenTofu shows you a destroy plan, which tells you about all the resources it's about to delete. This gives you one last chance to check that you really want to delete this stuff before you actually do it. It goes without saying that you should rarely, if ever, run destroy in a production environment—there's no "undo" for the destroy command. If everything looks good, type `yes` and hit Enter, and in a minute or two, OpenTofu will clean up everything it deployed.

> **Get Your Hands Dirty**
>
> Here are a few exercises you can try at home to go deeper:
>
> - How do you deploy multiple EC2 instances with OpenTofu?
> - What happens if you terminate an instance and rerun apply?

### Example: Deploy an EC2 Instance by Using an OpenTofu Module

One of OpenTofu's more powerful features is that the modules are reusable. In a general-purpose programming language (e.g., JavaScript, Python, Java), you put reusable code in a function; in OpenTofu, you put reusable code in a module. You can then use that module multiple times to spin up many copies of the same infrastructure, without having to copy and paste the code.

So far, you've been using the `ec2-instance` module as a root module, which is any module on which you run apply directly. However, you can also use it as a reusable module, which is a module meant to be included in other modules (e.g., in other root modules) as a means of code reuse.

Let's give it a shot. First, create a folder called `modules` to store your reusable modules:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch2/tofu/modules
```

Next, move the `ec2-instance` module into the `modules` folder:

```bash
$ mv ch2/tofu/ec2-instance ch2/tofu/modules/ec2-instance
```

Create a folder called `live` to store your root modules:

```bash
$ mkdir -p ch2/tofu/live
```

Inside the `live` folder, create a new folder called `sample-app`, which will house the new root module you'll use to deploy the sample app:

```bash
$ mkdir -p ch2/tofu/live/sample-app
$ cd ch2/tofu/live/sample-app
```

In the `live/sample-app` folder, create `main.tf` with the contents shown in Example 2-16.

**Example 2-16.** Basic module usage (`ch2/tofu/live/sample-app/main.tf`)

```hcl
module "sample_app_1" {
  source = "../../modules/ec2-instance"

  name = "sample-app-tofu-1"
}
```

To use one module from another, all you need is the following:

- A `module` block.
- A `source` parameter that contains the filepath of the module you want to use. The preceding code sets `source` to the relative filepath of the `ec2-instance` module in the `modules` folder.
- If the module defines input variables, you can set those as parameters within the module block. The `ec2-instance` module defines an input variable called `name`, which the preceding code sets to `sample-app-tofu-1`.

If you were to run apply on this code, it would use the `ec2-instance` module code to create a single EC2 instance. But the beauty of code reuse is that you can use the module multiple times, as shown in Example 2-17.

**Example 2-17.** Using a module multiple times (`ch2/tofu/live/sample-app/main.tf`)

```hcl
module "sample_app_1" {
  source = "../../modules/ec2-instance"

  name = "sample-app-tofu-1"
}

module "sample_app_2" {
  source = "../../modules/ec2-instance"

  name = "sample-app-tofu-2"
}
```

This code has two module blocks, so if you run apply on it, it will create two EC2 instances, one with all the resources named `sample-app-tofu-1` and one with all the resources named `sample-app-tofu-2`. If you had three module blocks, it would create three EC2 instances; and so on. And, of course, you can mix and match different modules, include modules in other modules, and so on. It's not unusual for modules to be reused dozens or hundreds of times across a company, so that you put in the work once to create a module that meets your company's needs, and then use it over and over again.

Before running apply, you have two small changes to make. First, move the provider block from the `ec2-instance` (reusable) module to the `sample-app` (root) module, as shown in Example 2-18.

**Example 2-18.** Move the provider block (`ch2/tofu/live/sample-app/main.tf`)

```hcl
provider "aws" {
  region = "us-east-2"
}

module "sample_app_1" {
  source = "../../modules/ec2-instance"

  name = "sample-app-tofu-1"
}

module "sample_app_2" {
  source = "../../modules/ec2-instance"

  name = "sample-app-tofu-2"
}
```

Reusable modules typically don't define provider blocks, and instead inherit those provider configurations from the root module, which allows users to configure provides however they prefer (e.g., use different regions, accounts, and so on). Second, create an `outputs.tf` file in the `sample-app` folder with the contents shown in Example 2-19.

**Example 2-19.** Proxy output variables (`ch2/tofu/live/sample-app/outputs.tf`)

```hcl
output "sample_app_1_public_ip" {
  description = "The public IP of the sample-app-1 instance"
  value       = module.sample_app_1.public_ip
}

output "sample_app_2_public_ip" {
  description = "The public IP of the sample-app-2 instance"
  value       = module.sample_app_2.public_ip
}

output "sample_app_1_instance_id" {
  description = "The ID of the sample-app-1 instance"
  value       = module.sample_app_1.instance_id
}

output "sample_app_2_instance_id" {
  description = "The ID of the sample-app-2 instance"
  value       = module.sample_app_2.instance_id
}
```

The preceding code "proxies" the output variables from the underlying `ec2-instance` module so that you can see those outputs when you run apply on the `sample-app` root module. OK, you're finally ready to run this code:

```bash
$ tofu init
$ tofu apply
```

When apply completes, you should have two EC2 instances running, and the output variables should show their IPs and instance IDs. If you wait a minute or two for the instances to boot up, and open `http://<IP>:8080` in your browser, where `<IP>` is the public IP of either instance, you should see the familiar "Hello, World!" text. When you're done experimenting, run `tofu destroy` to clean everything up again.

### Example: Deploy an EC2 Instance by Using an OpenTofu Registry Module

There's one more trick with OpenTofu modules: the `source` parameter can be set to not only a local filepath, but also to a URL. For example, the book's sample code repo in GitHub includes an `ec2-instance` module that is more or less identical to your own `ec2-instance` module. You can use the module directly from the book's GitHub repo by setting the source parameters to a GitHub URL, as shown in Example 2-20.

**Example 2-20.** Set source to a GitHub URL (`ch2/tofu/live/sample-app/main.tf`)

```hcl
module "sample_app_1" {
  source = "github.com/brikis98/devops-book//ch2/tofu/modules/ec2-instance?ref=1.0.0"

  # ... (other params omitted) ...
}
```

This code sets the source to a GitHub URL. Take note of two details:

**Double slashes**
The source URL intentionally includes double slashes (`//`): the part to the left of the two slashes specifies the GitHub repo, and the part to the right specifies the subfolder within that repo.

**ref parameter**
The `ref` parameter at the end of the URL specifies a Git reference (e.g., a Git tag) within the repo. This allows you to specify the version of the module to use.

OpenTofu supports not only GitHub URLs for module sources, but also GitLab URLs, Bitbucket URLs, and so on. One particularly convenient option is to publish your modules to a module registry, which is a centralized way to share, find, and use modules. OpenTofu and Terraform each provide a public registry you can use for open source modules; you can also run private registries within your company. I've published all the reusable modules in this book to the OpenTofu and Terraform public registries. These registries have specific requirements on how the repo must be named and its folder structure, so to publish these reusable modules, I had to copy them to another repo called `https://github.com/brikis98/terraform-book-devops`, into the folder structure `modules/<MODULE_NAME>`, which allows you to consume the modules by using registry URLs of the form `brikis98/devops/book//modules/<MODULE>`. For example, instead of the GitHub URL in Example 2-20, you can use the more convenient source URL shown in Example 2-21.

**Example 2-21.** Set source to a registry URL (`ch2/tofu/live/sample-app/main.tf`)

```hcl
module "sample_app_1" {
  source  = "brikis98/devops/book//modules/ec2-instance"
  version = "1.0.0"

  # ... (other params omitted) ...
}
```

Registry URLs are a bit shorter, and they allow you to use the `version` parameter to specify the version, which is a bit cleaner than appending a `ref` parameter, and supports version constraints.

Run init on this code one more time:

```bash
$ tofu init

Initializing the backend...
Initializing modules...
Downloading registry.opentofu.org/brikis98/devops/book 1.0.0 for sample_app_1...
Downloading registry.opentofu.org/brikis98/devops/book 1.0.0 for sample_app_2...

Initializing provider plugins...
```

The init command is responsible for downloading provider code and module code, and you can see in the preceding output that, this time, it downloaded the module code from the OpenTofu registry. If you now run apply, you should get the exact same two EC2 instances as before. When you're done experimenting, run destroy to clean up everything.

You've now seen the power of reusable modules. A common pattern at many companies is for the Ops team to define and manage a library of vetted, reusable OpenTofu modules (e.g., one module to deploy servers, another to deploy databases, and another to configure networking) and for the Dev teams to use these modules as a self-service way to deploy and manage the infrastructure they need for their apps.

This book uses this pattern in future chapters. Instead of writing every line of code from scratch, you'll be able to use modules directly from this book's sample code repo to deploy the infrastructure you need for each chapter.

> **Get Your Hands Dirty**
>
> Here are a few exercises you can try at home to go deeper:
>
> - Make your `ec2-instance` module more configurable (e.g., add input variables for the instance type, AMI name, and so on).
> - Learn how to version your modules.

### How Provisioning Tools Stack Up

How do provisioning tools stack up against the IaC category criteria from before? Let's take a look:

**CRUD**
Most provisioning tools have full support for all four CRUD operations. For example, you just saw OpenTofu create an EC2 instance, read the EC2 instance state, update the EC2 instance (to add a tag), and delete the EC2 instance.

**Scale**
Provisioning tools are highly scalable. For example, the self-service approach mentioned in the preceding section—where you have a library of reusable modules managed by Ops teams and used by Dev teams to deploy the infrastructure they need—can scale to thousands of developers and tens of thousands of resources.

**Deployment strategies**
Provisioning tools typically let you use whatever deployment strategies are supported by the underlying infrastructure. For example, OpenTofu allows you to use instance refresh to do a zero-downtime, rolling deployment for groups of servers in AWS; you'll try out an example of this in Chapter 3.

**Idempotency**
Whereas most ad hoc scripts are procedural, specifying step-by-step how to achieve a desired end state, most provisioning tools are declarative: you specify the end state you want, and the provisioning tool automatically figures out how to get you from your current state to that desired end state. As a result, most provisioning tools are idempotent by design.

**Consistency**
Most provisioning tools enforce a consistent, predictable structure to the code, including documentation, file layout, clearly named parameters, and so on.

**Verbosity**
The declarative nature of provisioning tools and the custom DSLs they provide typically result in concise code, especially considering that code supports all CRUD operations, deployment strategies, scale, and idempotency out of the box. The OpenTofu code for deploying an EC2 instance is about half the length of the Bash code, even though it does considerably more.

Provisioning tools should be your go-to option for managing infrastructure. Moreover, many provisioning tools can be used to manage not only traditional infrastructure (e.g., servers), but many other aspects of software delivery as well. For example, you can use OpenTofu to manage your version-control system (e.g., using the GitHub provider), metrics (e.g., using the Grafana provider), and your on-call rotation (e.g., using the PagerDuty provider), tying them all together with code.

> **Insight**
>
> Provisioning tools are great for deploying and managing servers and infrastructure.

Although I've been comparing IaC tools this entire chapter, the reality is that you'll probably need to use multiple IaC tools together, as discussed in the next section.

## Using Multiple IaC Tools Together

Each of the tools you've seen in this chapter has strengths and weaknesses. No one of them can do it all, so for most real-world scenarios, you'll need multiple tools.

> **Insight**
>
> You usually need to use multiple IaC tools together to manage your infrastructure.

This section shows several common ways to combine tools.

### Provisioning Plus Configuration Management

**Example: OpenTofu and Ansible.** You use OpenTofu to deploy the underlying infrastructure, including the network topology, data stores, load balancers, and servers, and you use Ansible to deploy apps on top of those servers, as depicted in Figure 2-2.

This is an easy approach to get started with, and there are many ways to get Ansible and OpenTofu to work together (e.g., OpenTofu adds tags to your servers, and Ansible uses an inventory plugin to automatically discover servers with those tags). The main downside is that using Ansible typically means mutable infrastructure, rather than immutable, so as your codebase, infrastructure, and team grow, maintenance and debugging can become more difficult.

### Provisioning Plus Server Templating

**Example: OpenTofu and Packer.** You use Packer to package your apps as VM images, and you use OpenTofu to deploy your infrastructure, including servers that run these VM images, as illustrated in Figure 2-3.

This is also an easy approach to get started with. In fact, you already had a chance to try this combination earlier in this chapter. Moreover, this is an immutable infrastructure approach, which will make maintenance easier. The main drawback is that VMs can take a long time to build and deploy, which slows iteration speed.

### Provisioning Plus Server Templating Plus Orchestration

**Example: OpenTofu, Packer, Docker, and Kubernetes.** You use Packer to create a VM image that has Docker and Kubernetes installed. You use OpenTofu to deploy your infrastructure, including servers that run this VM image. When the servers boot up, they form a Kubernetes cluster that you use to run your Dockerized applications. All this is shown in Figure 2-4.

You'll get to try this in Chapter 3. The advantage of this approach is that you get the power of an IaC tool (OpenTofu) for managing your infrastructure, the power of server templating (Docker) for configuring your servers (with fast builds and the ability to run images on your local computer), and the power of an orchestration tool (Kubernetes) for managing your apps (including scheduling, auto healing, auto scaling, and service communication). The drawback is the added complexity, both in terms of extra infrastructure to run (the Kubernetes cluster) and in terms of several extra layers of abstraction (Kubernetes, Docker, Packer) to learn, manage, and debug.

## Adopting IaC

At the beginning of this chapter, you heard about all the benefits of IaC (including self-service, speed and safety, and code reuse), but it's important to understand that adopting IaC has significant costs too. Your team members not only have to learn new tools and techniques but also have to get used to a totally new way of working. It's a big shift to go from the old-school sysadmin approach of spending all day managing infrastructure manually and directly (e.g., connect to a server and update its configuration) to the new DevOps approach of spending all day coding and making changes indirectly (e.g., write some code and let an automated process apply the changes).

> **Insight**
>
> Adopting IaC requires more than just introducing a new tool or technology; it also requires changing the culture and processes of the team.

Changing culture and processes is a significant undertaking, especially at larger companies. Because every team's culture and processes are different, there's no one-size-fits-all way to do it. Here are a few tips that will be useful in most situations:

**Adapt your architecture and processes to your needs**
It might be slightly heretical for the author of a book on DevOps to say this, but not every team needs IaC. Adopting IaC has a relatively high cost, and while it will pay off for some scenarios, it won't for others. For example, if your team is spending all its time dealing with bugs and outages that result from a manual deployment process, prioritizing IaC might make sense. But if you're at a tiny startup where one person can manage all your infrastructure, or you're working on a prototype that might be thrown away in a few months, managing infrastructure by hand may be the right choice. Don't adopt IaC (or any other practice) just because you read somewhere that it's a "best practice." As you learned in Chapter 1, there's no one best practice; you need to adapt your architecture and processes to your company's needs.

**Work incrementally**
Even if you do prioritize adopting IaC (or any other practice), don't try to do it all in one massive step. Instead, adopt any new practice incrementally, as you learned in Chapter 1: break the work into small steps, each of which brings value by itself. For example, don't try to do one giant project aiming to migrate all your infrastructure to IaC by writing tens of thousands of lines of code. Instead, use an iterative process: identify the most problematic part of your infrastructure (e.g., the part causing the most bugs and outages), fix the problems in that part (perhaps by migrating that part to IaC), and repeat.

**Give your team the time to learn**
If you want your team to adopt IaC, you need to be willing to dedicate sufficient time and resources to it. If your team doesn't get the time and resources that it needs, your IaC migration is likely to fail. One scenario I've seen many times is that no one on the team has any clue how to use IaC properly, so you end up with a jumble of messy, buggy, unmaintainable code that causes more problems than it solves. Another common scenario is that part of the team knows how to do IaC properly, and they write thousands of lines of beautiful code, but the rest of the team has no idea how to use it, so they continue making changes manually, which invalidates most of the benefits of IaC. If you decide to prioritize IaC, I recommend that (a) you get everyone bought in, (b) you make learning resources available such as classes, documentation, video tutorials, and, of course, this book, and (c) you provide sufficient dedicated time for team members to ramp up before you start using IaC everywhere.

**Get the right people on the team**
If you want to be able to use IaC, you have to learn how to write code. In fact, as you saw at the beginning of the chapter, a key shift with modern DevOps is managing more and more as code, so as a company adopts more DevOps practices, strong coding skills become more and more important. If you have team members who are not strong coders, be aware that some will be able to level up (given sufficient time and resources, as per the previous point), but some will not, which means you may have to hire new developers with coding skills for your team.

## Conclusion

You now understand how to manage your infrastructure as code. Instead of clicking around a web UI, which is tedious and error prone, you can automate the process, making if faster and more reliable. Moreover, whereas manual deployments always require someone at your company to do the busywork, with IaC, you can reuse code written by others. While learning, for example, you can reuse code from this book's sample code repo in GitHub, and in production, you can reuse code from collections such as Ansible Galaxy, Docker Hub, OpenTofu Registry, and the Gruntwork Infrastructure as Code Library (full list).

To help you pick an IaC tool, here are the six key takeaways from this chapter:

1. **Ad hoc scripts are great for small, one-off tasks, but not for managing all your infrastructure as code.**

2. **Configuration management tools are great for managing the configuration of servers, but not for deploying the servers themselves or other infrastructure.**

3. **Server templating tools are great for managing the configuration of servers with immutable infrastructure practices.**

4. **Provisioning tools are great for deploying and managing servers and infrastructure.**

5. **You usually need to use multiple IaC tools together to manage your infrastructure.**

6. **Adopting IaC requires more than just introducing a new tool or technology; it also requires changing the culture and processes of the team.**

If the job you're doing is provisioning infrastructure, you'll probably want to use a provisioning tool. If the job you're doing is configuring servers, you'll probably want to use a server templating or configuration management tool. And as most real-world software delivery setups require you to do multiple jobs, you'll most likely have to combine several tools together (e.g., provisioning plus server templating).

It's worth remembering that there is also a lot of variety within an IaC category; for example, there are big differences between Ansible and Chef within the configuration management category, and between OpenTofu and CloudFormation within the provisioning tool category. For a more detailed analysis, have a look at this comparison of Chef, Puppet, Ansible, Pulumi, CloudFormation, and Terraform/OpenTofu.

> **Going Deeper on OpenTofu/Terraform**
>
> Many of the examples in the rest of this book involve provisioning infrastructure using OpenTofu, so you may want to become more familiar with this toolset. The best way to do that, with apologies for a bit of self-promotion, is to grab a copy of my other book, *Terraform: Up & Running* (O'Reilly).

Being able to use code to run a server is a huge advantage over managing it manually, but a single server is also a single point of failure. What if it crashes? What if the load exceeds the capacity of a single server? How do you roll out changes without downtime? These topics move us into the domain of orchestration tools and managing apps, which is the focus of Chapter 3.

---

**Previous:** [Deploy Your App](/infrastructure-deployment/ch01-deploy-your-app) | **Next:** [Orchestration](/infrastructure-deployment/ch03-orchestration)
