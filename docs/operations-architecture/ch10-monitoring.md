---
sidebar_position: 5
title: "Chapter 10: How to Monitor Your Systems"
description: "Learn how to monitor your systems using logs, metrics, events, and alerts. Understand observability, distributed tracing, and incident response to keep your applications running smoothly."
---

import { ProcessFlow, StackDiagram, CardGrid, ComparisonTable, TreeDiagram, colors } from '@site/src/components/diagrams';

# Chapter 10. How to Monitor Your Systems

In Chapter 9, you learned how to store, query, replicate, and back up your data. That chapter focused primarily on data about your customers, such as user profiles, purchases, and photos. This chapter focuses primarily on data that gives you visibility into your business, or what is typically referred to as **monitoring**.

At LinkedIn, we struggled with monitoring early on. We collected metrics and logs, but the tools to understand that data were unusable, so we were often flying blind, and bugs and outages could go unnoticed. In 2010, an intern created inGraphs, a UI for visualizing our metrics. It had a profound impact on the company, as suddenly we could spot problems earlier and understand what users were doing. We overhauled monitoring even more as part of Project Inversion, and before long, inGraphs was on screens all over the office. As David Henke, LinkedIn's senior vice president of engineering and operations, liked to say: **if you can't measure it, you can't fix it.**

## Table of Contents

