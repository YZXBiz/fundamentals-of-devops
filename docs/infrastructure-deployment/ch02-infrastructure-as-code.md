---
sidebar_position: 3
title: "Infrastructure as Code"
description: "Master infrastructure as code with ad hoc scripts, configuration management tools, server templating, and provisioning tools. Learn to automate infrastructure with Ansible, Packer, and OpenTofu."
---

import { ProcessFlow, StackDiagram, CardGrid, ComparisonTable, TreeDiagram, colors } from '@site/src/components/diagrams';

# Chapter 2. How to Manage Your Infrastructure as Code

## 2.1. The Problem with Manual Infrastructure Management

In Chapter 1, you deployed apps using PaaS and IaaS. But it required many manual steps clicking around a web UI.

This approach—sometimes called ClickOps—creates serious problems:

- **Deployments are slow and tedious**: You can't deploy frequently or respond quickly to problems
- **Deployments are error prone**: Manual steps lead to bugs, outages, and late-night debugging sessions
- **Knowledge silos form**: Only one person knows how to deploy, creating bottlenecks and bus factor risks

:::info[What is Infrastructure as Code?]

**In plain English:** Infrastructure as code (IaC) means you write code files that describe what servers, databases, and networks you need, then run a tool that automatically creates them for you.

**In technical terms:** IaC is the practice of defining infrastructure configuration in machine-readable definition files rather than interactive configuration tools or physical hardware configuration.

**Why it matters:** IaC transforms infrastructure management from slow, manual, error-prone clicking to fast, automated, repeatable code execution. You can version, test, and reuse infrastructure definitions just like application code.



## 2.2. The Core Insight of DevOps

Most tasks you used to do manually can now be automated using code.

**Table 2-1.** Managing everything as code

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

## 2.3. Four Categories of IaC Tools

This chapter introduces four common categories of IaC tools:

1. **Ad hoc scripts**: Using Bash to deploy a server
2. **Configuration management tools**: Using Ansible to deploy a server
3. **Server templating tools**: Using Packer to build an image of a server
4. **Provisioning tools**: Using OpenTofu to deploy a server

You'll work through examples with each approach. This lets you compare how different IaC categories perform across key dimensions like verbosity, consistency, and scale.

:::info[Infrastructure vs Apps]

This chapter focuses on tools for managing **infrastructure** (servers, load balancers, networks).

Chapter 3 focuses on tools for managing **apps** (scheduling, auto scaling, auto healing, service communication).

While these domains overlap, they require different tools and approaches.



## 2.4. Table of Contents

