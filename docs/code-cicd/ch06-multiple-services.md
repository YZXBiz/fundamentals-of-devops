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

## 1. Introduction: The Scale Problem

In Chapter 5, you learned how to set up CI/CD to allow developers to work together efficiently and safely.

This will get you pretty far, but as your company grows, you'll start to hit problems that cannot be solved by CI/CD alone.

**External pressure:**
- More users
- More traffic
- More data
- More regulations

**Internal pressure:**
- More developers
- More teams
- More products

The common approach to solve these scale problems is **divide and conquer**.

### 1.1. Two Strategies for Scaling

1. **Break up your deployments** - Deploy into multiple separate, isolated environments
2. **Break up your codebase** - Split into multiple libraries and/or services

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

## 2. Breaking Up Your Deployments

### 2.1. Introduction

**In plain English:** Breaking up deployments is like having separate kitchens for testing recipes, catering events, and running a restaurant. Each serves a different purpose.

**In technical terms:** Throughout this book, you've deployed everything into a single AWS account. In the real world, companies deploy into multiple deployment environments, each with isolated infrastructure.

**Why it matters:** Multiple environments allow you to test changes before exposing them to users, isolate teams from each other, and comply with regulations.

### 2.2. Why Deploy Across Multiple Environments

#### 2.2.1. Reason 1: Isolating Tests

**In plain English:** You wouldn't test a new recipe on restaurant customers. You test it in a separate kitchen first.

**How it works:**
- Test changes before exposing to users
- Limit blast radius if something goes wrong
- Common setup: **dev, stage, prod**

**Environment breakdown:**
- **Production** - Exposed to users
- **Staging** - Identical to prod (scaled down), employees test here
- **Development** - Dev team tests during development

> **Key Takeaway 1**
>
> Breaking your deployment into multiple environments allows you to isolate tests from production and to isolate teams from one another.

#### 2.2.2. Reason 2: Isolating Products and Teams

**In plain English:** Different teams have different needs. The experimental AI team shouldn't be able to accidentally break the billing system.

**In technical terms:** Different teams have different requirements:
- Security policies
- Compliance needs
- Uptime requirements
- Deployment frequency
- Risk tolerance

**Example:** `search-dev`, `search-stage`, `search-prod` for search team

**Benefits:**
- Limits blast radius
- Allows customization per team
- Teams can move independently

#### 2.2.3. Reason 3: Reducing Latency

**In plain English:** Speed of light is too slow for global apps!

**Why it matters:** Deploy close to users geographically to reduce latency.

**Latency comparison:**

| Operation | Latency |
|-----------|---------|
| CPU cache read | 1 ns |
| RAM read | 100 ns |
| TCP within data center | 500,000 ns (0.5 ms) |
| TCP California ↔ New York | 40,000,000 ns (40 ms) |
| TCP California ↔ Australia | 183,000,000 ns (183 ms) |

> **Insight**
>
> If your users are in Australia and your servers are in California, every request takes 183 milliseconds *just for the network*. That's before any actual work happens!

#### 2.2.4. Reason 4: Complying with Laws and Regulations

**In plain English:** Some laws require data to stay in specific countries. You need separate environments to comply.

**Common regulations:**
- **PCI DSS** - Credit card data
- **HIPAA** - Healthcare data
- **FedRAMP** - US government data
- **GDPR** - EU data residency requirements

#### 2.2.5. Reason 5: Increasing Resiliency

**In plain English:** Don't put all your eggs in one basket. If one data center goes down, others keep running.

**In technical terms:** Single data center = single point of failure

**Solution:** Deploy to multiple regions:
- `prod-us`
- `prod-eu`
- `prod-asia`

### 2.3. How to Set Up Multiple Environments

Options range from least to most isolated/resilient (and least to most overhead):

