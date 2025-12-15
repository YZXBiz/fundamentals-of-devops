---
sidebar_position: 3
title: "Continuous Delivery"
description: "Learn how to implement CI/CD pipelines with GitHub Actions to automate testing, deployment, and delivery of software changes safely and reliably."
---

import { ProcessFlow, CardGrid, colors } from '@site/src/components/diagrams';

# Chapter 5. How to Set Up Continuous Integration and Continuous Delivery

## Table of Contents

1. [Continuous Integration](#continuous-integration)
2. [Deployment Strategies](#deployment-strategies)
3. [Continuous Delivery](#continuous-delivery)
4. [Deployment Pipelines](#deployment-pipelines)
5. [Conclusion](#conclusion)

## 1. Introduction: From Tools to Process

In Chapter 4, you learned several tools that help developers work together:

- Version control
- Build systems
- Automated tests

But merely having a collection of tools is not enough.

You also need to know how to put them together into an effective software delivery lifecycle (SDLC).

<ProcessFlow
  title="CI/CD Pipeline"
  steps={[
    {
      label: "Commit Code",
      description: "Push changes to feature branch",
      color: colors.blue
    },
    {
      label: "Automated Tests",
      description: "Run linting, unit, and integration tests",
      color: colors.green
    },
    {
      label: "Code Review",
      description: "Team reviews PR and plan output",
      color: colors.purple
    },
    {
      label: "Merge to Main",
      description: "Integrate changes to main branch",
      color: colors.orange
    },
    {
      label: "Deploy",
      description: "Automated deployment to production",
      color: colors.green
    }
  ]}
/>

This chapter covers two key practices that enable world-class software delivery:

- **Continuous Integration (CI)** - Merging all developers' work together regularly (daily or multiple times per day)
- **Continuous Delivery (CD)** - Ensuring you can deploy to production at any time in a manner that is fast, reliable, and sustainable

## 2. Continuous Integration

### 2.1. What is Continuous Integration?

**In plain English:** Continuous integration is like building LEGO sets. You don't wait until you have all the pieces to start assembling. You put pieces together as you go, testing that they fit.

**In technical terms:** Continuous integration means all developers merge all their work together on a regular basis, typically daily or multiple times per day.

**Why it matters:** Without CI, teams work in isolation for weeks or months, then face painful merge conflicts and integration problems.

> **Insight**
>
> Imagine building the International Space Station by having each team work in complete isolation for months, then trying to assemble all components at once in space. That's a recipe for disaster. The ISS was actually built incrementally, with teams regularly integrating and testing components together.

### 2.2. Early vs. Late Integration

Companies that use **late integration** face problems:

- Developers work in isolated feature branches for weeks or months
- Merge conflicts become painful
- Integration problems surface late
- Deployments are high-risk events

Companies that practice **continuous integration** get benefits:

- Teams merge work together regularly
- Problems exposed early (when they're easier to fix)
- Deployments become low-risk, routine events
- Faster delivery to users

> **Key Takeaway 1**
>
> Ensure that all developers merge all their work together on a regular basis, typically daily or multiple times per day.

### 2.3. Trunk-Based Development

#### 2.3.1. What is Trunk-Based Development?

**In plain English:** Trunk-based development is like everyone writing in the same shared document instead of creating separate copies for weeks.

**In technical terms:** The most common way to implement CI is trunk-based development, where developers do all their work on the same branch (typically `main`).

**Why it matters:** Instead of long-lived feature branches, you create short-lived branches lasting from a few hours to a few days.

#### 2.3.2. Companies Using Trunk-Based Development

Real-world examples at massive scale:

- **LinkedIn** - Scaled from ~100 to 1,000+ developers
- **Meta** - Thousands of developers on one branch
- **Google** - Tens of thousands of developers, 2+ billion lines of code, 40,000 commits/day

> **Insight**
>
> If Google can have tens of thousands of developers working on one branch with 2+ billion lines of code, your team can too.

### 2.4. Common Questions About Trunk-Based Development

#### 2.4.1. Won't You Have Merge Conflicts All the Time?

**Short answer:** No!

**In plain English:** It's like bumping into someone in a hallway. If you pass through once, you might bump into them. If you both camp out there for a week, you'll definitely bump into each other constantly.

**Why it matters:** Short-lived branches actually have *fewer* conflicts than long-lived branches.

**Example:**
- Two developers each change 10 files in one day → Low chance of overlap
- Two developers each change 500 files over three months → Conflicts are inevitable

> If it hurts, do it more often.
>
> — Martin Fowler

#### 2.4.2. Won't the Build Always Be Broken?

**Short answer:** Not if you use automated testing!

This is where automated testing from Chapter 4 becomes critical.

You configure a **self-testing build** that runs tests after every commit.

Code that doesn't pass tests doesn't get merged.

> **Key Takeaway 2**
>
> Use a self-testing build after every commit to ensure that your code is always in a working and deployable state.

**How it works:**

1. Developer pushes code to a branch
2. Automated tests run automatically
3. If tests pass → Code can be merged
4. If tests fail → Code must be fixed before merging

#### 2.4.3. How Do You Make Large Changes That Take Months?

**Short answer:** You use two techniques:

- Branch by abstraction
- Feature toggles

Let's explore both.

### 2.5. Branch by Abstraction

#### 2.5.1. What is Branch by Abstraction?

**In plain English:** Branch by abstraction is like replacing the engine of a car while it's still running. You add the new engine alongside the old one, gradually switch systems over, then remove the old engine.

**In technical terms:** Instead of working in a feature branch for months, you introduce an abstraction layer that allows you to make large-scale changes incrementally.

**Why it matters:** This allows large-scale refactors while continuously integrating your work.

#### 2.5.2. Example: Replacing a Library

Let's say you want to replace Library X with Library Y across hundreds of modules.

**Bad approach (long-lived branch):**
1. Create a feature branch
2. Spend months updating all modules
3. Try to merge back to main
4. Face massive merge conflicts

**Good approach (branch by abstraction):**
1. **Introduce an abstraction** layer that initially uses Library X under the hood
2. **Incrementally update modules** to use the abstraction (across many commits to main)
3. **Switch the abstraction** to use Library Y internally
4. **Remove Library X** when all modules are updated

Each step is a separate commit to main. The code is always working. Integration happens continuously.

### 2.6. Feature Toggles

#### 2.6.1. What are Feature Toggles?

**In plain English:** Feature toggles are like light switches for your code. You can turn features on or off without changing the code.

**In technical terms:** Feature toggles (aka feature flags) wrap new functionality in conditionals that allow you to enable or disable features at runtime.

**Why it matters:** This separates deployment from release, giving you powerful capabilities.

#### 2.6.2. Example: Feature Toggle in Code

```javascript
app.get('/', (req, res) => {
  if (lookupFeatureToggle(req, "HOME_PAGE_FLAVOR") === "v2") {
    res.send(newFancyHomepage()); // New version
  } else {
    res.send('Hello, World!'); // Original version
  }
});
```

The key property: **all feature toggles default to off**.

#### 2.6.3. Superpowers of Feature Toggles

Feature toggles allow you to:

- **Merge incomplete features** to main without affecting users
- **Separate deployment from release** - Deploy code, release features later
- **Quickly disable problematic features** without redeploying
- **Gradually ramp new features** - 1% → 10% → 50% → 100% of users
- **A/B test different versions** - Compare performance with data

> **Key Takeaway 3**
>
> Use branch by abstraction and feature toggles to make large-scale changes while still merging your work on a regular basis.

### 2.7. Example: Run Automated Tests in GitHub Actions

#### 2.7.1. What is GitHub Actions?

**In plain English:** GitHub Actions is like a robot assistant that runs tasks for you every time you push code.

**In technical terms:** GitHub Actions is a CI/CD platform that allows you to automate your build, test, and deployment pipeline directly from GitHub.

**Why it matters:** Instead of manually running tests on your laptop, GitHub Actions runs them automatically in the cloud for every commit.

#### 2.7.2. Create a Test Workflow

Create `.github/workflows/app-tests.yml`:

```yaml
name: Sample App Tests

on: push

jobs:
  sample_app_tests:
    name: "Run Tests Using Jest"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install dependencies
        working-directory: ch5/sample-app
        run: npm install

      - name: Run tests
        working-directory: ch5/sample-app
        run: npm test
```

**How this workflow works:**

1. **Runs on every push** - Triggered automatically when you push code
2. **Checks out your code** - Downloads your repo into the runner
3. **Installs dependencies** - Runs `npm install` to get all packages
4. **Runs automated tests** - Executes `npm test`
5. **Shows results** directly in pull requests

> **Insight**
>
> Now every time someone pushes code, tests run automatically. If tests fail, GitHub shows the failure right in the pull request. No more "I forgot to run tests" excuses!

### 2.8. Authentication for CI/CD

#### 2.8.1. The Problem: Machine-to-Machine Authentication

**In plain English:** Your CI/CD system needs to log in to cloud services (like AWS) to deploy your app. But how do you give a robot credentials safely?

**In technical terms:** When machines need to authenticate to other machines, you have two options.

**Why it matters:** The traditional approach (copying credentials manually) is insecure and error-prone.

#### 2.8.2. Option 1: Machine User Credentials

**How it works:**
- Create a dedicated user account for automation
- Generate credentials (e.g., AWS access keys)
- Manually copy credentials to CI system

**Drawbacks:**
- Manual copying (tedious and error-prone)
- Long-lived credentials (security risk)
- Hard to rotate credentials

#### 2.8.3. Option 2: Automatically Provisioned Credentials (Recommended)

**How it works:**
- System automatically generates credentials
- No manual copy/paste required
- Short-lived credentials (e.g., 1 hour)
- Example: OpenID Connect (OIDC)

**Benefits:**
- More secure (short-lived credentials)
- Less work (no manual copying)
- Easier to rotate
- Better audit trail

> **Key Takeaway 4**
>
> Use machine user credentials or automatically provisioned credentials to authenticate from a CI server or other automations.

## 3. Deployment Strategies

### 3.1. Introduction

**In plain English:** A deployment strategy is like a plan for how to roll out a new version of your app without breaking things for users.

**In technical terms:** You can choose from many strategies to roll out changes, each with different trade-offs.

**Why it matters:** The wrong deployment strategy can cause outages. The right one makes deployments safe and painless.

### 3.2. Core Deployment Strategies

<CardGrid
  title="Core Deployment Strategies"
  cards={[
    {
      title: "Downtime Deployment",
      description: "Take all servers down, update them, bring them back up. Simple but causes outages.",
      color: colors.red,
      items: [
        "User Experience: Poor",
        "Stateless Apps: ✓",
        "Stateful Apps: ✓",
        "Resource Overhead: Low"
      ]
    },
    {
      title: "Rolling Deployment",
      description: "Gradually replace old versions with new versions. Users may see both versions temporarily.",
      color: colors.blue,
      items: [
        "User Experience: Good",
        "Stateless Apps: ✓",
        "Stateful Apps: ✓ (with replacement)",
        "Resource Overhead: Medium"
      ]
    },
    {
      title: "Blue-Green Deployment",
      description: "Deploy new version alongside old, then instantly switch all traffic. Best user experience.",
      color: colors.green,
      items: [
        "User Experience: Excellent",
        "Stateless Apps: ✓",
        "Stateful Apps: ✗",
        "Resource Overhead: High (2x resources)"
      ]
    }
  ]}
/>

### 3.3. Downtime Deployment

**In plain English:** Downtime deployment is like closing a restaurant to renovate it. Simple, but customers can't eat while you're working.

**How it works:**
1. Take all servers down
2. Update them
3. Bring them back up

**When to use it:**
- Internal tools (where downtime is acceptable)
- Stateful apps (where rolling updates are complex)
- Small deployments (where downtime is brief)

**Drawbacks:**
- Poor user experience (site is down)
- Not suitable for high-availability systems

### 3.4. Rolling Deployment

**In plain English:** Rolling deployment is like updating seats in a stadium one section at a time. The game keeps running, but some fans get new seats before others.

**How it works:**
1. Update a few servers at a time
2. Wait for them to pass health checks
3. Move on to the next batch
4. Repeat until all servers are updated

**When to use it:**
- Most modern applications
- When you can't afford 2x resources
- Stateless apps (or stateful apps with replacement strategy)

**Drawbacks:**
- Users may see different versions temporarily
- Rollback is slower (must roll back each batch)

### 3.5. Blue-Green Deployment

**In plain English:** Blue-green deployment is like building a completely new restaurant next door, then switching all customers over instantly.

**How it works:**
1. Deploy new version alongside old (green alongside blue)
2. Test green environment
3. Instantly switch all traffic to green
4. Keep blue around for quick rollback

**When to use it:**
- High-availability systems
- When you need instant rollback capability
- Stateless apps only

**Drawbacks:**
- Requires 2x resources
- Not suitable for stateful apps (two databases would diverge)

> **Insight**
>
> Most companies use rolling deployments for most apps, blue-green for critical user-facing services, and downtime deployments for internal tools.

### 3.6. Add-On Deployment Strategies

These strategies enhance the core strategies:

#### 3.6.1. Canary Deployment

**In plain English:** Canary deployment is like sending a canary into a coal mine. If the canary survives, it's safe for everyone else.

**How it works:**
- Deploy new version to a single server (the "canary")
- Monitor for errors, performance issues
- If canary looks good, roll out to all servers
- If canary has problems, roll back immediately

**Benefits:**
- Catch issues before they affect all users
- Limited blast radius
- Early warning system

#### 3.6.2. Feature Toggle Deployment

**In plain English:** Feature toggle deployment is like installing a new feature in your app but keeping it locked until you're ready.

**How it works:**
- Deploy new code with features toggled off
- Gradually enable features after deployment
- Quickly disable features if problems arise
- Separate deployment from release

**Benefits:**
- Deploy code without releasing features
- Instantly disable problematic features
- No need to redeploy to turn off a feature

#### 3.6.3. Promotion Deployment

**In plain English:** Promotion deployment is like testing a new product in a small market before going nationwide.

**How it works:**
- Deploy to dev → stage → prod environments
- Test in each environment before promoting
- Catch issues before they reach production

**Benefits:**
- Multiple layers of testing
- Confidence before production
- Real-world testing in stage environment

> **Superpowers of Feature Toggles**
>
> 1. **Separate deployment from release** - Deploy code without releasing features
> 2. **Resolve issues instantly** - Disable features without redeploying
> 3. **Gradual rollouts** - Start at 1%, ramp to 100%
> 4. **A/B testing** - Compare different versions with data

## 4. Continuous Delivery

### 4.1. What is Continuous Delivery?

**In plain English:** Continuous delivery is like being able to ship a package at any time. You're always ready, and shipping is just a button press.

**In technical terms:** Continuous delivery (CD) means you can deploy to production at any time in a manner that is fast, reliable, and sustainable.

**Why it matters:** The key is making deployment frequency a business decision, not a technical limitation.

> **Key Takeaway 5**
>
> Ensure that you can deploy to production at any time in a manner that is fast, reliable, and sustainable.

### 4.2. Requirements for Continuous Delivery

To practice CD, you need two things:

1. **Code always in deployable state** - Achieved through CI with self-testing builds
2. **Automated deployment process** - Achieved through deployment pipelines

Let's explore deployment pipelines.

## 5. Deployment Pipelines

### 5.1. What is a Deployment Pipeline?

**In plain English:** A deployment pipeline is like an assembly line for code. Code goes in one end, and a deployed application comes out the other.

**In technical terms:** A deployment pipeline captures your company's process for going from idea to production.

**Why it matters:** Without a pipeline, deployments are manual, error-prone, and stressful. With a pipeline, deployments are automated, reliable, and boring (in a good way).

### 5.2. Pipeline Stages

Most pipelines include:

- **Commit** - How code enters version control
- **Build** - Compilation and packaging steps
- **Test** - Automated and manual testing
- **Review** - Code review and approval processes
- **Deploy** - Getting code to production

### 5.3. GitOps Principles

#### 5.3.1. What is GitOps?

**In plain English:** GitOps is like using Git as the single source of truth for everything. If it's not in Git, it doesn't exist.

**In technical terms:** GitOps is a set of principles for managing infrastructure and applications where Git is the single source of truth.

**Why it matters:** GitOps makes deployments more reliable, auditable, and repeatable.

#### 5.3.2. GitOps Principles

Many modern pipelines follow GitOps:

1. **Declarative** - Define desired state (not procedures)
2. **Versioned** - Store everything in Git
3. **Pulled automatically** - Pipeline runs from Git (no manual steps)
4. **Continuously reconciled** - Automatically fix drift

> **Insight**
>
> With GitOps, your Git repo becomes your audit trail. You can see exactly what was deployed, when it was deployed, and who deployed it.

### 5.4. Example: OpenTofu Deployment Pipeline

#### 5.4.1. Pipeline Overview

Here's a simplified pipeline for deploying infrastructure:

**On Pull Request** - Run `tofu plan`
**After Merge** - Run `tofu apply`

This ensures every change is reviewed before it's deployed.

#### 5.4.2. Step 1: Run Plan on Pull Request

Create `.github/workflows/tofu-plan.yml`:

```yaml
name: Tofu Plan
on:
  pull_request:
    branches: ["main"]

jobs:
  plan:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v2

      - uses: aws-actions/configure-aws-credentials@v3
        with:
          role-to-assume: arn:aws:iam::ACCOUNT:role/plan-role
          aws-region: us-east-2

      - uses: opentofu/setup-opentofu@v1

      - name: tofu plan
        run: |
          tofu init -input=false
          tofu plan -input=false -lock=false

      - name: Post plan to PR
        uses: peter-evans/create-or-update-comment@v4
        with:
          issue-number: ${{ github.event.pull_request.number }}
          body: Plan output here...
```

**How this workflow works:**

1. **Triggers on pull requests** to main
2. **Checks out code** from the PR
3. **Authenticates to AWS** using OIDC (automatically provisioned credentials)
4. **Installs OpenTofu** in the runner
5. **Runs `tofu plan`** to show what changes would be made
6. **Posts plan output** as a comment on the PR

> **Insight**
>
> Now reviewers can see exactly what infrastructure changes will happen before approving the PR. This prevents surprises!

#### 5.4.3. Step 2: Run Apply After Merge

Create `.github/workflows/tofu-apply.yml`:

```yaml
name: Tofu Apply
on:
  push:
    branches: ["main"]

jobs:
  apply:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - uses: aws-actions/configure-aws-credentials@v3
        with:
          role-to-assume: arn:aws:iam::ACCOUNT:role/apply-role
          aws-region: us-east-2

      - uses: opentofu/setup-opentofu@v1

      - name: tofu apply
        run: |
          tofu init -input=false
          tofu apply -auto-approve -lock-timeout=60m
```

**How this workflow works:**

1. **Triggers on push** to main (when PR is merged)
2. **Authenticates to AWS** with apply permissions
3. **Runs `tofu apply`** to make the changes
4. **Automatically approves** (since the PR was already approved)

### 5.5. Deployment Pipeline Recommendations

#### 5.5.1. Automate Everything Possible

**In plain English:** Computers are fast, reliable, and never get tired. Use them.

**Why it matters:** Even a few manual steps dramatically reduce effectiveness.

**Recommendation:** Aim for "push button" deployment. Ideally, no button at all—deploy automatically on merge to main.

> **Insight**
>
> A deployment that requires 10 manual steps isn't really automated. Each manual step is a chance for human error.

#### 5.5.2. Deploy Only from Deployment Server

**Don't do this:**
- Developers deploy from their laptops
- "It works on my machine"
- No audit trail

**Do this instead:**
- All deployments go through CI/CD server
- Ensures full automation
- Provides repeatable environment
- Easier to manage permissions
- Complete audit trail

> **Insight**
>
> If deployments can happen from any developer's laptop, you can't guarantee consistency or audit what happened.

#### 5.5.3. Protect the Deployment Server

Your deployment server is a critical security asset. Protect it:

**Access control:**
- Lock down access (HTTPS, authentication, logging)
- Protect version control system
- Require approval workflows

**Permissions:**
- Use read-only permissions before approval
- Use short-lived credentials (OIDC)
- Limit permissions per pipeline (principle of least privilege)
- Restrict what can be executed

> **Warning**
>
> If an attacker compromises your deployment server, they can deploy malicious code to production. Protect it accordingly!

## 6. Conclusion

### 6.1. Five Key Takeaways

You've now automated your entire SDLC through CI/CD, following these five key takeaways:

1. Merge all work together regularly (daily or multiple times per day)
2. Use self-testing builds to keep code always deployable
3. Use branch by abstraction and feature toggles for large changes
4. Use automatically provisioned credentials for CI/CD
5. Deploy to production at any time (fast, reliable, sustainable)

### 6.2. Why CI/CD Matters

> Agility requires safety. The limit of how fast you can build software is usually not determined by how fast developers can code, but by how quickly you can release features without causing bugs, outages, and security incidents.

**In plain English:** CI/CD is like adding airbags and seatbelts to your car. They don't make you go faster directly, but they let you drive faster safely.

**Why it matters:** CI/CD puts safety mechanisms in place—automated tests, code reviews, feature toggles—so you can release software faster without putting your product at risk.

This is why virtually all companies with world-class software delivery use CI/CD.

### 6.3. What's Next

As your company grows, you'll hit new bottlenecks:

**External pressures:**
- More users
- More load
- More data

**Internal pressures:**
- More products
- More teams
- More complexity

To handle these demands, you need to learn how to work with multiple environments and multiple teams.

This is the focus of Chapter 6.

---

**Previous:** [Link](/code-cicd/ch04-version-build-test) | **Next:** [Link](/code-cicd/ch06-multiple-services)
