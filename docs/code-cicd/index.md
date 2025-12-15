---
sidebar_position: 1
title: "Part II: Code & CI/CD"
description: "Master version control, testing, and continuous delivery pipelines"
---

import { CardGrid, ProcessFlow, ComparisonTable, colors } from '@site/src/components/diagrams';

# Part II: Code & CI/CD

> **"If it hurts, do it more frequently, and bring the pain forward."**
>
> — Continuous Delivery principle

---

## Overview

This section covers the software development lifecycle from version control to production deployment. You'll learn to build robust CI/CD pipelines that automate testing and deployment.

<ProcessFlow
  direction="horizontal"
  steps={[
    { title: "Code", description: "Version control", icon: "1", color: colors.blue },
    { title: "Build", description: "Compile & package", icon: "2", color: colors.purple },
    { title: "Test", description: "Automated testing", icon: "3", color: colors.green },
    { title: "Deploy", description: "Ship to production", icon: "4", color: colors.orange }
  ]}
/>

---

## Chapters in This Section

| Chapter | Title | Key Topics |
|---------|-------|------------|
| 4 | [Version, Build, and Test](/code-cicd/ch04-version-build-test) | Git, GitHub, npm, Jest, code review |
| 5 | [Continuous Deployment](/code-cicd/ch05-continuous-deployment) | CI/CD, GitHub Actions, deployment strategies |
| 6 | [Multiple Services](/code-cicd/ch06-multiple-services) | Environments, microservices, configuration |

---

## What You'll Learn

By the end of Part II, you'll be able to:

- Use Git effectively for version control and collaboration
- Set up automated build and test pipelines
- Implement CI/CD with GitHub Actions
- Deploy using blue-green, canary, and rolling strategies
- Manage multiple environments and microservices

---

<CardGrid
  columns={3}
  cards={[
    {
      title: "Deployment Strategies",
      icon: "deploy",
      color: colors.blue,
      items: ["Blue-Green", "Canary", "Rolling", "Feature Flags"]
    },
    {
      title: "Testing Pyramid",
      icon: "test",
      color: colors.purple,
      items: ["Unit Tests", "Integration Tests", "E2E Tests", "Smoke Tests"]
    },
    {
      title: "Environments",
      icon: "layers",
      color: colors.green,
      items: ["Development", "Staging", "Production", "Preview"]
    }
  ]}
/>

---

**Previous:** [Part I: Infrastructure & Deployment](/infrastructure-deployment) | **Next:** [Chapter 4: Version, Build, and Test](/code-cicd/ch04-version-build-test)