1. **Logical environments** - Software-defined (e.g., Kubernetes namespaces)
2. **Separate servers** - Different clusters for dev, stage, prod
3. **Separate networks** - Each environment in isolated network
4. **Separate accounts** - AWS accounts, GCP projects, Azure subscriptions
5. **Separate data centers (same region)** - Multiple DCs on US East Coast
6. **Separate data centers (different regions)** - DCs across continents

**Trade-offs:**
- **Isolation/Resiliency** - Increases going down the list
- **Operational Overhead** - Also increases going down the list

> **Key Takeaway 2**
>
> Breaking your deployment into multiple regions allows you to reduce latency, increase resiliency, and comply with local laws and regulations, but you may have to rework your entire architecture.

### 2.4. Challenges with Multiple Environments

#### 2.4.1. Challenge 1: Increased Operational Overhead

**In plain English:** More environments means more things to manage, monitor, and maintain.

**In technical terms:**
- More servers to maintain
- More accounts to manage
- More data centers to coordinate
- May require architecture changes for geo-distribution

#### 2.4.2. Challenge 2: Increased Data Storage Complexity

**In plain English:** Having multiple databases across the world creates complex problems that don't exist with a single database.

**Problems with multiple databases:**
- **Primary key generation** - No more auto-increment (what if two databases generate ID 42?)
- **Data consistency** - Constraints and transactions become complex
- **Querying and joining** - Can't join data across databases in different regions

**Options:**

**Active/standby approach:**
- Only one data center serves live traffic
- Others are backups
- Simpler, but doesn't reduce latency

**Active/active approach:**
- All data centers serve traffic simultaneously
- Reduces latency globally
- Requires architectural rework (distributed databases, eventual consistency)

#### 2.4.3. Challenge 3: Increased Configuration Complexity

**In plain English:** Different environments need different settings. Managing these differences is a major source of bugs.

**In technical terms:** Different settings per environment:
- CPU and memory allocation
- Secrets and credentials
- Networking configuration
- Feature toggles
- Service endpoints

> **Key Takeaway 3**
>
> Configuration changes are just as likely to cause outages as code changes.

**Startling statistic:** Configuration changes cause 31% of Google's outages!

#### 2.4.4. Managing Configuration

**Build-time configuration (Recommended):**
- Config files in version control
- Formats: JSON, YAML, Cue, Jsonnet
- Benefits: Version controlled, code reviewed, tested

**Runtime configuration:**
- Config read from data store
- Tools: Consul, etcd
- Benefits: Dynamic updates without redeployment

> **Insight**
>
> Use build-time config when possible. It's version controlled, code reviewed, and tested just like your code. Runtime config should be reserved for values that truly need to change dynamically.

### 2.5. Example: Multiple AWS Accounts

#### 2.5.1. AWS Multi-Account Strategy

**In plain English:** AWS recommends creating separate accounts for dev, stage, and prod instead of using a single account for everything.

**In technical terms:** AWS recommends a **multi-account strategy** using AWS Organizations.

**Why it matters:** Isolation by default is safer than trying to achieve isolation through IAM policies in a single account.

#### 2.5.2. Create Child Accounts with OpenTofu

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

**Benefits:**
- Isolation by default (safer than single-account IAM complexity)
- Centralized management and billing
- Recommended by AWS

#### 2.5.3. Accessing Child Accounts

**Option 1: AWS IAM Identity Center**
- Central place to manage access
- Single sign-on across accounts

**Option 2: AWS CLI profiles**
- Create IAM roles in child accounts
- Assume roles from root account
- Set `AWS_PROFILE` to deploy to each account

## 3. Breaking Up Your Codebase

### 3.1. Introduction

**In plain English:** Breaking up your codebase is like splitting a massive encyclopedia into separate volumes. Each volume is easier to understand and maintain.

**In technical terms:** As codebases grow, they become increasingly difficult to understand, maintain, and scale. Breaking them into smaller pieces helps manage complexity.

**Why it matters:** At a certain scale, a monolithic codebase becomes a bottleneck. Breaking it up can accelerate development.