1. [Logs](#logs)
   - [Log Levels](#log-levels)
   - [Log Formatting](#log-formatting)
   - [Structured Logging](#structured-logging)
   - [Log Files and Rotation](#log-files-and-rotation)
   - [Log Aggregation](#log-aggregation)
2. [Metrics](#metrics)
   - [Types of Metrics](#types-of-metrics)
   - [Using Metrics](#using-metrics)
   - [Example: Metrics in CloudWatch](#example-metrics-in-cloudwatch)
3. [Events](#events)
   - [Observability](#observability)
   - [Tracing](#tracing)
   - [Testing in Production](#testing-in-production-tip)
4. [Alerts](#alerts)
   - [Triggers](#triggers)
   - [Notifications](#notifications)
   - [On Call](#on-call)
   - [Incident Response](#incident-response)
   - [Example: Alerts in CloudWatch](#example-alerts-in-cloudwatch)

## Logs

Almost every piece of software writes logs, which are records of what's happening in that software (e.g., interesting events, errors, debugging information). Interactive CLI tools typically write log messages to the terminal (stdout and stderr); other software typically writes log messages to files.

Logs are useful for:

- **Debugging problems**: Find events that led to errors, including stack traces showing exact lines of code
- **Analyzing your software**: Gain insights about user behavior, performance bottlenecks
- **Auditing your software**: Provide an audit trail for compliance and security investigations

:::tip Key Takeaway #1
Add logging throughout your code to give you visibility into what's happening in your systems.
:::

Instead of `console.log`, you should use a dedicated logging library (Log4j, winston, etc.) to get:

- Log levels
- Log formatting
- Structured logging
- Log files and rotation
- Log aggregation

<ProcessFlow
  title="Effective Logging Pipeline"
  description="How to implement comprehensive logging in your applications"
  steps={[
    {
      name: 'Instrument Code',
      description: 'Add logging throughout application',
      example: 'Use winston, Log4j, or similar',
      color: colors.blue
    },
    {
      name: 'Set Log Levels',
      description: 'Control verbosity',
      example: 'Trace, Debug, Info, Warn, Error, Fatal',
      color: colors.green
    },
    {
      name: 'Format Output',
      description: 'Standardize log messages',
      example: 'Timestamp, IP, method, level, message',
      color: colors.purple
    },
    {
      name: 'Structured Logging',
      description: 'Use JSON format',
      example: 'Machine-readable key-value pairs',
      color: colors.yellow
    },
    {
      name: 'Rotate Files',
      description: 'Manage disk space',
      example: 'Max size 10MB, keep 10 files',
      color: colors.orange
    },
    {
      name: 'Aggregate Logs',
      description: 'Central collection',
      example: 'CloudWatch, Elasticsearch, Splunk',
      color: colors.red
    }
  ]}
/>

### Log Levels

Most logging libraries support multiple log levels to specify severity:

**Standard Log Levels**

| Level | Purpose | Example |
|-------|---------|---------|
| Trace | Detailed, fine-grained execution path | Log entry point of every function |
| Debug | Diagnostic information for troubleshooting | Log contents of data structures |
| Info | Important information for every user/request | Log successful purchase completion |
| Warn | Unexpected problems without failure | Log missing data with fallback available |
| Error | Errors causing partial failure | Log missing data breaking a feature |
| Fatal | Errors causing complete failure | Log database completely down |

```javascript
const logger = winston.createLogger({
  level: 'info',  // Only log messages at 'info' level and above
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

logger.debug('A message at debug level');  // Won't appear (below 'info')
logger.info('A message at info level');    // Appears
logger.error('A message at error level');  // Appears
```

Log levels allow you to:

- Add verbose trace/debug logging without making production logs too noisy
- Temporarily lower log levels in production while troubleshooting
- Easily scan logs visually or with tools like grep

### Log Formatting

Logging libraries allow you to define standard formats for all messages:

```javascript
const logger = winston.createLogger({
  level: 'info',
  defaultMeta: req,  // Request object with IP, method, path
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({timestamp, ip, method, path, level, message}) =>
      `${timestamp} ${ip} ${method} ${path} [${level}]: ${message}`
    )
  ),
  transports: [new winston.transports.Console()]
});
```

Output:

```
2024-10-05T20:17:49.332Z 1.2.3.4 GET /foo [info]: A message at info level
2024-10-05T20:17:49.332Z 1.2.3.4 GET /foo [warn]: A message at warn level
2024-10-05T20:17:49.332Z 1.2.3.4 GET /foo [error]: A message at error level
```

Using log formatting ensures standardized patterns, making logs easier to read and parse. Each log message becomes a self-contained story with contextual metadata.

### Structured Logging

Instead of arbitrary text strings, structured logging outputs logs in well-defined data formats like JSON:

```javascript
const logger = winston.createLogger({
  level: 'info',
  defaultMeta: req,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.label({label: name}),
    winston.format.json()  // JSON format instead of custom printf
  ),
  transports: [new winston.transports.Console()]
});

loggerA.info({
  request_id: req.id,
  user_id: user.id,
  action: "complete-purchase",
  product_id: product.id,
  product_price: product.price,
  message: `User bought ${product.name}`
});
```

Output (reformatted for readability):

```json
{
  "action":"complete-purchase",
  "id":"53ebcb5a-038d-4e6a-a171-7132000c68fd",
  "ip":"1.2.3.4",
  "label":"A",
  "level":"info",
  "message":"User bought Fundamentals of DevOps",
  "method":"GET",
  "path":"/foo",
  "product_id":1098174593,
  "product_price":"$54.99",
  "request_id":"53ebcb5a-038d-4e6a-a171-7132000c68fd",
  "timestamp":"2024-10-05T20:21:49.231Z",
  "user_id":53345644345655
}
```

Advantages of structured logging:

- Both human-readable and machine-readable
- Easier to parse, search, filter, and analyze
- Shift from logging strings to logging key-value pairs with context

### Log Files and Rotation

When your code runs in production without you watching, capture log output and store it in files so you can review history anytime.

```javascript
const logger = winston.createLogger({
  // ... other config ...
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: `module${name}.log`,
      maxsize: 10000000,      // Rotate at 10MB
      maxFiles: 10,           // Keep max 10 files
      zippedArchive: true     // Compress old files
    })
  ]
});
```

Log rotation prevents files from becoming too large and ensures you don't run out of disk space. Tools like `logrotate` or built-in library features handle:

- Renaming files when size/age limits are hit
- Compressing older log files
- Deleting oldest files when maximum count is reached

### Log Aggregation

When software runs across dozens of servers, finding the right log file becomes a significant challenge. Use log aggregation tools that send logs from all servers to a single, central destination.

<CardGrid
  title="Log Aggregation Tools"
  description="Popular solutions for centralized log collection and analysis"
  cards={[
    {
      title: 'Elasticsearch + Logstash',
      description: 'ELK Stack',
      items: [
        'Powerful search capabilities',
        'Flexible querying with Lucene',
        'Real-time indexing',
        'Kibana for visualization',
        'Self-hosted or managed',
        'Large ecosystem'
      ],
      color: colors.green
    },
    {
      title: 'CloudWatch Logs',
      description: 'AWS native',
      items: [
        'Integrated with AWS services',
        'Auto-aggregation for Lambda',
        'Log groups and streams',
        'Search and filter',
        'Metric filters',
        'Easy setup in AWS'
      ],
      color: colors.orange
    },
    {
      title: 'Splunk',
      description: 'Enterprise platform',
      items: [
        'Comprehensive analytics',
        'Advanced search language',
        'Machine learning features',
        'Compliance reporting',
        'High cost',
        'Enterprise-focused'
      ],
      color: colors.blue
    },
    {
      title: 'Loggly / Sumo Logic',
      description: 'Cloud-based SaaS',
      items: [
        'Fully managed service',
        'No infrastructure to maintain',
        'Real-time analysis',
        'Alerting capabilities',
        'Per-volume pricing',
        'Quick setup'
      ],
      color: colors.purple
    }
  ]}
/>

Log aggregation advantages:

- **Single pane of glass**: Search all logs across all servers in one place
- **Powerful analysis tools**: More than grep - search, filters, historical comparisons
- **Efficient storage**: Specialized tools store log data more efficiently than app servers

:::tip Key Takeaway #2
Use log levels, log formatting, multiple loggers, structured logging, log file rotation, and log aggregation to make your logging more effective.
:::

## Metrics

Metrics are quantitative measurements of important aspects of your software. Collecting, analyzing, and visualizing metrics gives you valuable insights:

- **Detect problems**: Sudden spikes in latency often signal issues
- **Understand user behavior**: Page views, monthly active users (MAU)
- **Improve system performance**: Identify bottlenecks in latency, throughput, resource usage
- **Improve team performance**: Track and improve DORA metrics

Metrics provide continuous feedback enabling continuous improvement, central tenets of DevOps and Agile.

:::tip Key Takeaway #3
Use metrics to detect problems, understand user behavior, improve product and team performance, and more generally, as a mechanism for continuous feedback and improvement.
:::

### Types of Metrics

<TreeDiagram
  title="Categories of Metrics"
  description="Different types of metrics to track in your systems"
  root={{
    label: 'Metrics',
    children: [
      {
        label: 'Availability Metrics',
        description: 'Is the service accessible?',
        children: [
          { label: 'Uptime monitoring (Pingdom, Route 53)' },
          { label: 'Service-level objectives (SLOs)' },
          { label: 'Nines of reliability (99.9%, 99.99%)' }
        ]
      },
      {
        label: 'Business Metrics',
        description: 'What are users doing?',
        children: [
          { label: 'Page views, MAU, sales' },
          { label: 'Google Analytics, Mixpanel' },
          { label: 'A/B testing results' }
        ]
      },
      {
        label: 'Application Metrics',
        description: 'How is the software performing?',
        children: [
          { label: 'Latency, Errors, Traffic, Saturation' },
          { label: 'APM tools (Datadog, New Relic)' },
          { label: 'Client-side RUM tools' }
        ]
      },
      {
        label: 'Server Metrics',
        description: 'How is the hardware performing?',
        children: [
          { label: 'CPU, memory, disk, network usage' },
          { label: 'CloudWatch, Nagios, Zabbix' },
          { label: 'Infrastructure monitoring' }
        ]
      },
      {
        label: 'Team Metrics',
        description: 'How is development going?',
        children: [
          { label: 'DORA metrics' },
          { label: 'Build times, open PRs' },
          { label: 'Jira, Linear, code coverage tools' }
        ]
      }
    ]
  }}
/>

#### The Four Golden Signals (LETS)

A good starting point for application metrics:

<CardGrid
  title="The Four Golden Signals"
  description="Essential application metrics to monitor"
  cards={[
    {
      title: 'Latency',
      description: 'Response time',
      items: [
        'How long to service requests',
        'Early indicator of overload',
        'High latency frustrates users',
        'Track p50, p95, p99',
        'Alert on unusual spikes',
        'Target: < 200ms for web'
      ],
      color: colors.blue
    },
    {
      title: 'Errors',
      description: 'Failure rate',
      items: [
        'Percent of requests that fail',
        'Visible (500s) and hidden (retries)',
        'Track error rates and types',
        'Alert on threshold breaches',
        'Investigate root causes',
        'Target: < 0.1% error rate'
      ],
      color: colors.red
    },
    {
      title: 'Traffic',
      description: 'Demand measure',
      items: [
        'Requests per second (rps/QPS)',
        'Sudden increases = potential overload',
        'Sudden drops = possible outage',
        'Plan capacity based on traffic',
        'Alert on anomalies',
        'Scale resources accordingly'
      ],
      color: colors.green
    },
    {
      title: 'Saturation',
      description: 'Resource utilization',
      items: [
        'CPU, memory, disk usage %',
        '> 90% CPU may cause thrashing',
        '> 90% disk may cause outage',
        'Track all critical resources',
        'Alert before limits hit',
        'Auto-scale based on saturation'
      ],
      color: colors.purple
    }
  ]}
/>

### Using Metrics

To make use of metrics, follow three steps:

<ProcessFlow
  title="Metrics Pipeline"
  description="How to collect, store, and use metrics effectively"
  steps={[
    {
      name: 'Collect Metrics',
      description: 'Instrument your software',
      example: 'Datadog Agent, StatsD, OpenTelemetry',
      color: colors.blue
    },
    {
      name: 'Store Metrics',
      description: 'Persist in metrics backend',
      example: 'Prometheus, OpenTSDB, CloudWatch',
      color: colors.purple
    },
    {
      name: 'Analyze & Visualize',
      description: 'Build dashboards and alerts',
      example: 'Grafana, Kibana, Datadog UI',
      color: colors.green
    }
  ]}
/>

**OpenTelemetry (OTel)** is emerging as the de facto standard for instrumenting code. It's:

- Open source and vendor-neutral
- Supports most major programming languages
- Works with many orchestration tools (Kubernetes, Lambda)
- Compatible with many metrics backends
- Can collect metrics, logs, and traces

### Example: Metrics in CloudWatch

In this example, you'll use Amazon CloudWatch to view metrics for EC2 instances, Auto Scaling Groups, and Application Load Balancers. You'll also deploy Route 53 health checks for availability metrics and create a custom CloudWatch dashboard.

The example demonstrates:

1. **Application metrics**: Request count, response time (average and p99) from the ALB
2. **Server metrics**: CPU utilization, network traffic in/out from EC2 instances
3. **Availability metrics**: Route 53 health checks testing your service from multiple global locations

```hcl
# Route 53 health check
resource "aws_route53_health_check" "example" {
  fqdn              = module.alb.alb_dns_name
  type              = "HTTP"
  request_interval  = "10"
  resource_path     = "/"
  port              = 80
  failure_threshold = 1

  tags = {
    Name = "sample-app-health-check"
  }
}

# CloudWatch dashboard
module "cloudwatch_dashboard" {
  source  = "brikis98/devops/book//modules/cloudwatch-dashboard"
  version = "1.0.0"

  name              = "sample-app-dashboard"
  asg_name          = module.asg.asg_name
  alb_name          = module.alb.alb_name
  alb_arn_suffix    = module.alb.alb_arn_suffix
  health_check_id   = aws_route53_health_check.example.id
}
```

:::tip Key Takeaway #4
Collect multiple types of metrics (availability, business, application, server, team) and build dashboards to focus on the most important metrics to your business.
:::

## Events

In addition to logs and metrics, structured events provide powerful insights:

- Observability
- Tracing
- Testing in production

### Observability

As your architecture becomes more complicated (monolith to microservices, single-node to distributed), you'll encounter:

- More problems you never predicted
- Worse ratio of unpredictable to predictable problems
- Unknown unknowns

**Observability** is the ability to understand any state your software may have gotten itself into by interrogating it with external tools, without shipping new code.

<ProcessFlow
  title="Observability in Action"
  description="Debugging a latency spike using an observability platform"
  steps={[
    {
      name: 'Detect Anomaly',
      description: 'Notice latency spike',
      example: 'Latency heatmap shows sudden increase',
      color: colors.red
    },
    {
      name: 'Select Affected Requests',
      description: 'Highlight spike region',
      example: 'Auto-correlation shows patterns',
      color: colors.yellow
    },
    {
      name: 'Identify Pattern',
      description: 'Find common factor',
      example: 'One HTTP route causing issues',
      color: colors.orange
    },
    {
      name: 'Drill Down',
      description: 'Narrow to specific user',
      example: 'All slow requests from one user ID',
      color: colors.purple
    },
    {
      name: 'Root Cause',
      description: 'Find slow database query',
      example: 'One query exceptionally slow for certain users',
      color: colors.green
    }
  ]}
/>

Structured events contain many dimensions (key-value pairs) with high cardinality (many possible values per dimension). Observability tools (Honeycomb, SigNoz, Uptrace) efficiently store and analyze data with high dimensionality and cardinality, enabling iterative investigation without knowing questions ahead of time.

:::tip Key Takeaway #5
Instrument your code to publish structured events. Use observability tools to understand what your software is doing by performing iterative, ad hoc queries against these structured events.
:::

### Tracing

When a single user request results in dozens of internal requests across many services, understanding the request flow becomes challenging. **Distributed tracing** tracks requests as they flow through a distributed system.

<ProcessFlow
  title="Distributed Tracing"
  description="How requests are tracked through microservices"
  steps={[
    {
      name: 'Assign Trace ID',
      description: 'Initial request gets unique ID',
      example: 'Frontend assigns trace-123',
      color: colors.blue
    },
    {
      name: 'Propagate ID',
      description: 'Pass to all downstream services',
      example: 'Service A → B → C, all tagged trace-123',
      color: colors.purple
    },
    {
      name: 'Publish Events',
      description: 'Each service logs trace ID + metadata',
      example: 'Timestamp, duration, service name',
      color: colors.yellow
    },
    {
      name: 'Stitch Together',
      description: 'Tracing tool creates waterfall diagram',
      example: 'Nested spans showing call hierarchy',
      color: colors.green
    }
  ]}
/>

Waterfall diagrams show:

- Which services were involved
- Order of requests (reveals dependencies)
- How long each request took
- Useful metadata (headers, query params, errors)

This helps with debugging and performance tuning in microservices architectures.

Tools: Zipkin, Jaeger, Honeycomb, SigNoz, Uptrace. OpenTelemetry is the recommended approach for instrumentation. Service meshes (Istio) often provide distributed tracing out of the box.

:::tip Key Takeaway #6
Use distributed tracing to visualize the path of requests through your microservices architecture.
:::

### Testing in Production (TIP)

> Usually, testing checks a very strong notion of correctness on a few cases, and monitoring checks a very weak notion of correctness under the real production load.
>
> — Jay Kreps, cofounder of Confluent

As you scale, you'll find:

- More errors you can't anticipate
- Harder to simulate production (billions of users, petabytes of data)

Some large companies don't bother with staging environments. Instead, they test in production—deploying code and seeing what happens. Done correctly, this requires:

- **Automated testing**: Still need plenty of tests (static analysis, unit, integration)
- **Automated deployments**: Fast, reliable deployments with quick rollback/forward
- **Metrics**: Track key metrics (four golden signals) with good baselines
- **Observability and tracing**: Quickly interrogate systems to find root causes
- **Feature toggles, ramping, and A/B tests**: Limit blast radius, gradually ramp up, test outcomes

Benefits of TIP:

- Improved DORA metrics (higher deployment frequency, lower lead times)
- Faster feedback loops
- Testing actual user behavior and outcomes

When to avoid TIP (use extensive pre-production testing instead):

- Security features (authentication, authorization, encryption)
- Financial features (transactions, payments)
- Data storage features (risk of corruption/deletion)
- Features where human lives are at risk (medical, autopilot)

For low-cost bugs (e.g., minor UI glitches), TIP is ideal. For high-cost bugs, invest heavily in pre-production testing.

## Alerts

Logs, metrics, and events help understand the cause of incidents, but how do you discover incidents in the first place? Configure **alerts** that notify you of problems.

### Triggers

For each alert, define triggers (rules) for when to send notifications. Triggers typically check if metrics, events, or logs exceed thresholds:

**Types of Alert Thresholds**

| Type | Based On | Example | Pros & Cons |
|------|----------|---------|-------------|
| Absolute | Specific concrete values | Latency > 500ms | Easy to understand; can cause false positives if "normal" changes |
| Relative | Comparison to baseline | Latency +50% from baseline | Catches spikes without needing absolute value; requires good baseline |
| Historical | Compare to previous time period | Latency 50% higher than last week | Good for seasonal patterns; requires similar historical conditions |

When possible, handle triggers with automation (auto healing, auto scaling). If automation can't handle it, notify a human.

### Notifications

Alerts that notify people have significant costs:

- Interrupt work (firefighting takes precedence)
- Interrupt personal life (alerts at any time, including 3 AM, holidays)
- **Alert fatigue**: Too many alerts lead to stress, burnout, or ignored alerts ("The Boy Who Cried Wolf")

Only alert someone if the trigger meets ALL three criteria:

1. **Actionable**: Person can do something about it
2. **Important**: The issue matters (not just higher-than-normal CPU)
3. **Urgent**: Must be dealt with immediately (waiting causes significant harm)

If a trigger doesn't meet all three, send nonurgent notification instead:

- File a ticket in issue-tracking system
- Send message to chat room (Slack, Teams) or mailing list
- Reviewed periodically, not immediately

:::tip Key Takeaway #7
Use alerts to notify you of problems, but only if those problems are actionable, important, and urgent.
:::

### On Call

Create an on-call rotation: schedule assigning specific team members to respond to alerts at specific times. Modern tools (PagerDuty, Opsgenie) manage rotations and send alerts to smartphones.

Being on call is stressful. Best practices:

<CardGrid
  title="On-Call Best Practices"
  description="Strategies to make on-call sustainable"
  cards={[
    {
      title: 'Measure Toil',
      description: 'Track manual vs. engineering work',
      items: [
        'Toil = manual, repetitive, reactive, temporary',
        'Engineering = automation, long-term solutions',
        'Target < 50% toil (ideally < 20%)',
        'Proactively shift balance to engineering',
        'Track toil % on dashboards',
        'Alert if toil exceeds thresholds'
      ],
      color: colors.red
    },
    {
      title: 'Set Error Budget',
      description: 'Balance reliability and velocity',
      items: [
        'Error budget = 1 - availability target',
        'E.g., 99.9% target = 0.1% budget (~10 min/week)',
        'Within budget: deploy often',
        'Exceed budget: slow down, improve resilience',
        'Resolves Dev vs. Ops tension',
        'Expected, not failures to avoid'
      ],
      color: colors.yellow
    },
    {
      title: 'Include Developers',
      description: 'Share the pain',
      items: [
        'Developers in on-call rotation',
        'Experience 3 AM pages firsthand',
        'Incentivizes better testing, monitoring',
        'Breaks "throw it over the wall" mentality',
        'Improves code quality',
        'Shared ownership of reliability'
      ],
      color: colors.blue
    },
    {
      title: 'Recognize Responders',
      description: 'Acknowledge the sacrifice',
      items: [
        'Call out successful incident resolution',
        'Give day off after late-night firefighting',
        'Small monetary bonus (not enough to incentivize incidents)',
        'Make recognition visible to peers',
        'Show appreciation for being on call',
        'Reduce sting of interrupted life'
      ],
      color: colors.green
    }
  ]}
/>

:::tip Key Takeaway #8
Use an on-call rotation to deal with alerts, but make sure to keep toil in check, enforce an error budget, include developers in the rotation, and recognize those who resolved incidents.
:::

### Incident Response

When an incident occurs, follow an incident-response plan. As your company grows, get the plan in writing (often required for compliance like SOC 2).

Most incident-response plans include:

<TreeDiagram
  title="Incident Response Plan"
  description="Key components of a comprehensive incident response process"
  root={{
    label: 'Incident Response',
    children: [
      {
        label: 'Response Team',
        description: 'Who handles incidents',
        children: [
          { label: 'On-call rotation' },
          { label: 'Escalation paths by incident type' },
          { label: 'Contact security team for security incidents' }
        ]
      },
      {
        label: 'Response Time',
        description: 'SLO commitments',
        children: [
          { label: 'Internal SLOs' },
          { label: 'Customer-facing SLAs' },
          { label: 'Clearly defined and visible' }
        ]
      },
      {
        label: 'Communication',
        description: 'Stakeholder updates',
        children: [
          { label: 'Internal: chat rooms, wiki' },
          { label: 'External: status pages, social media' },
          { label: 'Document steps taken (wiki notes)' }
        ]
      },
      {
        label: 'Playbooks',
        description: 'Step-by-step instructions',
        children: [
          { label: 'Latency problems in service A' },
          { label: 'Memory issues in service B' },
          { label: 'Created from past incidents' },
          { label: 'Update with each use (wiki)' }
        ]
      },
      {
        label: 'Postmortems',
        description: 'Learn from incidents',
        children: [
          { label: 'What went wrong' },
          { label: 'How it was resolved' },
          { label: 'How to prevent in future' },
          { label: 'Blameless (system, not people)' }
        ]
      },
      {
        label: 'Continuous Improvement',
        description: 'Update processes',
        children: [
          { label: 'Update alerts (remove false positives)' },
          { label: 'Add automation to reduce toil' },
          { label: 'Balance actionable/important/urgent' }
        ]
      }
    ]
  }}
/>

After each incident:

- **Update alerts**: Was it actionable, important, and urgent? If not, update or delete the alert
- **Update automation**: Could automation have resolved this without alerting a human?

You'll never get alerts right the first time. Everything is constantly changing (software, infrastructure, products, user behavior), so develop discipline to tweak alerts as part of the response process.

:::tip Key Takeaway #9
Resolve incidents by assembling a response team, keeping stakeholders updated, fulfilling SLAs and SLOs, and following playbooks. After each incident, hold a blameless postmortem and update your alert settings.
:::

### Example: Alerts in CloudWatch

Let's configure an alert for Route 53 health checks using CloudWatch Alarms. When the `HealthCheckStatus` metric drops below 1 (indicating the website is down), publish a message to Amazon SNS. You can subscribe to SNS to get notifications via email or SMS.

```hcl
# CloudWatch alarm
resource "aws_cloudwatch_metric_alarm" "sample_app_is_down" {
  provider = aws.us_east_1  # Route 53 metrics always in us-east-1

  alarm_name          = "sample-app-is-down"
  namespace           = "AWS/Route53"
  metric_name         = "HealthCheckStatus"
  dimensions = {
    HealthCheckId = aws_route53_health_check.example.id
  }

  statistic           = "Minimum"
  comparison_operator = "LessThanThreshold"
  threshold           = 1
  period              = 60
  evaluation_periods  = 1

  alarm_actions       = [aws_sns_topic.cloudwatch_alerts.arn]
}

# SNS topic for alerts
resource "aws_sns_topic" "cloudwatch_alerts" {
  provider = aws.us_east_1
  name     = "sample-app-cloudwatch-alerts"
}

# Subscribe to SNS topic
resource "aws_sns_topic_subscription" "sms" {
  provider  = aws.us_east_1
  topic_arn = aws_sns_topic.cloudwatch_alerts.arn
  protocol  = "email-json"
  endpoint  = "USERNAME@DOMAIN.COM"  # Your email address
}
```

After deployment, you'll receive an email to confirm your SNS subscription. Click the link to subscribe. To test the alert, intentionally break your app (e.g., delete the load balancer). After a few minutes, you should receive an alert email!

## Conclusion

You've now learned how to monitor your systems, as per the nine key takeaways from this chapter:

1. Add logging throughout your code to give you visibility into what's happening in your systems.
2. Use log levels, log formatting, multiple loggers, structured logging, log file rotation, and log aggregation to make your logging more effective.
3. Use metrics to detect problems, understand user behavior, improve product and team performance, and more generally, as a mechanism for continuous feedback and improvement.
4. Collect multiple types of metrics (availability, business, application, server, team) and build dashboards to focus on the most important metrics to your business.
5. Instrument your code to publish structured events. Use observability tools to understand what your software is doing by performing iterative, ad hoc queries against these structured events.
6. Use distributed tracing to visualize the path of requests through your microservices architecture.
7. Use alerts to notify you of problems, but only if those problems are actionable, important, and urgent.
8. Use an on-call rotation to deal with alerts, but make sure to keep toil in check, enforce an error budget, include developers in the rotation, and recognize those who resolved incidents.
9. Resolve incidents by assembling a response team, keeping stakeholders updated, fulfilling SLAs and SLOs, and following playbooks. After each incident, do a blameless postmortem and update your alert settings.

<CardGrid
  title="Monitoring Best Practices Summary"
  description="Quick reference for effective monitoring"
  cards={[
    {
      title: 'Start Small',
      description: 'Incremental approach',
      items: [
        'Begin with basic logging',
        'Track availability + four golden signals',
        'Build dashboards for key metrics',
        'Add more as you scale',
        'Diminishing returns from elaborate methods',
        'Most value from initial setup'
      ],
      color: colors.blue
    },
    {
      title: 'Be Liberal with Logs',
      description: 'Structured events',
      items: [
        'Use structured logging extensively',
        'Multiple loggers and log levels',
        'Publish structured events',
        'Relatively cheap to instrument',
        'Invaluable for debugging',
        'Rarely have too much log data'
      ],
      color: colors.green
    },
    {
      title: 'Focus on Actionability',
      description: 'Reduce noise',
      items: [
        'Alerts only if actionable + important + urgent',
        'Nonurgent issues → tickets/chat',
        'Continuously tune alerts',
        'Remove false positives immediately',
        'Automate when possible',
        'Prevent alert fatigue'
      ],
      color: colors.purple
    },
    {
      title: 'Invest in Tools',
      description: 'Mature solutions',
      items: [
        'Use proven logging libraries',
        'OpenTelemetry for instrumentation',
        'Managed services when possible',
        'Observability platforms for complexity',
        'Don\'t roll your own',
        'Focus on your domain, not tooling'
      ],
      color: colors.yellow
    }
  ]}
/>

If you're starting from zero with monitoring, figuring out all the instrumentation and tooling may seem daunting, but bear in mind that you can do this incrementally. You don't have to monitor everything, and you don't need the perfect monitoring setup from day one to get value. Start small, perhaps by adding basic logging and tracking a handful of metrics (availability plus the four golden signals), and then iteratively add more as you scale.

At this point, you've learned just about all the basics of DevOps and software delivery as they are today. Let's now turn to Chapter 11 to imagine what they might look like in the future.

---

**Previous:** [Storage](/operations-architecture/ch09-storage) | **Next:** [The Future of DevOps](/operations-architecture/ch11-future-of-devops)
