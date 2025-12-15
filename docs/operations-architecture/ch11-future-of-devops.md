---
sidebar_position: 6
title: "The Future of DevOps"
description: "Explore emerging trends: infrastructureless computing, generative AI, secure by default, platform engineering, and infrastructure from code"
---

import { ProcessFlow, CardGrid, ComparisonTable, colors } from '@site/src/components/diagrams';

# Chapter 11: The Future of DevOps and Software Delivery

> **"It's difficult to make predictions, especially about the future."**
>
> — Niels Bohr

---

## Table of Contents

1. [Infrastructureless](#1-infrastructureless)
2. [Generative AI](#2-generative-ai)
3. [Secure by Default](#3-secure-by-default)
4. [Platform Engineering](#4-platform-engineering)
5. [The Future of Infrastructure Code](#5-the-future-of-infrastructure-code)
6. [Conclusion](#6-conclusion)

---

## 1. Infrastructureless

Much of the history of software is one of gradually moving to higher and higher levels of abstraction.

<ProcessFlow
  direction="horizontal"
  steps={[
    { title: "Servers", description: "Physical hardware", icon: "1", color: colors.blue },
    { title: "VMs", description: "Virtualization", icon: "2", color: colors.purple },
    { title: "Containers", description: "Lightweight isolation", icon: "3", color: colors.green },
    { title: "Serverless", description: "Functions", icon: "4", color: colors.orange },
    { title: "Infrastructureless", description: "Pure apps", icon: "5", color: colors.cyan }
  ]}
/>

At each stage, you give up control in exchange for not having to worry about entire classes of problems. With serverless, you give up control over the hardware and runtime environment, but in exchange, you don't have to think about racking servers, patching the OS, auto scaling, auto healing, and so on.

**My prediction:** Most of what we think of as infrastructure today will be abstracted away, and the focus will shift more and more to apps. You'll effectively be saying, "Here's a piece of code I want to run," and the rest will be taken care of.

<ComparisonTable
  beforeTitle="Serverless Today"
  afterTitle="Infrastructureless Future"
  beforeColor={colors.slate}
  afterColor={colors.green}
  items={[
    { label: "Data Centers", before: "Choose regions and AZs", after: "Automatic global distribution" },
    { label: "Endpoints", before: "Configure Lambda URLs", after: "Automatic endpoint generation" },
    { label: "Databases", before: "Provision RDS, DynamoDB", after: "Automatic data persistence" },
    { label: "Networking", before: "Configure VPCs", after: "Automatic secure networking" },
    { label: "Scaling", before: "Configure concurrency", after: "Unlimited automatic scaling" }
  ]}
/>

---

## 2. Generative AI

Generative AI (GenAI) refers to software that can create text, code, images, and video, typically in response to prompts. Under the hood, GenAI uses large language models (LLMs).

<CardGrid
  columns={2}
  cards={[
    {
      title: "GenAI Strengths",
      icon: "sparkle",
      color: colors.green,
      items: ["Code generation", "Documentation", "Pattern recognition", "Natural language interface"]
    },
    {
      title: "GenAI Weaknesses",
      icon: "warning",
      color: colors.orange,
      items: ["Hallucinations", "Inconsistent outputs", "No source citations", "Security blind spots"]
    }
  ]}
/>

**My prediction:** Coding assistants will be of limited use for DevOps and software delivery, because the most important priorities—security, reliability, repeatability, and resiliency—are precisely GenAI's weak areas.

However, **Retrieval-Augmented Generation (RAG)** may have significant impact:

- **Understanding infrastructure** - Answer questions about your systems
- **Debugging** - Investigate incidents with natural language
- **Detecting patterns** - Proactively identify attacks or anomalies

---

## 3. Secure by Default

Unfortunately, many DevOps tools today have insecure defaults:

- Network communication and data storage are unencrypted
- All inbound and outbound network access is allowed
- Third-party dependencies are not validated
- Secure passwords and MFA are not required

<CardGrid
  columns={2}
  cards={[
    {
      title: "Shift Left Security",
      icon: "shield",
      color: colors.purple,
      items: ["SAST - Static analysis", "DAST - Dynamic testing", "Early vulnerability detection", "Tools: Snyk, SonarQube"]
    },
    {
      title: "Supply Chain Security",
      icon: "lock",
      color: colors.blue,
      items: ["Code signing", "SBOM tracking", "Automatic patching", "Secret detection"]
    }
  ]}
/>

**Key trends:**
- **Memory-safe languages** (Rust, Go) - 70% of vulnerabilities are memory-related
- **Zero-trust networking** - Every connection authenticated and encrypted
- **Least privilege in frameworks** - Apps request only needed permissions

> **Insight**
>
> Security is not only a technical question, but also one of economics and ergonomics. The secure path must also be the easy path.

---

## 4. Platform Engineering

Virtually every company ends up creating its own **Internal Developer Platform (IDP)**—a set of workflows, tools, and interfaces customized to meet that company's needs.

**What an IDP should provide:**

| Category | What It Handles |
|----------|-----------------|
| Hosting | Infrastructure in your chosen provider |
| IaC | All infrastructure managed as code |
| Orchestration | K8s, Lambda, or your chosen tool |
| CI/CD | Automatic builds, tests, deployments |
| Networking | DNS, VPCs, service mesh |
| Security | Encryption at rest and in transit |
| Monitoring | Logs, metrics, events, alerts |

The challenge: IDPs tend to be either **highly opinionated** (great if it fits, unusable if not) or **highly customizable** (so complicated everyone hates it).

---

## 5. The Future of Infrastructure Code

Two interesting new approaches are emerging:

<CardGrid
  columns={2}
  cards={[
    {
      title: "Interactive Playbooks",
      icon: "play",
      color: colors.blue,
      items: ["Execute code in docs", "Live data fetching", "Custom debugging UIs", "Tools: Runme, Rundeck"]
    },
    {
      title: "Infrastructure from Code",
      icon: "code",
      color: colors.purple,
      items: ["Infer infra from app code", "Automatic provisioning", "Cloud portability", "Tools: Ampt, Nitric"]
    }
  ]}
/>

**Infrastructure from Code (IfC)** automatically figures out what infrastructure you need by parsing your application code. If you write a JavaScript app that responds to HTTP requests by looking up data in a database, an IfC tool can automatically provision a Lambda function, Lambda URL, and RDS database.

---

## 6. Conclusion

If you've made it to this point in the book, you now know all the basics of DevOps and software delivery:

- Deployed apps using PaaS and IaaS
- Managed infrastructure as code with Ansible, Docker, Packer, and OpenTofu
- Orchestrated apps with Kubernetes and Lambda
- Set up CI/CD pipelines in GitHub Actions
- Configured networking, security, storage, and monitoring

**Software is never done.** It's a living, breathing thing, and DevOps is all about how to keep that thing alive and growing.

> **Insight**
>
> This is the end of the book but the beginning of your journey. You're just getting started!

---

**Previous:** [Monitoring](/operations-architecture/ch10-monitoring)