### 3.2. Why Break Up Your Codebase

#### 3.2.1. Reason 1: Managing Complexity

**In plain English:** Your brain can only hold so much. Once a codebase gets big enough, no one can understand all of it.

**In technical terms:** Bug density increases with codebase size.

**Bug density by project size:**

| Project Size | Bugs per 1K Lines |
|--------------|-------------------|
| \< 2K lines | 0-25 |
| 64K-512K lines | 2-70 |
| \> 512K lines | 4-100 |

> Managing complexity is "the most important technical topic in software development."
>
> — Steve McConnell, *Code Complete*

#### 3.2.2. Reason 2: Isolating Products and Teams

**In plain English:** If everyone works in one codebase, one team's problems become everyone's problems.

**In technical terms:** Different teams have different practices:
- Design philosophies
- Testing strategies
- Deployment frequency
- Risk tolerance

**With a single codebase:**
- One team's bugs affect everyone
- Everyone must agree on standards
- Slowest team sets the pace

**With separate codebases:**
- Teams work independently
- Integrate via well-defined APIs
- Each team can move at their own pace

#### 3.2.3. Reason 3: Handling Different Scaling Requirements

**In plain English:** One feature might need many small servers, while another needs one giant server. Hard to satisfy both with a single deployment.

**In technical terms:** Different features have different resource needs:
- Feature A needs many CPUs across servers
- Feature B needs lots of RAM on single server
- Difficult to meet conflicting requirements in single deployment

#### 3.2.4. Reason 4: Using Different Programming Languages

**In plain English:** Different problems are best solved with different tools.

**In technical terms:** Reasons for multiple languages:
- Different developers prefer different languages
- Acquisitions may bring different languages
- Some languages better fit certain tasks (e.g., Python for ML, Go for infrastructure)

### 3.3. How to Break Up Your Codebase

#### 3.3.1. Option 1: Split into Multiple Libraries

**In plain English:** Libraries are like LEGO sets. Each set is separate, but you can combine them to build something bigger.

**In technical terms:**
- Depend on versioned artifacts (not source code)
- Examples: JAR (Java), Gem (Ruby), npm module (JavaScript)
- Allows focusing on one small part at a time
- Teams develop independently, users pull in new versions when ready

> **Key Takeaway 4**
>
> Breaking your codebase into libraries allows developers to focus on smaller parts of the codebase at a time.

**Best Practices:**

**Semantic versioning:** `MAJOR.MINOR.PATCH`
- **MAJOR** - Incompatible API changes
- **MINOR** - Backward-compatible functionality
- **PATCH** - Backward-compatible bug fixes

**Automatic updates:**
- Use Dependabot, Renovate, or Patcher
- Automatically create PRs when dependencies update
- Keep dependencies current with less manual work

#### 3.3.2. Option 2: Split into Multiple Services

**In plain English:** Services are like separate restaurants in a food court. Each restaurant operates independently, but they're all in the same ecosystem.

**In technical terms:**
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
- **Isolating teams** - Each team owns a service
- **Multiple languages** - Use best language for each problem
- **Independent scaling** - Scale each service differently

> **Key Takeaway 5**
>
> Breaking your codebase into services allows different teams to own, develop, and scale each part independently.

### 3.4. Challenges with Breaking Up Your Codebase

#### 3.4.1. Challenge 1: Managing Multiple Codebases

**In plain English:** Renaming a function in one big codebase is easy. Renaming it across 50 separate libraries is a nightmare.

**In technical terms:** Public API changes become harder:
- Need to maintain backward compatibility
- Version management becomes critical
- Must support old versions while rolling out new ones

**Examples:**
- **Monolith:** Rename function → Run tests → Done
- **Library:** Rename function → Publish new version → Update all consumers → Support both old and new versions → Deprecate old version → Wait for all consumers to migrate → Remove old version (weeks/months)
- **Service:** Rename API endpoint → May need to support old endpoint forever!

