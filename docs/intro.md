---
sidebar_position: 1
title: "Fundamentals of DevOps"
description: "Master DevOps from deployment to monitoring - a comprehensive guide to modern software delivery"
slug: /
---

import { CardGrid, ProcessFlow, StackDiagram, colors } from '@site/src/components/diagrams';

# Fundamentals of DevOps

> **"DevOps is not a goal, but a never-ending process of continual improvement."**

---

## Welcome

This guide takes you from deploying your first app to building production-grade infrastructure. You'll learn practical DevOps skills through hands-on examples with real tools like AWS, Kubernetes, GitHub Actions, and more.

<ProcessFlow
  direction="horizontal"
  steps={[
    { title: "Deploy", description: "Ship your app", icon: "1", color: colors.blue },
    { title: "Automate", description: "Infrastructure as Code", icon: "2", color: colors.purple },
    { title: "Scale", description: "Orchestration", icon: "3", color: colors.green },
    { title: "Deliver", description: "CI/CD pipelines", icon: "4", color: colors.orange }
  ]}
/>

---

## What You'll Learn

<CardGrid
  columns={3}
  cards={[
    {
      title: "Infrastructure",
      icon: "server",
      color: colors.blue,
      items: ["Deploy to cloud", "Infrastructure as Code", "Container orchestration"]
    },
    {
      title: "Code & CI/CD",
      icon: "code",
      color: colors.purple,
      items: ["Version control", "Automated testing", "Continuous deployment"]
    },
    {
      title: "Operations",
      icon: "settings",
      color: colors.green,
      items: ["Networking & security", "Data storage", "Monitoring & observability"]
    }
  ]}
/>

---

## Course Structure

| Part | Chapters | Focus |
|------|----------|-------|
| **I: Infrastructure & Deployment** | 1-3 | Deploy apps, IaC with Ansible/Packer/OpenTofu, orchestration with K8s |
| **II: Code & CI/CD** | 4-6 | Git, testing, GitHub Actions, microservices |
| **III: Operations & Architecture** | 7-11 | Networking, security, storage, monitoring, future trends |

---

## Prerequisites

- Basic programming knowledge (examples use JavaScript/Node.js)
- Command line familiarity
- An AWS account (free tier works for most examples)
- Git installed locally

---

<StackDiagram
  title="The DevOps Stack"
  layers={[
    { label: "Monitoring & Observability", color: colors.orange, items: ["Logs", "Metrics", "Alerts", "Tracing"] },
    { label: "CI/CD & Automation", color: colors.green, items: ["GitHub Actions", "Automated Testing", "Deployments"] },
    { label: "Orchestration", color: colors.purple, items: ["Kubernetes", "Lambda", "ECS", "Auto Scaling"] },
    { label: "Infrastructure as Code", color: colors.blue, items: ["OpenTofu", "Ansible", "Packer"] }
  ]}
/>

---

## Get Started

Ready to begin? Start with Part I to learn how to deploy your first application.

**Next:** [Part I: Infrastructure & Deployment](/infrastructure-deployment)