1. [The Benefits of IaC](#25-the-benefits-of-iac)
2. [Ad Hoc Scripts](#26-ad-hoc-scripts)
3. [Configuration Management Tools](#27-configuration-management-tools)
4. [Server Templating Tools](#28-server-templating-tools)
5. [Provisioning Tools](#29-provisioning-tools)
6. [Using Multiple IaC Tools Together](#210-using-multiple-iac-tools-together)
7. [Adopting IaC](#211-adopting-iac)
8. [Conclusion](#212-conclusion)

## 2.5. The Benefits of IaC

When your infrastructure is defined as code, you can use software engineering practices to dramatically improve your delivery process.

### 2.5.1. Speed and Safety

- A computer executes deployment steps instead of a person
- Computers are significantly faster and more reliable
- No human errors from mistyped commands or missed steps

### 2.5.2. Documentation

- Infrastructure state lives in source files anyone can read
- No more knowledge locked in one person's head
- New team members can understand the system by reading code

### 2.5.3. Version Control

- Store IaC source files in version control (covered in Chapter 4)
- Easier collaboration on infrastructure changes
- Debug issues by checking version history to see what changed
- Resolve issues by reverting to a previous version

### 2.5.4. Validation

- Perform code reviews for every infrastructure change
- Run automated test suites before deploying
- Pass code through static analysis tools
- All practices proven to significantly reduce defects (examples in Chapter 4)

### 2.5.5. Self-Service

- Developers can kick off their own deployments
- No waiting for operations team availability
- Faster iteration and experimentation

### 2.5.6. Reuse

- Package infrastructure into reusable modules
- Build on top of known, documented, battle-tested pieces
- No need to recreate infrastructure from scratch for every project

### 2.5.7. Happiness

- Manual deployments are repetitive and tedious
- No creativity, no challenge, no recognition in manual work
- Perfect deployments for months go unnoticed until one mistake
- IaC lets computers do automation and developers do creativity

:::warning[The Cost of IaC]

Learning and adopting IaC tools has costs. Your team must learn new tools, techniques, and ways of working.

Only adopt IaC if the benefits outweigh the costs for your specific situation. Not every team needs IaC.



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

## 2.6. Ad Hoc Scripts

### 2.6.1. What Are Ad Hoc Scripts?

:::info[Ad Hoc Scripts Explained]

**In plain English:** Ad hoc scripts are custom programs you write in languages like Bash, Python, or Ruby that automate tasks you used to do manually.

**In technical terms:** An ad hoc script breaks a manual process into discrete steps and captures each step in executable code using a general-purpose scripting language.

**Why it matters:** Ad hoc scripts are often the first step toward automation. They're quick to write and require no special tools, making them ideal for one-off tasks.



### 2.6.2. Example: Deploy an EC2 Instance by Using a Bash Script

Create a folder structure for this chapter's examples:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch2/bash
```

Copy the user data script from Chapter 1:

```bash
$ cp ch1/ec2-user-data-script/user-data.sh ch2/bash/
```

Create a Bash script called `deploy-ec2-instance.sh`:

**Example 2-1.** Bash script to deploy an EC2 instance (`ch2/bash/deploy-ec2-instance.sh`)

```bash
#!/usr/bin/env bash

set -e

export AWS_DEFAULT_REGION="us-east-2"
user_data=$(cat user-data.sh)

# 1. Create a security group
security_group_id=$(aws ec2 create-security-group \
  --group-name "sample-app" \
  --description "Allow HTTP traffic into the sample app" \
  --output text \
  --query GroupId)

# 2. Allow inbound HTTP requests on port 80
aws ec2 authorize-security-group-ingress \
  --group-id "$security_group_id" \
  --protocol tcp \
  --port 80 \
  --cidr "0.0.0.0/0" > /dev/null

# 3. Look up the ID of the Amazon Linux AMI
image_id=$(aws ec2 describe-images \
  --owners amazon \
  --filters 'Name=name,Values=al2023-ami-2023.*-x86_64' \
  --query 'reverse(sort_by(Images, &CreationDate))[:1] | [0].ImageId' \
  --output text)

# 4. Deploy an EC2 instance
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

# 5. Output important information
echo "Instance ID = $instance_id"
echo "Security Group ID = $security_group_id"
echo "Public IP = $public_ip"
```

### 2.6.3. Running the Script

Give the script execute permissions:

```bash
$ cd ch2/bash
$ chmod u+x deploy-ec2-instance.sh
```

Install the AWS CLI (minimum version 2.0), authenticate to AWS, and run:

```bash
$ ./deploy-ec2-instance.sh
Instance ID = i-0335edfebd780886f
Security Group ID = sg-09251ea2fe2ab2828
Public IP = 52.15.237.52
```

After the script finishes, wait 1-2 minutes for the EC2 instance to boot. Open `http://<Public IP>` in your browser.

You should see:

```
Hello, World!
```

:::warning[Simplified Examples for Learning]

The examples in this chapter are simplified for learning and not suitable for production. They have security concerns and user data limitations explained in Chapter 1.

You'll see how to resolve these limitations in Chapter 3.



### 2.6.4. Exercises

Try these exercises to go deeper:

- What happens if you run the Bash script a second time? Why?
- How do you change the script to run multiple EC2 instances?

When you're done, manually undeploy the EC2 instance to avoid unwanted charges.

### 2.6.5. How Ad Hoc Scripts Stack Up

Use these criteria to compare IaC tool categories:

#### 2.6.5.1. CRUD

:::info[CRUD Operations]

**In plain English:** CRUD stands for Create, Read, Update, and Delete—the four basic operations for managing anything.

**In technical terms:** CRUD operations represent the complete lifecycle management of infrastructure resources, from initial provisioning through ongoing maintenance to final decommissioning.

**Why it matters:** Good infrastructure tools must handle all four operations. Tools that only support "create" lead to orphaned resources and management headaches.



**Ad hoc scripts:** Most ad hoc scripts handle only **create**.

- This script creates a security group and EC2 instance
- If you run it a second time, it has no awareness that resources already exist
- It will always try to create new infrastructure from scratch, causing errors
- No built-in support for deleting infrastructure

#### 2.6.5.2. Scale

**Ad hoc scripts:** Difficult to scale.

- Solving the CRUD problem for one EC2 instance is hard enough
- Real architectures may contain hundreds of instances plus databases, load balancers, and networking
- No easy way to track and manage large amounts of infrastructure

#### 2.6.5.3. Deployment Strategies

**Ad hoc scripts:** Must implement from scratch.

- Real-world architectures need rolling deployments and blue-green deployments
- You'd have to write the logic for each deployment strategy yourself
- No built-in support or reusable patterns

#### 2.6.5.4. Idempotency

:::info[Idempotency Explained]

**In plain English:** Idempotent code produces the same result whether you run it once or multiple times.

**In technical terms:** An idempotent operation can be applied multiple times without changing the result beyond the initial application, ensuring consistency and safety in repeated executions.

**Why it matters:** Idempotent code is safe to rerun. If a deployment fails halfway through, you can simply run it again without worrying about side effects.



**Ad hoc scripts:** Not idempotent.

- If you ran this script once, it creates the security group and EC2 instance
- If you ran it again, it tries to create them again, causing errors
- You can't have two security groups with the same name

#### 2.6.5.5. Consistency

**Ad hoc scripts:** Inconsistent.

- You can use any programming language you want
- You can write the code however you want
- Every developer may write scripts differently
- Large repositories of ad hoc scripts devolve into unmaintainable spaghetti code

Tools designed for IaC provide a single, idiomatic way to solve each problem. This makes codebases more consistent and easier to maintain.

#### 2.6.5.6. Verbosity

**Ad hoc scripts:** Very verbose.

- This Bash script plus user data script: ~80 lines of code
- That's without CRUD support, deployment strategies, or idempotency
- A proper script handling all these would be many times longer
- Production infrastructure with hundreds of instances becomes untenable

Purpose-built IaC tools typically provide more concise APIs for common infrastructure tasks.

> **Insight: When to Use Ad Hoc Scripts**
>

Ad hoc scripts are great for small, one-off tasks, but not for managing all your infrastructure as code.

They remain the "glue and duct tape" of the DevOps world. Use them for quick automation, but rely on purpose-built tools for infrastructure management.



## 2.7. Configuration Management Tools

### 2.7.1. What Are Configuration Management Tools?

:::info[Configuration Management Explained]

**In plain English:** Configuration management tools like Chef, Puppet, and Ansible automatically set up and configure software on your servers.

**In technical terms:** Configuration management tools use domain-specific languages to define desired server state, then reconcile actual state with desired state through idempotent operations executed by agents or agentless SSH connections.

**Why it matters:** Configuration management tools emerged before cloud computing was ubiquitous. They solve the problem of configuring many servers consistently and maintaining that configuration over time.



### 2.7.2. How Configuration Management Works

Each tool uses a different domain-specific language (DSL):

- **Chef**: DSL built on top of Ruby
- **Ansible**: DSL built on top of YAML
- **Puppet**: DSL built on top of Ruby

Most configuration management tools rely on two components:

#### 2.7.2.1. Management Servers

- Run one or more management servers (Chef Server, Puppet Server, or Ansible Automation Controller)
- Communicate with all your servers
- Track the state of those servers
- Provide a central UI and API
- Run a reconciliation loop to ensure servers match desired configuration

#### 2.7.2.2. Agents

**Chef and Puppet approach:**

- Require custom agents on each server (Chef Client and Puppet Agent)
- Agents connect to and authenticate with management servers
- Management servers can push changes to agents
- Agents can pull changes from management servers

**Ansible approach:**

- Pushes changes over SSH
- SSH is preinstalled on most Linux/Unix servers by default
- No custom agents required

**The chicken-and-egg problem:**

- To configure your servers, you first have to configure your servers
- You must install agents or set up SSH authentication
- Solving this usually requires manual intervention or additional tools

### 2.7.3. Example: Deploy an EC2 Instance by Using Ansible

Create a new folder for Ansible examples:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch2/ansible
$ cd ch2/ansible
```

Create an Ansible playbook called `create_ec2_instances_playbook.yml`:

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

**What this playbook does:**

1. **Hosts**: Runs on `localhost` (making AWS API calls, not configuring remote servers)
2. **Variables**: Defines `num_instances`, `base_name`, and `http_port` with defaults
3. **Security group**: Creates security group allowing HTTP on `http_port` and SSH on port 22
4. **EC2 key pair**: Creates public/private key pair for SSH authentication
5. **Private key**: Saves to `{{ base_name }}.key` (default: `sample_app_ansible.key`)
6. **AMI lookup**: Finds the latest Amazon Linux AMI
7. **EC2 instances**: Creates one or more instances based on `num_instances`
8. **Tag**: Sets the `Ansible` tag to `{{ base_name }}` for later discovery

To run this playbook, install Ansible (minimum version 2.17), authenticate to AWS, and run:

```bash
$ ansible-playbook -v create_ec2_instances_playbook.yml
```

### 2.7.4. Example: Configure a Server by Using Ansible

Now you'll see what configuration management tools are really designed to do: configure servers to run software.

#### 2.7.4.1. Ansible Inventory

:::info[Inventory Explained]

**In plain English:** An inventory is a list of servers you want to configure, organized into groups, along with instructions for how to connect to them.

**In technical terms:** An Ansible inventory is a structured data source (static or dynamic) defining hosts, groups, and connection parameters used to target playbook execution.

**Why it matters:** Inventories separate infrastructure topology from configuration logic, making playbooks reusable across different environments.



**Static inventory** for physical servers on-prem:

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

**Dynamic inventory** for cloud servers:

Create `inventory.aws_ec2.yml` to dynamically discover EC2 instances:

**Example 2-4.** Dynamic Ansible inventory (`ch2/ansible/inventory.aws_ec2.yml`)

```yaml
plugin: amazon.aws.aws_ec2
regions:
  - us-east-2
keyed_groups:
  - key: tags.Ansible  # 1
    leading_separator: ''  # 2
```

1. **Create groups**: Based on the `Ansible` tag (set to `sample_app_ansible`)
2. **Disable underscore**: By default, Ansible adds a leading underscore; this disables it

#### 2.7.4.2. Group Variables

For each group, define connection parameters in `group_vars/<group_name>.yml`:

**Example 2-5.** Group variables (`ch2/ansible/group_vars/sample_app_ansible.yml`)

```yaml
ansible_user: ec2-user  # 1
ansible_ssh_private_key_file: sample_app_ansible.key  # 2
ansible_host_key_checking: false  # 3
```

1. **Username**: Use `ec2-user` for Amazon Linux AMIs
2. **Private key**: Use the key saved in the previous section
3. **Host key checking**: Skip to avoid interactive prompts

#### 2.7.4.3. Configuration Playbook

Create `configure_sample_app_playbook.yml`:

**Example 2-6.** Sample app playbook (`ch2/ansible/configure_sample_app_playbook.yml`)

```yaml
- name: Configure the EC2 instance to run a sample app
  hosts: sample_app_ansible  # 1
  gather_facts: true
  become: true
  roles:
    - sample-app  # 2
```

1. **Target**: Servers in the `sample_app_ansible` group
2. **Role**: Configure servers using the `sample-app` role

#### 2.7.4.4. Ansible Roles

:::info[Ansible Roles Explained]

**In plain English:** An Ansible role is a standardized folder structure that packages related tasks, files, and templates together for easy reuse.

**In technical terms:** A role defines a logical profile of an application with modular components (tasks, handlers, files, templates, variables) organized in a conventional directory structure.

**Why it matters:** Roles promote code reuse and provide a consistent way to organize Ansible code, making it easier to navigate and maintain.



**Standard role folder structure:**

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

**Create the `sample-app` role:**

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

Copy the Node.js sample app:

```bash
$ cp ../../ch1/sample-app/app.js roles/sample-app/files/
```

Create `tasks/main.yml`:

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

1. **Install Node.js**: Use native Ansible modules for each step
2. **Copy app**: Use the `copy` module to transfer `app.js` to the server
3. **Start app**: Use the `shell` module to run node in the background

#### 2.7.4.5. Running the Configuration Playbook

Authenticate to AWS and run:

```bash
$ ansible-playbook -v -i inventory.aws_ec2.yml configure_sample_app_playbook.yml
```

You should see output like:

```
PLAY RECAP
xxx.us-east-2.compute.amazonaws.com : ok=5 changed=4 failed=0
```

Open `http://xxx.us-east-2.compute.amazonaws.com:8080` in your browser (note port 8080, not 80).

You should see:

```
Hello, World!
```

### 2.7.5. Exercises

Try these exercises to go deeper:

- What happens if you run the Ansible playbook a second time? How does this compare to the Bash script?
- How would you change the playbook to configure multiple EC2 instances?

When you're done, manually undeploy the EC2 instance.

### 2.7.6. How Configuration Management Tools Stack Up

#### 2.7.6.1. CRUD

**Configuration management tools:** Support three of four CRUD operations.

- Can **create** initial configuration
- Can **read** current configuration to see if it matches desired state
- Can **update** existing configuration if it doesn't match
- **Read and update** work well for configuration within a server (if using idempotent tasks)
- **Read and update** for servers themselves only work if you assign unique names or tags
- Most tools do **not support delete** (you had to undeploy the EC2 instance manually)

Ansible supports a `state` parameter set to `absent` to delete resources. But Ansible doesn't track dependencies, making this difficult for multi-step playbooks.

Example problem: If you set `state: absent` on both security group and EC2 instance, Ansible tries to delete the security group first (order in playbook). This fails because the security group is still in use by the instance.

#### 2.7.6.2. Scale

**Configuration management tools:** Designed for multiple remote servers.

If you deployed three EC2 instances, the same playbook would configure all three. You'll see an example in Chapter 3.

#### 2.7.6.3. Deployment Strategies

**Configuration management tools:** Some have built-in support.

Ansible natively supports rolling deployments. You'll see an example in Chapter 3.

#### 2.7.6.4. Idempotency

**Configuration management tools:** Some tasks are idempotent, some are not.

**Idempotent tasks:**

- The `yum` task is idempotent: it installs software only if not already installed
- Safe to rerun as many times as you want

**Non-idempotent tasks:**

- Arbitrary shell tasks may or may not be idempotent
- The `shell` task to run node is not idempotent
- After first run, subsequent runs fail because the app is already listening on port 8080

You'll see a better way to run apps with Ansible that is idempotent in Chapter 3.

#### 2.7.6.5. Consistency

**Configuration management tools:** Enforce consistent structure.

Most tools provide:

- Standard documentation conventions
- Consistent file layout (like Ansible roles)
- Clearly named parameters
- Built-in secrets management

This makes configuration management codebases easier to navigate and maintain than ad hoc scripts.

#### 2.7.6.6. Verbosity

**Configuration management tools:** More concise than ad hoc scripts.

The Ansible playbooks and role: ~80 lines of code. The Bash script: also ~80 lines.

But the Ansible code does considerably more:

- Supports most CRUD operations
- Includes deployment strategies
- Some idempotency
- Scales to many servers
- Consistent code structure

An ad hoc script supporting all this would be many times longer.

### 2.7.7. Drawbacks of Configuration Management Tools

#### 2.7.7.1. Setup Cost

Some configuration management tools have considerable setup cost:

- May need to set up management servers
- May need to install and configure agents

#### 2.7.7.2. Mutable Infrastructure

Most configuration management tools were designed for mutable infrastructure:

- Long-running servers that tools update (mutate) over and over again
- Servers can live for many years

**The problem: Configuration drift**

:::info[Configuration Drift Explained]

**In plain English:** Configuration drift happens when servers that should be identical gradually become different over time due to accumulated changes.

**In technical terms:** Configuration drift is the divergence between desired state and actual state that accumulates as manual changes, failed updates, and time-based variations compound on long-lived mutable infrastructure.

**Why it matters:** Drift makes it hard to reason about what's deployed, difficult to reproduce issues on other servers, and challenging to debug problems.



Each long-running server builds up a unique history of changes. Over time, each server becomes subtly different from the others.

#### 2.7.7.3. The Shift to Immutable Infrastructure

As cloud computing becomes ubiquitous, immutable infrastructure is becoming more common.

:::info[Immutable Infrastructure Explained]

**In plain English:** Immutable infrastructure means you never change servers after deploying them. Instead, you deploy new servers with changes already applied.

**In technical terms:** Immutable infrastructure treats servers as disposable artifacts. Rather than modifying running systems, you create new instances from updated templates and replace old instances.

**Why it matters:** Immutable infrastructure is inspired by functional programming, where variables never change. This makes reasoning about your code easier. The same principle applies to infrastructure.



**The cattle vs. pets analogy:**

- **Mutable infrastructure (pets)**: Give each server a unique name, take care of it, try to keep it alive as long as possible
- **Immutable infrastructure (cattle)**: Servers are more or less indistinguishable, have random or sequential IDs, kill them off and replace them regularly

Configuration management tools can work with immutable infrastructure patterns, but it's not what they were originally designed for. This led to new approaches in the next section.

> **Insight: When to Use Configuration Management**
>

Configuration management tools are great for managing the configuration of servers, but not for deploying the servers themselves or other infrastructure.



## 2.8. Server Templating Tools

### 2.8.1. What Are Server Templating Tools?

:::info[Server Templating Explained]

**In plain English:** Server templating tools create a snapshot of a complete server setup (operating system, software, configuration) that you can deploy multiple times.

**In technical terms:** Server templating creates immutable images capturing the entire filesystem state of a system. These images can be deployed as virtual machines or containers using orchestration tools.

**Why it matters:** Instead of configuring servers by running the same code on each one, you create an image once and deploy that identical image everywhere. This eliminates configuration drift and ensures consistency.



### 2.8.2. Two Types of Server Templating

#### 2.8.2.1. Virtual Machines

**How they work:**

- Emulate an entire computer system, including hardware
- Run a hypervisor (VMware vSphere, VirtualBox, Parallels) to virtualize CPU, memory, hard drive, networking
- Any VM image sees only virtualized hardware, not the host machine

**Benefits:**

- Full isolation from host and other VMs
- Runs exactly the same way in all environments
- Complete control over the entire stack

**Drawbacks:**

- Virtualizing hardware incurs overhead
- Running separate OS for each VM increases resource usage
- Longer startup times compared to containers

**Tools:**

- **Packer**: Create images for production servers
- **Vagrant**: Create images for local development

#### 2.8.2.2. Containers

**How they work:**

- Emulate the user space of an operating system
- Run a container engine (Docker, Moby, CRI-O) to isolate processes, memory, mount points, networking
- Containers share the host's OS kernel and hardware

**Benefits:**

- Isolated from host and other containers
- Runs exactly the same way in all environments
- Boots in milliseconds
- Virtually no CPU or memory overhead

**Drawbacks:**

- All containers on a server share that server's OS kernel and hardware
- More difficult to achieve the same level of isolation and security as VMs

**Tools:**

- **Docker**: Define container images as code
- **Moby**: Open-source Docker alternative
- **CRI-O**: Lightweight container runtime

### 2.8.3. Example: Create a VM Image by Using Packer

Create a folder for Packer examples:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch2/packer
$ cd ch2/packer
```

Copy the Node.js sample app:

```bash
$ cp ../../ch1/sample-app/app.js .
```

Create a Packer template called `sample-app.pkr.hcl`:

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

**What this template does:**

1. **AMI lookup**: Find the latest Amazon Linux AMI
2. **Source images**: Packer starts an EC2 instance running this AMI
3. **Build steps**: Packer connects via SSH and runs build steps in order
4. **File provisioner**: Copy `app.js` to the server
5. **Shell provisioner**: Run `install-node.sh` to install Node.js

When build steps finish, Packer:

- Takes a snapshot of the server (creates a new AMI)
- Shuts down the server
- Names the AMI `sample-app-packer-<UUID>` where UUID ensures uniqueness

Create `install-node.sh`:

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

### 2.8.4. Building the AMI

Install Packer (minimum version 1.10), authenticate to AWS, and run:

```bash
$ packer init sample-app.pkr.hcl
$ packer build sample-app.pkr.hcl
```

**What these commands do:**

- `packer init`: Installs plugins for cloud providers (AWS, Google Cloud, Azure)
- `packer build`: Kicks off the build process (typically takes 3-5 minutes)

When the build completes, you should see:

```
==> Builds finished. The artifacts of successful builds are:
--> amazon-ebs.amazon_linux: AMIs were created:
us-east-2: ami-0ee5157dd67ca79fc
```

The `ami-xxx` value is the ID of your new AMI. You'll deploy this AMI in the next section.

### 2.8.5. Exercises

Try these exercises to go deeper:

- What happens if you run `packer build` on this template a second time? Why?
- How can you update the template to build images for other clouds (Azure, Google Cloud) or your own computer (VirtualBox, Docker)?

### 2.8.6. How Server Templating Tools Stack Up

#### 2.8.6.1. CRUD

**Server templating tools:** Only need to support **create**.

This is because server templating is a key component of immutable infrastructure:

- To roll out a change, you create a new image and deploy it on a new server
- You never update or delete existing images
- Always creating totally new images

Server templating tools don't work in isolation. You need another tool (like a provisioning tool) to deploy these images. That tool should support all CRUD operations.

#### 2.8.6.2. Scale

**Server templating tools:** Highly scalable.

- Create an image once
- Roll that same image out to 1 server or 1,000 servers

#### 2.8.6.3. Deployment Strategies

**Server templating tools:** Only create images.

- Use other tools to roll out the images
- Use whatever deployment strategies those tools support

#### 2.8.6.4. Idempotency

**Server templating tools:** Idempotent by design.

- Create a new image every time
- Execute the exact same steps every time
- If you hit an error, just rerun and try again

#### 2.8.6.5. Consistency

**Server templating tools:** Enforce consistent structure.

Most tools provide:

- Standard documentation conventions
- Consistent file layout
- Clearly named parameters

#### 2.8.6.6. Verbosity

**Server templating tools:** Typically concise.

- Provide custom DSLs for defining images
- Don't deal with most CRUD operations
- Idempotent "for free"
- Result: Small amount of code

> **Insight: When to Use Server Templating**
>

Server templating tools are great for managing the configuration of servers with immutable infrastructure practices.



Server templating tools are powerful but don't work by themselves. You need another tool to deploy and manage the images you create, such as provisioning tools in the next section.

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

## 2.9. Provisioning Tools

### 2.9.1. What Are Provisioning Tools?

:::info[Provisioning Tools Explained]

**In plain English:** Provisioning tools are programs that create servers, databases, load balancers, and networks in the cloud by making API calls based on code you write.

**In technical terms:** Provisioning tools translate declarative infrastructure definitions into provider API calls, managing the complete lifecycle of cloud resources with state tracking and dependency resolution.

**Why it matters:** Provisioning tools let you define your entire infrastructure in code files, then automatically create, update, or destroy that infrastructure with a single command.



### 2.9.2. How Provisioning Tools Work

Most provisioning tools translate your code into API calls to cloud providers.

**Example workflow:**

1. You write OpenTofu code to create a server in AWS
2. You run OpenTofu
3. OpenTofu parses your code
4. Based on your configuration, OpenTofu makes API calls to AWS
5. AWS creates an EC2 instance, security group, etc.

**Benefits:**

- No extra setup for management servers or connectivity
- Use APIs and authentication mechanisms already provided by your cloud
- No chicken-and-egg problem like configuration management tools

### 2.9.3. Example: Deploy an EC2 Instance by Using OpenTofu

Create a new folder for the OpenTofu module:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch2/tofu/ec2-instance
$ cd ch2/tofu/ec2-instance
```

#### 2.9.3.1. Standard Naming Conventions

OpenTofu finds all files with `.tf` extension in a folder. You can name files whatever you want, but follow these standard conventions:

- `main.tf`: Main resources
- `variables.tf`: Input variables
- `outputs.tf`: Output variables

#### 2.9.3.2. Main Resources

Create `main.tf`:

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

**What this code does:**

1. **Configure provider**: OpenTofu works with many providers (AWS, Google Cloud, Azure). This configures the AWS provider for the `us-east-2` region.

2. **Create security group**: The general syntax for resources is:
   ```hcl
   resource "<PROVIDER>_<TYPE>" "<NAME>" {
     [CONFIG ...]
   }
   ```
   - `PROVIDER`: Name of provider (e.g., `aws`)
   - `TYPE`: Type of resource to create (e.g., `security_group`)
   - `NAME`: Identifier to refer to this resource (e.g., `sample_app`)
   - `CONFIG`: Arguments specific to the resource

3. **Allow HTTP requests**: Add a rule to allow inbound HTTP on port 8080

4. **Look up AMI**: Find the AMI you built with Packer (named `sample-app-packer-<UUID>`)

5. **Deploy EC2 instance**: Create an EC2 instance using the AMI from step 4, security group from step 2, user data script, and Name tag set to `var.name`

#### 2.9.3.3. User Data Script

Create `user-data.sh`:

**Example 2-11.** User data script (`ch2/tofu/ec2-instance/user-data.sh`)

```bash
#!/usr/bin/env bash
nohup node /home/ec2-user/app.js &
```

Note how small this is compared to Chapter 1's user data script. All dependencies (Node.js) and code (`app.js`) are already installed in the AMI by Packer. This script only starts the sample app.

This is a more idiomatic way to use user data.

#### 2.9.3.4. Input Variables

Create `variables.tf`:

**Example 2-12.** Input variables (`ch2/tofu/ec2-instance/variables.tf`)

```hcl
variable "name" {
  description = "The name for the EC2 instance and all resources."
  type        = string
}
```

:::info[Input Variables Explained]

**In plain English:** Input variables are like function parameters. They let you pass values into your infrastructure code.

**In technical terms:** Input variables are typed parameters with optional defaults and validation rules that allow parameterization of infrastructure modules for reuse across environments.

**Why it matters:** Variables make your infrastructure code reusable. The same module can deploy to dev, staging, or production just by passing different variable values.



#### 2.9.3.5. Output Variables

Create `outputs.tf`:

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

:::info[Output Variables Explained]

**In plain English:** Output variables are like function return values. They let you see important information after deployment.

**In technical terms:** Output variables expose resource attributes from modules, making values available to users in logs and to other modules through module output references.

**Why it matters:** Outputs let you extract useful information (like IP addresses) and share data between modules.



### 2.9.4. Running OpenTofu

Install OpenTofu (minimum version 1.9), authenticate to AWS, and run:

```bash
$ tofu init
```

Similar to Packer, OpenTofu works with many providers. Code for each provider lives in separate binaries installed via the init command.

Once init completes, run apply:

```bash
$ tofu apply
```

#### 2.9.4.1. Setting Input Variables

The apply command prompts you for the `name` input variable:

```
var.name
  The name for the EC2 instance and all resources.

  Enter a value:
```

**Four ways to set variables:**

**1. Interactive prompt:** Type a value and hit Enter

**2. Command-line flag:**
```bash
$ tofu apply -var name=sample-app-tofu
```

**3. Environment variable:** Set `TF_VAR_<name>`
```bash
$ export TF_VAR_name=sample-app-tofu
$ tofu apply
```

**4. Default value:** Add a default in `variables.tf`

**Example 2-14.** Define a default (`ch2/tofu/ec2-instance/variables.tf`)

```hcl
variable "name" {
  description = "The name for the EC2 instance and all resources."
  type        = string
  default     = "sample-app-tofu"
}
```

#### 2.9.4.2. Execution Plan

Once all input variables are set, apply shows the execution plan:

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

:::info[Execution Plan Explained]

**In plain English:** The execution plan shows you exactly what OpenTofu will create, change, or delete before it actually does anything.

**In technical terms:** The plan is a computed diff between desired state (in your code) and actual state (tracked in the state file), showing all resource changes with their attributes.

**Why it matters:** Plans let you sanity-check your code before unleashing it on the world. This is a critical safety mechanism for infrastructure changes.



**Plan symbols:**

- `+` (plus): Will be created
- `-` (minus): Will be deleted
- `~` (tilde): Will be modified in place
- `+/-` (plus and minus): Will be replaced

You can also generate a plan without applying changes:

```bash
$ tofu plan
```

Type `yes` and hit Enter to proceed. When apply completes:

```
Apply complete! Resources: 3 added, 0 changed, 0 destroyed.

Outputs:

instance_id = "i-0a4c593f4c9e645f8"
public_ip = "3.138.110.216"
security_group_id = "sg-087227914c9b3aa1e"
```

Wait 1-2 minutes for the EC2 instance to boot. Open `http://<public_ip>:8080` in your browser.

You should see:

```
Hello, World!
```

### 2.9.5. Example: Update and Destroy Infrastructure by Using OpenTofu

One big advantage of provisioning tools: they support not just deploying infrastructure, but also updating and destroying it.

#### 2.9.5.1. Updating Infrastructure

Add a new tag to the EC2 instance:

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

Run apply again:

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

#### 2.9.5.2. State Management

:::info[State Files Explained]

**In plain English:** The state file is where OpenTofu remembers what infrastructure it created. It's like OpenTofu's memory.

**In technical terms:** The state file is a JSON-formatted mapping between OpenTofu resources in configuration files and real-world infrastructure, including resource IDs, attributes, and dependency metadata.

**Why it matters:** State tracking enables OpenTofu to compute accurate diffs between desired and actual infrastructure, perform updates instead of only creates, and properly handle resource dependencies during operations.



Every time you run OpenTofu, it records information about created infrastructure in a state file.

**Default backend:** Local backend stores state in a `terraform.tfstate` file in the same folder. You'll see other backends in Chapter 5.

**How state enables updates:**

1. First `apply`: OpenTofu records IDs of created resources in state file
2. Second `apply`: You see "Refreshing state" in logs—OpenTofu checking latest status
3. Plan output: Shows diff between what's currently deployed and what's in your code
4. Update operation: OpenTofu changes only what needs to change

The preceding diff shows OpenTofu wants to create a single tag called `Test`. Type `yes` and hit Enter to perform the update.

#### 2.9.5.3. Destroying Infrastructure

When you're done testing, run `tofu destroy` to undeploy everything:

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

:::warning[Destroy is Dangerous]

The destroy plan shows all resources about to be deleted. This is your last chance to check before actually deleting.

There's no "undo" for the destroy command. Rarely, if ever, run destroy in production.



If everything looks good, type `yes` and hit Enter. In 1-2 minutes, OpenTofu cleans up everything it deployed.

### 2.9.6. Exercises

Try these exercises to go deeper:

- How do you deploy multiple EC2 instances with OpenTofu?
- What happens if you terminate an instance and rerun apply?

### 2.9.7. Example: Deploy an EC2 Instance by Using an OpenTofu Module

One of OpenTofu's most powerful features: modules are reusable.

:::info[Modules Explained]

**In plain English:** A module is reusable infrastructure code packaged together, like a function in a programming language.

**In technical terms:** A module is a container for multiple resources that are used together, with defined inputs (variables) and outputs, enabling encapsulation and code reuse.

**Why it matters:** Modules let you spin up many copies of the same infrastructure without copying and pasting code. You write it once, then reuse it everywhere.



#### 2.9.7.1. Root vs Reusable Modules

**Root module:** Any module on which you run apply directly

**Reusable module:** A module meant to be included in other modules for code reuse

So far, you've been using `ec2-instance` as a root module. Now let's use it as a reusable module.

#### 2.9.7.2. Organizing Modules

Create a folder for reusable modules:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch2/tofu/modules
```

Move the `ec2-instance` module into the `modules` folder:

```bash
$ mv ch2/tofu/ec2-instance ch2/tofu/modules/ec2-instance
```

Create a folder for root modules:

```bash
$ mkdir -p ch2/tofu/live
```

Create a new root module for the sample app:

```bash
$ mkdir -p ch2/tofu/live/sample-app
$ cd ch2/tofu/live/sample-app
```

#### 2.9.7.3. Basic Module Usage

Create `main.tf`:

**Example 2-16.** Basic module usage (`ch2/tofu/live/sample-app/main.tf`)

```hcl
module "sample_app_1" {
  source = "../../modules/ec2-instance"

  name = "sample-app-tofu-1"
}
```

**To use one module from another, you need:**

- A `module` block
- A `source` parameter with the filepath of the module to use
- Values for any input variables the module defines

If you ran apply on this code, it would use the `ec2-instance` module to create a single EC2 instance.

#### 2.9.7.4. Using a Module Multiple Times

The beauty of code reuse: use the module multiple times.

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

This code has two module blocks, so running apply creates two EC2 instances:

- One with all resources named `sample-app-tofu-1`
- One with all resources named `sample-app-tofu-2`

Three module blocks would create three instances, and so on.

You can mix and match different modules, include modules in other modules, etc. It's common for modules to be reused dozens or hundreds of times across a company.

#### 2.9.7.5. Provider Configuration

Move the provider block from the `ec2-instance` (reusable) module to the `sample-app` (root) module:

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

Reusable modules typically don't define provider blocks. They inherit provider configurations from the root module. This lets users configure providers however they prefer (different regions, accounts, etc.).

#### 2.9.7.6. Output Variables

Create `outputs.tf` in the `sample-app` folder:

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

This code "proxies" output variables from the underlying `ec2-instance` module so you can see those outputs when you run apply on the `sample-app` root module.

#### 2.9.7.7. Running the Multi-Instance Module

Run this code:

```bash
$ tofu init
$ tofu apply
```

When apply completes, you should have two EC2 instances running. Output variables show their IPs and instance IDs.

Wait 1-2 minutes for instances to boot. Open `http://<IP>:8080` in your browser, where `<IP>` is the public IP of either instance.

You should see:

```
Hello, World!
```

When you're done, run `tofu destroy` to clean everything up.

### 2.9.8. Example: Deploy an EC2 Instance by Using an OpenTofu Registry Module

One more trick: the `source` parameter can be set to not only a local filepath, but also to a URL.

#### 2.9.8.1. GitHub URLs

The book's sample code repo includes an `ec2-instance` module identical to yours. You can use it directly from GitHub:

**Example 2-20.** Set source to a GitHub URL (`ch2/tofu/live/sample-app/main.tf`)

```hcl
module "sample_app_1" {
  source = "github.com/brikis98/devops-book//ch2/tofu/modules/ec2-instance?ref=1.0.0"

  # ... (other params omitted) ...
}
```

**Note two details:**

**Double slashes (`//`):**

- Part to the left: GitHub repo
- Part to the right: Subfolder within that repo

**ref parameter:**

- Specifies a Git reference (e.g., Git tag) within the repo
- Allows you to specify the version of the module to use

OpenTofu supports GitHub URLs, GitLab URLs, Bitbucket URLs, and more.

#### 2.9.8.2. Registry URLs

One particularly convenient option: publish modules to a module registry.

:::info[Module Registry Explained]

**In plain English:** A module registry is a centralized website where people can publish, find, and download reusable infrastructure modules.

**In technical terms:** A module registry is a versioned catalog of infrastructure modules with standardized metadata, semantic versioning, and automated documentation generation.

**Why it matters:** Registries make it easy to discover and reuse modules created by others, accelerating infrastructure development.



OpenTofu and Terraform each provide a public registry for open source modules. You can also run private registries within your company.

All reusable modules in this book are published to the OpenTofu and Terraform public registries:

**Example 2-21.** Set source to a registry URL (`ch2/tofu/live/sample-app/main.tf`)

```hcl
module "sample_app_1" {
  source  = "brikis98/devops/book//modules/ec2-instance"
  version = "1.0.0"

  # ... (other params omitted) ...
}
```

**Registry URL benefits:**

- Shorter than GitHub URLs
- Use `version` parameter instead of `ref` parameter
- Supports version constraints (e.g., `~> 1.0`)

#### 2.9.8.3. Using Registry Modules

Run init one more time:

```bash
$ tofu init

Initializing the backend...
Initializing modules...
Downloading registry.opentofu.org/brikis98/devops/book 1.0.0 for sample_app_1...
Downloading registry.opentofu.org/brikis98/devops/book 1.0.0 for sample_app_2...

Initializing provider plugins...
```

The init command downloads provider code and module code. This time, it downloaded the module code from the OpenTofu registry.

Run apply. You should get the exact same two EC2 instances as before. When you're done, run destroy to clean up.

#### 2.9.8.4. The Power of Reusable Modules

A common pattern at many companies:

- **Ops team**: Defines and manages a library of vetted, reusable modules
- **Dev teams**: Use these modules as a self-service way to deploy infrastructure

**Example modules:**

- One module to deploy servers
- One module to deploy databases
- One module to configure networking

This book uses this pattern in future chapters. Instead of writing every line from scratch, you'll use modules directly from this book's sample code repo.

### 2.9.9. Exercises

Try these exercises to go deeper:

- Make your `ec2-instance` module more configurable (add input variables for instance type, AMI name, etc.)
- Learn how to version your modules

### 2.9.10. How Provisioning Tools Stack Up

#### 2.9.10.1. CRUD

**Provisioning tools:** Full support for all four CRUD operations.

You just saw OpenTofu:

- **Create** an EC2 instance
- **Read** the EC2 instance state
- **Update** the EC2 instance (to add a tag)
- **Delete** the EC2 instance

#### 2.9.10.2. Scale

**Provisioning tools:** Highly scalable.

The self-service approach (library of reusable modules managed by Ops, used by Dev) can scale to:

- Thousands of developers
- Tens of thousands of resources

#### 2.9.10.3. Deployment Strategies

**Provisioning tools:** Use whatever deployment strategies the underlying infrastructure supports.

OpenTofu allows you to use instance refresh to do a zero-downtime, rolling deployment for groups of servers in AWS. You'll try an example in Chapter 3.

#### 2.9.10.4. Idempotency

**Provisioning tools:** Idempotent by design.

:::info[Declarative vs Procedural]

**Procedural (ad hoc scripts):** Specify step-by-step how to achieve a desired end state.

**Declarative (provisioning tools):** Specify the end state you want. The tool automatically figures out how to get from current state to desired state.

**Why it matters:** Declarative tools are naturally idempotent. They always converge to the same desired state regardless of how many times you run them.



Most provisioning tools are declarative. As a result, they're idempotent by design.

#### 2.9.10.5. Consistency

**Provisioning tools:** Enforce consistent structure.

Most tools provide:

- Standard documentation conventions
- Consistent file layout
- Clearly named parameters

#### 2.9.10.6. Verbosity

**Provisioning tools:** Concise code.

The declarative nature and custom DSLs result in concise code. The OpenTofu code is about half the length of the Bash code, even though it does considerably more:

- Supports all CRUD operations
- Includes deployment strategies
- Scale
- Idempotency out of the box

#### 2.9.10.7. Beyond Infrastructure

Provisioning tools can manage more than just traditional infrastructure:

- **Version control**: Use the GitHub provider
- **Metrics**: Use the Grafana provider
- **On-call rotation**: Use the PagerDuty provider
- **And more**: Tie everything together with code

> **Insight: When to Use Provisioning Tools**
>

Provisioning tools are great for deploying and managing servers and infrastructure.

Provisioning tools should be your go-to option for managing infrastructure.



## 2.10. Using Multiple IaC Tools Together

Each tool has strengths and weaknesses. No one tool can do it all.

> **Insight: Combining IaC Tools**
>

You usually need to use multiple IaC tools together to manage your infrastructure.



### 2.10.1. Provisioning Plus Configuration Management

**Example: OpenTofu and Ansible**

- Use OpenTofu to deploy underlying infrastructure (network topology, data stores, load balancers, servers)
- Use Ansible to deploy apps on top of those servers

**Advantages:**

- Easy approach to get started with
- Many ways to integrate (OpenTofu adds tags to servers, Ansible uses inventory plugin to discover tagged servers)

**Disadvantages:**

- Using Ansible typically means mutable infrastructure
- As codebase, infrastructure, and team grow, maintenance and debugging become more difficult

### 2.10.2. Provisioning Plus Server Templating

**Example: OpenTofu and Packer**

- Use Packer to package your apps as VM images
- Use OpenTofu to deploy infrastructure, including servers that run these VM images

**Advantages:**

- Easy approach to get started with
- You already tried this combination earlier in this chapter
- Immutable infrastructure approach makes maintenance easier

**Disadvantages:**

- VMs can take a long time to build and deploy
- Slows iteration speed

### 2.10.3. Provisioning Plus Server Templating Plus Orchestration

**Example: OpenTofu, Packer, Docker, and Kubernetes**

- Use Packer to create a VM image with Docker and Kubernetes installed
- Use OpenTofu to deploy infrastructure, including servers running this VM image
- When servers boot up, they form a Kubernetes cluster
- Use Kubernetes to run your Dockerized applications

**Advantages:**

- Power of an IaC tool (OpenTofu) for managing infrastructure
- Power of server templating (Docker) for configuring servers with fast builds
- Ability to run images on your local computer
- Power of orchestration tool (Kubernetes) for managing apps (scheduling, auto healing, auto scaling, service communication)

**Disadvantages:**

- Added complexity
- Extra infrastructure to run (the Kubernetes cluster)
- Several extra layers of abstraction to learn, manage, and debug (Kubernetes, Docker, Packer)

You'll get to try this approach in Chapter 3.

## 2.11. Adopting IaC

### 2.11.1. Understanding the Costs

Adopting IaC has significant costs:

- Team members must learn new tools and techniques
- Team must get used to a totally new way of working
- Big shift from old-school sysadmin to new DevOps approach

**Old-school sysadmin approach:**

- Spend all day managing infrastructure manually and directly
- Connect to a server and update its configuration

**New DevOps approach:**

- Spend all day coding and making changes indirectly
- Write some code and let an automated process apply the changes

> **Insight: Culture and Process Change**
>

Adopting IaC requires more than just introducing a new tool or technology; it also requires changing the culture and processes of the team.



Changing culture and processes is a significant undertaking, especially at larger companies. Every team's culture and processes are different. There's no one-size-fits-all way to do it.

### 2.11.2. Tips for Successful IaC Adoption

#### 2.11.2.1. Adapt Your Architecture and Processes to Your Needs

Not every team needs IaC.

Adopting IaC has a relatively high cost. It will pay off for some scenarios but not others.

**When IaC makes sense:**

- Your team spends all its time dealing with bugs and outages from manual deployment
- Prioritizing IaC might make sense

**When IaC doesn't make sense:**

- You're at a tiny startup where one person can manage all infrastructure
- You're working on a prototype that might be thrown away in a few months
- Managing infrastructure by hand may be the right choice

Don't adopt IaC (or any other practice) just because you read it's a "best practice." There's no one best practice. Adapt your architecture and processes to your company's needs.

#### 2.11.2.2. Work Incrementally

Even if you prioritize adopting IaC, don't try to do it all in one massive step.

Adopt any new practice incrementally:

- Break the work into small steps
- Each step brings value by itself

**Bad approach:**

- Do one giant project migrating all infrastructure to IaC
- Write tens of thousands of lines of code in one go

**Good approach:**

- Use an iterative process
- Identify the most problematic part of your infrastructure (causing the most bugs and outages)
- Fix the problems in that part (perhaps by migrating that part to IaC)
- Repeat

#### 2.11.2.3. Give Your Team the Time to Learn

If you want your team to adopt IaC, dedicate sufficient time and resources to it.

**Common failure scenario 1:**

- No one on the team knows how to use IaC properly
- You end up with messy, buggy, unmaintainable code
- This causes more problems than it solves

**Common failure scenario 2:**

- Part of the team knows how to do IaC properly
- They write thousands of lines of beautiful code
- The rest of the team has no idea how to use it
- They continue making changes manually
- This invalidates most of the benefits of IaC

**Recommendations:**

1. Get everyone bought in
2. Make learning resources available (classes, documentation, video tutorials, books)
3. Provide sufficient dedicated time for team members to ramp up before using IaC everywhere

#### 2.11.2.4. Get the Right People on the Team

To use IaC, you must learn how to write code.

As you saw at the beginning of this chapter, a key shift with modern DevOps is managing more and more as code. As a company adopts more DevOps practices, strong coding skills become more and more important.

**Reality check:**

- If you have team members who are not strong coders, some will be able to level up (given sufficient time and resources)
- Some will not
- You may have to hire new developers with coding skills for your team

## 2.12. Conclusion

You now understand how to manage your infrastructure as code.

### 2.12.1. The Transformation from ClickOps to IaC

Instead of clicking around a web UI (tedious and error prone), you can automate the process (faster and more reliable).

Whereas manual deployments always require someone at your company to do the busywork, with IaC, you can reuse code written by others:

- **While learning**: Reuse code from this book's sample code repo
- **In production**: Reuse code from collections:
  - Ansible Galaxy
  - Docker Hub
  - OpenTofu Registry
  - Gruntwork Infrastructure as Code Library

### 2.12.2. Six Key Takeaways

1. **Ad hoc scripts are great for small, one-off tasks, but not for managing all your infrastructure as code.**

2. **Configuration management tools are great for managing the configuration of servers, but not for deploying the servers themselves or other infrastructure.**

3. **Server templating tools are great for managing the configuration of servers with immutable infrastructure practices.**

4. **Provisioning tools are great for deploying and managing servers and infrastructure.**

5. **You usually need to use multiple IaC tools together to manage your infrastructure.**

6. **Adopting IaC requires more than just introducing a new tool or technology; it also requires changing the culture and processes of the team.**

### 2.12.3. Choosing the Right Tool

**If the job is provisioning infrastructure:**

- You'll probably want to use a provisioning tool

**If the job is configuring servers:**

- You'll probably want to use a server templating or configuration management tool

**Most real-world setups:**

- Require you to do multiple jobs
- You'll most likely combine several tools together (e.g., provisioning plus server templating)

### 2.12.4. Variety Within Categories

There's also a lot of variety within an IaC category:

- Big differences between Ansible and Chef (both configuration management)
- Big differences between OpenTofu and CloudFormation (both provisioning tools)

For a more detailed analysis, see the comparison of Chef, Puppet, Ansible, Pulumi, CloudFormation, and Terraform/OpenTofu.

:::info[Going Deeper on OpenTofu/Terraform]

Many examples in the rest of this book involve provisioning infrastructure using OpenTofu.

To become more familiar with this toolset, grab a copy of *Terraform: Up & Running* by Yevgeniy Brikman (O'Reilly).



### 2.12.5. What's Next

Being able to use code to run a server is a huge advantage over managing it manually. But a single server is also a single point of failure.

**Questions for Chapter 3:**

- What if the server crashes?
- What if the load exceeds the capacity of a single server?
- How do you roll out changes without downtime?

These topics move into the domain of orchestration tools and managing apps—the focus of Chapter 3.

---

**Previous:** [Deploy Your App](/infrastructure-deployment/ch01-deploy-your-app) | **Next:** [Orchestration](/infrastructure-deployment/ch03-orchestration)