#### 3.4.2. Challenge 2: Global Changes

**In plain English:** Changes that touch multiple parts of your system go from "change one file" to "coordinate 50 teams over 6 months."

**In technical terms:** Changes requiring updates to multiple libraries/services are much harder.

**Example:** Security vulnerability in shared library
- **Monolith:** Fix library → Run tests → Deploy (1 hour)
- **Microservices:** Fix library → Publish new version → Update 50 services → Coordinate with 50 teams → Test each service → Deploy each service (weeks)

> **Key Takeaway 6**
>
> When you split up a codebase, you optimize for making changes faster within each part. However, this comes at the cost of taking longer to make and integrate changes across the entire codebase.

#### 3.4.3. When to Split Your Codebase

**Don't split too early!**

Start with a monolith. Let it grow. Split only when seams are obvious.

**Look for patterns in mature codebases:**
- Files that change together
- Files that teams focus on
- Parts that could be open source
- Performance bottlenecks

> **Insight**
>
> Many tiny startups launching with 12 microservices find that every change requires updating 7 services. Meanwhile, the startup built on Rails is shipping 10x faster. Only split when the pain of the monolith clearly exceeds the cost of splitting.

#### 3.4.4. Challenge 3: Integration Challenges

**In plain English:** Splitting a codebase is like choosing to have each team work on separate islands instead of the same office. Communication becomes harder.

**In technical terms:** Splitting codebase is opposite of continuous integration.
- Essentially doing **late integration** between parts
- **Dependency hell** problems:
  - Too many dependencies
  - Long dependency chains
  - Diamond dependencies (A depends on B and C, B and C depend on different versions of D)

> **Key Takeaway 7**
>
> Splitting a codebase means choosing late integration instead of continuous integration between parts, so do it only when parts are truly independent.

#### 3.4.5. Challenge 4: Managing Multiple Services

**Deployment ordering:**
- Service A depends on B
- B depends on C
- Must deploy in correct order
- **Solution:** Use feature flags to allow any-order deployment

**Debugging overhead:**
- Which service has the bug?
- How to trace requests across services?
- Need distributed tracing tools

**Infrastructure overhead:**
- Need orchestration (Kubernetes)
- Need service mesh (Istio)
- Need streaming (Kafka)
- Need tracing (Jaeger)

**Performance overhead:**
- Network calls are 5,000x slower than memory access!
- Function call: 1 nanosecond
- Network call within data center: 500,000 nanoseconds

**Distributed system complexities:**
- New failure modes
- Network partitions
- Eventual consistency
- Data synchronization

> **Key Takeaway 8**
>
> Splitting a codebase has considerable cost. Do it only when benefits outweigh costs, which typically happens only at larger scale.

## 4. Example: Deploy Microservices

### 4.1. Introduction

**In plain English:** Let's take the Node.js sample app and split it into two services: a backend and a frontend.

**In technical terms:** You'll convert the Node.js sample app into two microservices deployed in Kubernetes.

**Why it matters:** This demonstrates the patterns for building, deploying, and connecting microservices.

### 4.2. Backend Sample App

#### 4.2.1. Create Backend Application

Create `sample-app-backend/app.js`:

```javascript
app.get('/', (req, res) => {
  res.json({text: "backend microservice"});
});
```

**What this does:**
- Responds with JSON instead of HTML
- Returns an object with a `text` field
- This is the API the frontend will call

#### 4.2.2. Create Backend Kubernetes Service

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

**Key property:** `type: ClusterIP`

**In plain English:** This makes the service accessible only within the Kubernetes cluster, not from the internet.

**Why it matters:** The backend doesn't need to be exposed to users. Only the frontend talks to it.

#### 4.2.3. Build and Deploy Backend

```bash
npm run dockerize
kubectl apply -f sample-app-deployment.yml
kubectl apply -f sample-app-service.yml
```

### 4.3. Frontend Sample App

