---
sidebar_position: 1
title: "Part I: Infrastructure & Deployment"
description: "Learn to deploy applications and manage infrastructure with code"
---

import { CardGrid, ProcessFlow, ComparisonTable, colors } from '@site/src/components/diagrams';

# Part I: Infrastructure & Deployment

> **"The best way to learn DevOps is to deploy something real."**

---

## Overview

This section takes you from deploying your first app to managing complex infrastructure with code. You'll learn the fundamental building blocks that every DevOps engineer needs.

<ProcessFlow
  direction="horizontal"
  steps={[
    { title: "Deploy", description: "Get app running", icon: "1", color: colors.blue },
    { title: "Codify", description: "Infrastructure as Code", icon: "2", color: colors.purple },
    { title: "Orchestrate", description: "Scale & manage", icon: "3", color: colors.green }
  ]}
/>

---

## Chapters in This Section

| Chapter | Title | Key Topics |
|---------|-------|------------|
| 1 | [Deploy Your App](/infrastructure-deployment/ch01-deploy-your-app) | PaaS vs IaaS, Render, AWS EC2, deployment basics |
| 2 | [Infrastructure as Code](/infrastructure-deployment/ch02-infrastructure-as-code) | Ansible, Packer, OpenTofu, IaC categories |
| 3 | [Orchestration](/infrastructure-deployment/ch03-orchestration) | Kubernetes, Lambda, ECS, auto-scaling |

---

## What You'll Learn

By the end of Part I, you'll be able to:

- Deploy applications to both PaaS (Render) and IaaS (AWS)
- Write infrastructure as code using Ansible, Packer, and OpenTofu
- Choose the right orchestration strategy for your workload
- Understand the tradeoffs between VMs, containers, and serverless

---

<ComparisonTable
  beforeTitle="Manual Deployment"
  afterTitle="Infrastructure as Code"
  beforeColor={colors.slate}
  afterColor={colors.green}
  items={[
    { label: "Reproducibility", before: "Error-prone", after: "Consistent every time" },
    { label: "Speed", before: "Hours to days", after: "Minutes" },
    { label: "Documentation", before: "Often outdated", after: "Code IS documentation" },
    { label: "Collaboration", before: "Tribal knowledge", after: "Version controlled" }
  ]}
/>

---

**Previous:** [Introduction](/) | **Next:** [Chapter 1: Deploy Your App](/infrastructure-deployment/ch01-deploy-your-app)
