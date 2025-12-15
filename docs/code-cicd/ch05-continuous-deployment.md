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

In Chapter 4, you learned several tools that help developers work together, including version control, build systems, and automated tests. But merely having a collection of tools is not enough. You also need to know how to put them together into an effective software delivery lifecycle (SDLC).

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

- **Continuous Integration (CI)**: Merging all developers' work together regularly (daily or multiple times per day)
- **Continuous Delivery (CD)**: Ensuring you can deploy to production at any time in a manner that is fast, reliable, and sustainable

## Continuous Integration

Imagine building the International Space Station by having each team work in complete isolation for months, then trying to assemble all components at once in space. That's a recipe for disaster. The ISS was actually built incrementally, with teams regularly integrating and testing components together.

Software development works the same way. Companies that use **late integration**—where developers work in isolated feature branches for weeks or months—face painful merge conflicts and integration problems. Companies that practice **continuous integration** merge work together regularly and expose problems early.

:::tip Key Takeaway 1
Ensure that all developers merge all their work together on a regular basis, typically daily or multiple times per day.
:::

### Trunk-Based Development

The most common way to implement CI is **trunk-based development**, where developers do all their work on the same branch (typically `main`). Instead of long-lived feature branches, you create short-lived branches lasting from a few hours to a few days.

Companies using trunk-based development:
- **LinkedIn**: Scaled from ~100 to 1,000+ developers
- **Meta**: Thousands of developers on one branch
- **Google**: Tens of thousands of developers, 2+ billion lines of code, 40,000 commits/day

### Common Questions About Trunk-Based Development

**Q: Won't you have merge conflicts all the time?**

A: No! Short-lived branches actually have *fewer* conflicts. If two developers each change 10 files in one day, the chance of overlap is low. If they each change 500 files over three months, conflicts are inevitable.

> If it hurts, do it more often.
> — Martin Fowler

**Q: Won't the build always be broken?**

A: This is where automated testing comes in. You configure a **self-testing build** that runs tests after every commit. Code that doesn't pass tests doesn't get merged.

:::tip Key Takeaway 2
Use a self-testing build after every commit to ensure that your code is always in a working and deployable state.
:::

**Q: How do you make large changes that take months?**

A: You use two techniques: **branch by abstraction** and **feature toggles**.

### Branch by Abstraction

Let's say you want to replace Library X with Library Y across hundreds of modules. Instead of working in a feature branch for months:

1. **Introduce an abstraction** layer that initially uses Library X under the hood
2. **Incrementally update modules** to use the abstraction (across many commits to main)
3. **Switch the abstraction** to use Library Y internally
4. **Remove Library X** when all modules are updated

This allows large-scale refactors while continuously integrating your work.

### Feature Toggles

Feature toggles (aka feature flags) wrap new functionality in conditionals:

```javascript
app.get('/', (req, res) => {
  if (lookupFeatureToggle(req, "HOME_PAGE_FLAVOR") === "v2") {
    res.send(newFancyHomepage()); // New version
  } else {
    res.send('Hello, World!'); // Original version
  }
});
```

The key property: **all feature toggles default to off**. This allows you to:
- Merge incomplete features to main without affecting users
- Separate deployment from release
- Quickly disable problematic features without redeploying
- Gradually ramp new features (1% → 10% → 50% → 100% of users)
- A/B test different versions

:::tip Key Takeaway 3
Use branch by abstraction and feature toggles to make large-scale changes while still merging your work on a regular basis.
:::

### Example: Run Automated Tests in GitHub Actions

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

This workflow:
- Runs on every push
- Checks out your code
- Installs dependencies
- Runs automated tests
- Shows results directly in pull requests

### Authentication for CI/CD

When machines need to authenticate to other machines, you have two options:

**Machine User Credentials**
- Create a dedicated user account for automation
- Generate credentials (e.g., AWS access keys)
- Manually copy credentials to CI system
- Drawbacks: Manual copying, long-lived credentials

**Automatically Provisioned Credentials** (Recommended)
- System automatically generates credentials
- No manual copy/paste required
- Short-lived credentials (e.g., 1 hour)
- Example: OpenID Connect (OIDC)

:::tip Key Takeaway 4
Use machine user credentials or automatically provisioned credentials to authenticate from a CI server or other automations.
:::

## Deployment Strategies