#### 4.3.1. Create Frontend Application

Create `sample-app-frontend/app.js`:

```javascript
const backendHost = 'http://sample-app-backend-service'; // Service discovery via DNS

app.get('/', async (req, res) => {
  const response = await fetch(backendHost);
  const responseBody = await response.json();
  res.render('hello', {name: responseBody.text});
});
```

**Key line:** `const backendHost = 'http://sample-app-backend-service';`

**In plain English:** The frontend calls the backend using just the service name, not an IP address.

**How it works:** Kubernetes creates a DNS entry for each Service. Requests to `sample-app-backend-service` automatically route to that Service.

**Why it matters:** No hardcoded IPs needed. Kubernetes handles service discovery automatically.

#### 4.3.2. Create Frontend Kubernetes Service

Create `sample-app-frontend/sample-app-service.yml`:

```yaml
metadata:
  name: sample-app-frontend-loadbalancer
spec:
  type: LoadBalancer  # Accessible from outside
  selector:
    app: sample-app-frontend-pods
```

**Key property:** `type: LoadBalancer`

**In plain English:** This exposes the service to the internet via a load balancer.

**Why it matters:** Users need to access the frontend from their browsers.

#### 4.3.3. Build and Deploy Frontend

```bash
npm run dockerize
kubectl apply -f sample-app-deployment.yml
kubectl apply -f sample-app-service.yml
```

### 4.4. Test the Microservices

Visit `http://localhost` to see the frontend calling the backend!

**What happens:**
1. Your browser calls the frontend service
2. The frontend calls the backend service (within Kubernetes)
3. The backend returns JSON
4. The frontend renders HTML using that JSON
5. You see the result in your browser

> **Insight**
>
> Service Discovery in Kubernetes: Kubernetes creates DNS entry for each Service. Requests to `http://sample-app-backend-service` automatically route to that Service. No hardcoded IPs needed.

## 5. Conclusion

### 5.1. Eight Key Takeaways

You've learned how to address scale problems through eight key takeaways:

1. Break deployments into environments to isolate tests and teams
2. Multiple regions reduce latency and increase resiliency, but may require architectural rework
3. Configuration changes are as likely as code changes to cause outages
4. Breaking into libraries lets developers focus on smaller parts
5. Breaking into services lets teams own, develop, and scale independently
6. Splitting optimizes for within-codebase changes, but slows cross-codebase changes
7. Splitting means choosing late integration, so only split truly independent parts
8. Splitting has considerable cost—do it only at larger scale when benefits outweigh costs

### 5.2. The Monolith vs. Microservices Decision

**In plain English:** Start simple. Split only when you must.

**The key insight:**

Many tiny startups launch with 12 microservices.

They find that every change requires updating 7 services.

Meanwhile, the startup built on Rails is shipping 10x faster.

The Rails startup grows to 50 developers before hitting monolith pain.

Only then do they start splitting into services, based on clear organizational boundaries.

> **Warning**
>
> Microservices are a solution to an organizational problem, not a technical one. If you don't have multiple teams, you probably don't need microservices.

### 5.3. When to Split

**Good reasons to split:**
- Clear organizational boundaries (different teams own different parts)
- Different scaling requirements (one part needs 100x more resources)
- Different deployment frequencies (one team deploys 10x/day, another 1x/month)
- Mature codebase with obvious seams

**Bad reasons to split:**
- "Microservices are cool"
- "Everyone else is doing it"
- "The monolith is messy" (splitting won't fix mess, it'll just distribute it)
- Before you understand your domain

### 5.4. What's Next

Networking plays a key role in how services communicate and how you define environments.

In Chapter 7, you'll learn how to set up your network for:
- Extra layers of protection
- Service discovery
- Debugging
- Performance optimization
- Security hardening

---

**Previous:** [Link](/code-cicd/ch05-continuous-deployment) | **Next:** [Link](/operations-architecture/ch07-networking)
