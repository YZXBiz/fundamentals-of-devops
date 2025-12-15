---
sidebar_position: 4
title: "Multiple Services"
description: "Learn how to scale your software delivery by breaking deployments into multiple environments and codebases into multiple services or microservices."
---

import { StackDiagram, ConnectionDiagram, CardGrid, colors } from '@site/src/components/diagrams';

# Chapter 6. How to Work with Multiple Teams and Environments

## Table of Contents

1. [Breaking Up Your Deployments](#breaking-up-your-deployments)
2. [Breaking Up Your Codebase](#breaking-up-your-codebase)
3. [Example: Deploy Microservices](#example-deploy-microservices)
4. [Conclusion](#conclusion)

In Chapter 5, you learned how to set up CI/CD to allow developers to work together efficiently and safely. This will get you pretty far, but as your company grows, you'll start to hit problems that cannot be solved by CI/CD alone:

- **External pressure**: More users, more traffic, more data, more regulations
- **Internal pressure**: More developers, more teams, more products

The common approach to solve these scale problems is **divide and conquer**:

1. **Break up your deployments**: Deploy into multiple separate, isolated environments
2. **Break up your codebase**: Split into multiple libraries and/or services

<StackDiagram
  title="Multiple Deployment Environments"
  layers={[
    {
      name: "Production",
      color: colors.red,
      description: "Live environment for users"
    },
    {
      name: "Staging",
      color: colors.orange,
      description: "Pre-production testing environment"
    },
    {
      name: "Development",
      color: colors.green,
      description: "Dev team testing environment"
    }
  ]}
/>

## Breaking Up Your Deployments

Throughout this book, you've deployed everything into a single AWS account. In the real world, companies deploy into multiple deployment environments, each with isolated infrastructure.

### Why Deploy Across Multiple Environments

**1. Isolating Tests**
- Test changes before exposing to users
- Limit blast radius if something goes wrong
- Common setup: **dev, stage, prod**
  - **Production**: Exposed to users
  - **Staging**: Identical to prod (scaled down), employees test here
  - **Development**: Dev team tests during development

**2. Isolating Products and Teams**
- Different teams have different requirements (security, compliance, uptime, deployment frequency)
- Example: `search-dev`, `search-stage`, `search-prod` for search team
- Limits blast radius, allows customization

:::tip Key Takeaway 1
Breaking your deployment into multiple environments allows you to isolate tests from production and to isolate teams from one another.
:::

**3. Reducing Latency**
- Deploy close to users geographically
- Speed of light is too slow for global apps!

| Operation | Latency |
|-----------|---------|
| CPU cache read | 1 ns |
| RAM read | 100 ns |
| TCP within data center | 500,000 ns (0.5 ms) |
| TCP California ↔ New York | 40,000,000 ns (40 ms) |
| TCP California ↔ Australia | 183,000,000 ns (183 ms) |

**4. Complying with Laws and Regulations**
- PCI DSS (credit cards)
- HIPAA (healthcare)
- FedRAMP (US government)
- GDPR (EU data residency)

**5. Increasing Resiliency**
- Single data center = single point of failure
- Deploy to multiple regions: `prod-us`, `prod-eu`, etc.

### How to Set Up Multiple Environments

Options range from least to most isolated/resilient (and least to most overhead):

1. **Logical environments**: Software-defined (e.g., Kubernetes namespaces)
2. **Separate servers**: Different clusters for dev, stage, prod
3. **Separate networks**: Each environment in isolated network
4. **Separate accounts**: AWS accounts, GCP projects, Azure subscriptions
5. **Separate data centers (same region)**: Multiple DCs on US East Coast
6. **Separate data centers (different regions)**: DCs across continents

Trade-offs:
- **Isolation/Resiliency**: Increases going down the list
- **Operational Overhead**: Also increases going down the list

:::tip Key Takeaway 2
Breaking your deployment into multiple regions allows you to reduce latency, increase resiliency, and comply with local laws and regulations, but you may have to rework your entire architecture.
:::

### Challenges with Multiple Environments

**1. Increased Operational Overhead**
- More servers, accounts, data centers to manage
- May require architecture changes for geo-distribution

**2. Increased Data Storage Complexity**
- Multiple databases across regions
- Problems with:
  - Primary key generation (no more auto-increment)
  - Data consistency (constraints, transactions)
  - Querying and joining
- Options:
  - **Active/standby**: Only one data center serves live traffic
  - **Active/active**: All data centers serve traffic (requires architectural rework)

**3. Increased Configuration Complexity**
- Different settings per environment (CPU, memory, secrets, networking, features)
- Configuration changes cause 31% of Google's outages!

:::tip Key Takeaway 3
Configuration changes are just as likely to cause outages as code changes.
:::

**Managing Configuration:**
- **Build time**: Config files in version control (JSON, YAML, Cue, Jsonnet)
- **Runtime**: Config read from data store (Consul, etcd)
- **Recommendation**: Use build-time config when possible (version controlled, code reviewed, tested)

### Example: Multiple AWS Accounts

AWS recommends a **multi-account strategy** using AWS Organizations:

```hcl
// Create child accounts
module "child_accounts" {
  source = "brikis98/devops/book//modules/aws-organizations"

  create_organization = true

  accounts = {
    development = "username+dev@email.com"
    staging     = "username+stage@email.com"
    production  = "username+prod@email.com"
  }
}
```

Benefits:
- Isolation by default (safer than single-account IAM complexity)
- Centralized management and billing
- Recommended by AWS

**Accessing Child Accounts:**
- Use AWS IAM Identity Center
- Or create AWS CLI profiles to assume IAM roles
- Deploy to each account by setting `AWS_PROFILE`

## Breaking Up Your Codebase

### Why Break Up Your Codebase

**1. Managing Complexity**
- Once codebase gets big enough, no one can understand all of it
- Bug density increases with size:

| Project Size | Bugs per 1K Lines |
|--------------|-------------------|
| \< 2K lines | 0-25 |
| 64K-512K lines | 2-70 |
| \> 512K lines | 4-100 |

> Managing complexity is "the most important technical topic in software development."
> — Steve McConnell, *Code Complete*

**2. Isolating Products and Teams**
- Different teams have different practices (design, testing, deployment frequency, risk tolerance)
- Single codebase = one team's problems affect everyone
- Separate codebases = teams work independently, integrate via APIs

**3. Handling Different Scaling Requirements**
- One feature needs many CPUs across servers
- Another needs lots of RAM on single server
- Difficult to meet conflicting requirements in single deployment

**4. Using Different Programming Languages**
- Different developers prefer different languages
- Acquisitions may bring different languages
- Some languages better fit certain tasks

### How to Break Up Your Codebase

**1. Split into Multiple Libraries**
- Depend on versioned artifacts (not source code)
- Examples: JAR (Java), Gem (Ruby), npm module (JavaScript)
- Allows focusing on one small part at a time
- Teams develop independently, users pull in new versions when ready

:::tip Key Takeaway 4
Breaking your codebase into libraries allows developers to focus on smaller parts of the codebase at a time.
:::

**Best Practices:**
- **Semantic versioning**: `MAJOR.MINOR.PATCH`
  - MAJOR: Incompatible API changes
  - MINOR: Backward-compatible functionality
  - PATCH: Backward-compatible bug fixes
- **Automatic updates**: Use Dependabot, Renovate, or Patcher

**2. Split into Multiple Services**
- Each service runs in separate process
- Communicate via network messages (not function calls)
- Examples: SOA, microservices, event-driven architecture

<ConnectionDiagram
  title="Microservices Architecture"
  nodes={[
    { id: "frontend", label: "Frontend Service", color: colors.blue },
    { id: "backend", label: "Backend Service", color: colors.green },
    { id: "db", label: "Database", color: colors.purple }
  ]}
  connections={[
    { from: "frontend", to: "backend", label: "HTTP/JSON" },
    { from: "backend", to: "db", label: "SQL" }
  ]}
/>

**Advantages:**
- **Isolating teams**: Each team owns a service
- **Multiple languages**: Use best language for each problem
- **Independent scaling**: Scale each service differently

:::tip Key Takeaway 5
Breaking your codebase into services allows different teams to own, develop, and scale each part independently.
:::

### Challenges with Breaking Up Your Codebase

**1. Managing Multiple Codebases**
- Public API changes become harder (backward compatibility)
- Renaming a function in monolith: Easy
- Renaming in library: Complex versioning process
- Renaming in service: May take weeks/months, support old version forever

**2. Global Changes**
- Changes requiring updates to multiple libraries/services are much harder
- Example: Security vulnerability in shared library needs updating dozens of services
- Takes weeks vs. single commit in monolith

:::tip Key Takeaway 6
When you split up a codebase, you optimize for making changes faster within each part. However, this comes at the cost of taking longer to make and integrate changes across the entire codebase.
:::

**When to Split:**
Look for patterns in mature codebases:
- Files that change together
- Files that teams focus on
- Parts that could be open source
- Performance bottlenecks

**Don't split too early!** Start with monolith, grow it, split only when seams are obvious.

**3. Integration Challenges**
- Splitting codebase is opposite of continuous integration
- Essentially doing **late integration** between parts
- **Dependency hell**: Too many dependencies, long chains, diamond dependencies

:::tip Key Takeaway 7
Splitting a codebase means choosing late integration instead of continuous integration between parts, so do it only when parts are truly independent.
:::

**4. Managing Multiple Services**
- **Deployment ordering**: Service A depends on B, B on C...
  - Solution: Use feature flags to allow any-order deployment
- **Debugging overhead**: Which service has the bug? How to trace across services?
- **Infrastructure overhead**: Need orchestration (Kubernetes), service mesh (Istio), streaming (Kafka), tracing (Jaeger)
- **Performance overhead**: Network calls are 5,000x slower than memory access!
- **Distributed system complexities**: New failure modes, I/O complexity

:::tip Key Takeaway 8
Splitting a codebase has considerable cost. Do it only when benefits outweigh costs, which typically happens only at larger scale.
:::

## Example: Deploy Microservices

Let's convert the Node.js sample app into two microservices deployed in Kubernetes:

### Backend Sample App

Create `sample-app-backend/app.js`:

```javascript
app.get('/', (req, res) => {
  res.json({text: "backend microservice"});
});
```

Create `sample-app-backend/sample-app-service.yml`:

```yaml
metadata:
  name: sample-app-backend-service
spec:
  type: ClusterIP  # Only accessible within cluster
  selector:
    app: sample-app-backend-pods
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```

Build and deploy:

```bash
npm run dockerize
kubectl apply -f sample-app-deployment.yml
kubectl apply -f sample-app-service.yml
```

### Frontend Sample App

Create `sample-app-frontend/app.js`:

```javascript
const backendHost = 'http://sample-app-backend-service'; // Service discovery via DNS

app.get('/', async (req, res) => {
  const response = await fetch(backendHost);
  const responseBody = await response.json();
  res.render('hello', {name: responseBody.text});
});
```

Create `sample-app-frontend/sample-app-service.yml`:

```yaml
metadata:
  name: sample-app-frontend-loadbalancer
spec:
  type: LoadBalancer  # Accessible from outside
  selector:
    app: sample-app-frontend-pods
```

Build and deploy:

```bash
npm run dockerize
kubectl apply -f sample-app-deployment.yml
kubectl apply -f sample-app-service.yml
```

Visit `http://localhost` to see the frontend calling the backend!

**Service Discovery in Kubernetes:**
- Kubernetes creates DNS entry for each Service
- Requests to `http://sample-app-backend-service` automatically route to that Service
- No hardcoded IPs needed

## Conclusion

You've learned how to address scale problems through eight key takeaways:

1. Break deployments into environments to isolate tests and teams
2. Multiple regions reduce latency and increase resiliency, but may require architectural rework
3. Configuration changes are as likely as code changes to cause outages
4. Breaking into libraries lets developers focus on smaller parts
5. Breaking into services lets teams own, develop, and scale independently
6. Splitting optimizes for within-codebase changes, but slows cross-codebase changes
7. Splitting means choosing late integration, so only split truly independent parts
8. Splitting has considerable cost—do it only at larger scale when benefits outweigh costs

**Key Insight**: Start with a monolith. Many tiny startups launching with 12 microservices find that every change requires updating 7 services. Meanwhile, the startup built on Rails is shipping 10x faster. Only split when the pain of the monolith clearly exceeds the cost of splitting.

Networking plays a key role in how services communicate and how you define environments. In Chapter 7, you'll learn how to set up your network for extra layers of protection, service discovery, debugging, and more.

---

**Previous:** [Link](/code-cicd/ch05-continuous-deployment) | **Next:** [Link](/operations-architecture/ch07-networking)