You can choose from many strategies to roll out changes. Here are the most common:

<CardGrid
  title="Core Deployment Strategies"
  cards={[
    {
      title: "Downtime Deployment",
      description: "Take all servers down, update them, bring them back up. Simple but causes outages.",
      color: colors.red,
      details: [
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
      details: [
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
      details: [
        "User Experience: Excellent",
        "Stateless Apps: ✓",
        "Stateful Apps: ✗",
        "Resource Overhead: High (2x resources)"
      ]
    }
  ]}
/>

### Add-On Deployment Strategies

These strategies enhance the core strategies:

**Canary Deployment**
- Deploy new version to single server (the "canary")
- Monitor for errors, performance issues
- If canary looks good, roll out to all servers
- If canary has problems, roll back immediately

**Feature Toggle Deployment**
- Deploy new code with features toggled off
- Gradually enable features after deployment
- Quickly disable features if problems arise
- Separate deployment from release

**Promotion Deployment**
- Deploy to dev → stage → prod environments
- Test in each environment before promoting
- Catch issues before they reach production

:::info Superpowers of Feature Toggles
1. **Separate deployment from release**: Deploy code without releasing features
2. **Resolve issues instantly**: Disable features without redeploying
3. **Gradual rollouts**: Start at 1%, ramp to 100%
4. **A/B testing**: Compare different versions with data
:::

## Continuous Delivery

Continuous delivery (CD) means you can deploy to production at any time in a manner that is fast, reliable, and sustainable. The key is making deployment frequency a business decision, not a technical limitation.

:::tip Key Takeaway 5
Ensure that you can deploy to production at any time in a manner that is fast, reliable, and sustainable.
:::

To practice CD, you need:

1. **Code always in deployable state**: Achieved through CI with self-testing builds
2. **Automated deployment process**: Achieved through deployment pipelines

## Deployment Pipelines

A deployment pipeline captures your company's process for going from idea to production. Most pipelines include:

- **Commit**: How code enters version control
- **Build**: Compilation and packaging steps
- **Test**: Automated and manual testing
- **Review**: Code review and approval processes
- **Deploy**: Getting code to production

### GitOps Principles

Many modern pipelines follow GitOps:

1. **Declarative**: Define desired state (not procedures)
2. **Versioned**: Store everything in Git
3. **Pulled automatically**: Pipeline runs from Git (no manual steps)
4. **Continuously reconciled**: Automatically fix drift

### Example: OpenTofu Deployment Pipeline

Here's a simplified pipeline for deploying infrastructure:

**On Pull Request**: Run `tofu plan`

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

**After Merge**: Run `tofu apply`

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

### Deployment Pipeline Recommendations

**1. Automate Everything Possible**
- Computers are fast, reliable, and never get tired
- Aim for "push button" deployment
- Even a few manual steps dramatically reduce effectiveness

**2. Deploy Only from Deployment Server**
- Ensures full automation (not relying on developer laptops)
- Provides repeatable environment
- Easier to manage permissions

**3. Protect the Deployment Server**
- Lock down access (HTTPS, authentication, logging)
- Protect version control system
- Require approval workflows
- Use read-only permissions before approval
- Use short-lived credentials (OIDC)
- Limit permissions per pipeline
- Restrict what can be executed

## Conclusion

You've now automated your entire SDLC through CI/CD, following these five key takeaways:

1. Merge all work together regularly (daily or multiple times per day)
2. Use self-testing builds to keep code always deployable
3. Use branch by abstraction and feature toggles for large changes
4. Use automatically provisioned credentials for CI/CD
5. Deploy to production at any time (fast, reliable, sustainable)

> Agility requires safety. The limit of how fast you can build software is usually not determined by how fast developers can code, but by how quickly you can release features without causing bugs, outages, and security incidents.

CI/CD puts safety mechanisms in place—automated tests, code reviews, feature toggles—so you can release software faster without putting your product at risk. This is why virtually all companies with world-class software delivery use CI/CD.

As your company grows, you'll hit new bottlenecks from forces both outside (more users, more load) and inside (more products, more teams). To handle these demands, you need to learn how to work with multiple environments and multiple teams, which is the focus of Chapter 6.

---

**Previous:** [Link](/code-cicd/ch04-version-build-test) | **Next:** [Link](/code-cicd/ch06-multiple-services)
