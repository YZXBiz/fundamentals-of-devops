---
sidebar_position: 4
title: "Chapter 9: How to Store Data"
description: "Learn how to store, query, and manage data using relational databases, NoSQL stores, caching, file storage, and backup strategies. Understand data replication, schemas, and recovery techniques."
---

import { ProcessFlow, StackDiagram, CardGrid, ComparisonTable, TreeDiagram, colors } from '@site/src/components/diagrams';

# Chapter 9: How to Store Data

In Chapter 8, you learned how to protect your data in transit and at rest. In this chapter, you'll learn about other aspects of data, including storage, querying, and replication.

**In plain English:** This chapter teaches you where and how to save your data permanently—whether it's user profiles, purchase history, or uploaded photos.

**In technical terms:** You'll learn about different data storage systems, their trade-offs, and how to choose the right tool for each use case: relational databases, key-value stores, file storage, document stores, columnar databases, queues, and streams.

**Why it matters:** Data is one of your most valuable, longest-lived assets. Your data will outlive your web framework, orchestration tool, service mesh, CI/CD pipeline, most employees, and perhaps even the company itself.

## Table of Contents

1. [Local Storage: Hard Drives](#1-local-storage-hard-drives)
2. [Primary Data Store: Relational Databases](#2-primary-data-store-relational-databases)
3. [Caching: Key-Value Stores and CDNs](#3-caching-key-value-stores-and-cdns)
4. [File Storage: File Servers and Object Stores](#4-file-storage-file-servers-and-object-stores)
5. [Semistructured Data and Search: Document Stores](#5-semistructured-data-and-search-document-stores)
6. [Analytics: Columnar Databases](#6-analytics-columnar-databases)
7. [Asynchronous Processing: Queues and Streams](#7-asynchronous-processing-queues-and-streams)
8. [Scalability and Availability](#8-scalability-and-availability)
9. [Backup and Recovery](#9-backup-and-recovery)

## 1. Local Storage: Hard Drives

**In plain English:** Local storage means saving files directly on your computer's hard drive, just like saving a document on your laptop.

**In technical terms:** Local storage refers to persistent storage directly attached to a server, including physical hard drives (HDD/SSD), network-attached storage (EBS, Persistent Disk), shared network drives (NFS, EFS), and container volumes.

**Why it matters:** Understanding storage options is fundamental, but using custom file formats for application data leads to problems with querying, schema evolution, and concurrency.

<CardGrid
  title="Types of Hard Drive Storage"
  description="Common storage solutions for different deployment models"
  cards={[
    {
      title: 'Physical Hard Drives (On-Prem)',
      description: 'Physically attached storage',
      items: [
        'Magnetic drives or SSDs',
        'SATA or NVMe interfaces',
        'RAID configurations for reliability',
        'Highest performance, lowest latency',
        'Requires physical management',
        'Best for: On-premise data centers'
      ],
      color: colors.blue
    },
    {
      title: 'Network-Attached Drives',
      description: 'Cloud block storage',
      items: [
        'AWS EBS, Google Persistent Disk',
        'Mounted as local filesystems',
        'Software-defined, flexible',
        'Higher latency than physical',
        'Easy to attach/detach',
        'Best for: Cloud VMs'
      ],
      color: colors.green
    },
    {
      title: 'Shared Network Drives',
      description: 'Multi-server access',
      items: [
        'NFS, CIFS, SMB protocols',
        'AWS EFS, Google Filestore',
        'Multiple servers, same disk',
        'Good for shared file serving',
        'Higher latency',
        'Best for: Shared storage needs'
      ],
      color: colors.purple
    },
    {
      title: 'Container Volumes',
      description: 'Persistent storage for containers',
      items: [
        'Kubernetes persistent volumes',
        'EBS in EKS, Persistent Disk in GKE',
        'Local folders in Docker Desktop',
        'Survives container restarts',
        'Implementation varies by platform',
        'Best for: Stateful containers'
      ],
      color: colors.yellow
    }
  ]}
/>

:::warning Running Data Stores in Containers
Containers are designed to be easy to distribute, scale, and throw away (hence the default of ephemeral disks), which is great for stateless apps and local development, but not for data stores in production. Not all data stores support running in containers, and not all orchestration tools have mature persistent volume implementations. I prefer to run data stores using managed services such as Amazon RDS. Run data stores in containers only if you're all-in on Kubernetes with significant operational experience.
:::

:::tip Key Takeaway #1
Keep your applications stateless. Store all your data in dedicated data stores.
:::

## 2. Primary Data Store: Relational Databases

**In plain English:** Relational databases are like super-organized spreadsheets that can handle millions of rows, enforce data rules, and answer complex questions instantly.

**In technical terms:** Relational databases store data in tables with rows and columns, enforce schemas with constraints, support complex queries with SQL, and provide ACID transactions for data integrity.

**Why it matters:** Relational databases have been the dominant data storage solution for decades because they're flexible, maintain data integrity, scale well, have strong security, huge ecosystems, and are incredibly mature (25-50 years of development).

:::tip Key Takeaway #2
Don't roll your own data stores; always use mature, battle-tested, proven, off-the-shelf solutions.
:::

<TreeDiagram
  title="Relational Database Capabilities"
  description="Key features that make relational databases the go-to choice for primary data storage"
  root={{
    label: 'Relational Databases',
    children: [
      {
        label: 'Data Integrity',
        description: 'ACID transactions, constraints',
        children: [
          { label: 'Atomicity: All or nothing' },
          { label: 'Consistency: Valid states' },
          { label: 'Isolation: Concurrent safety' },
          { label: 'Durability: Persistent writes' }
        ]
      },
      {
        label: 'Schema Management',
        description: 'Structured data definitions',
        children: [
          { label: 'Domain constraints (types)' },
          { label: 'Primary keys (uniqueness)' },
          { label: 'Foreign keys (relationships)' },
          { label: 'Migration tools (Flyway, Knex)' }
        ]
      },
      {
        label: 'Query Flexibility',
        description: 'Powerful SQL language',
        children: [
          { label: 'SELECT with WHERE, ORDER BY' },
          { label: 'JOINs across tables' },
          { label: 'Aggregations (COUNT, SUM, AVG)' },
          { label: 'Indices for performance' }
        ]
      }
    ]
  }}
/>

### 2.1. Reading and Writing Data

Relational databases store data in tables. Each row represents an item, and each row has the same columns.

Example `customers` table:

| id | name | date_of_birth | balance |
|----|------|---------------|---------|
| 1 | Brian Kim | 1948-09-23 | 1500 |
| 2 | Karen Johnson | 1989-11-18 | 4853 |
| 3 | Wade Feinstein | 1965-02-29 | 2150 |

You interact with databases using SQL:

```sql
-- Insert data
INSERT INTO customers (name, date_of_birth, balance)
VALUES ('Brian Kim', '1948-09-23', 1500);

-- Query all data
SELECT * FROM customers;

-- Query with filter
SELECT * FROM customers WHERE date_of_birth > '1950-12-31';
```

### 2.2. ACID Transactions

**In plain English:** ACID transactions ensure that related operations either all succeed or all fail together, preventing half-finished changes that corrupt your data.

**In technical terms:** Transactions are sets of coherent operations performed as a unit, meeting four properties: Atomicity (all or nothing), Consistency (valid state always), Isolation (concurrent safety), Durability (persistent storage).

**Why it matters:** Without ACID, transferring money between accounts could deduct from one account but fail to add to the other, causing money to vanish.

<ProcessFlow
  title="ACID Transaction Properties"
  description="The four guarantees that relational databases provide for transactions"
  steps={[
    {
      name: 'Atomicity',
      description: 'All or nothing',
      example: 'Either all operations complete, or none do',
      color: colors.blue
    },
    {
      name: 'Consistency',
      description: 'Valid state always',
      example: 'Data always meets defined constraints',
      color: colors.green
    },
    {
      name: 'Isolation',
      description: 'Concurrent safety',
      example: 'Result same as sequential execution',
      color: colors.purple
    },
    {
      name: 'Durability',
      description: 'Persistent storage',
      example: 'Completed transactions survive failures',
      color: colors.yellow
    }
  ]}
/>

### 2.3. Schemas and Constraints

**In plain English:** Schemas are like blueprints that define what kind of data you can store and what rules it must follow.

**In technical terms:** Schemas define table structure (columns, types) and integrity constraints (domain constraints, primary keys, foreign keys) that the database enforces automatically.

**Why it matters:** Schemas catch data errors early (e.g., prevent storing text in a number field, ensure referenced records exist) and document your data structure.

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128),
  date_of_birth DATE,
  balance INT
);

CREATE TABLE accounts (
  account_id SERIAL PRIMARY KEY,
  account_type VARCHAR(20),
  balance INT,
  customer_id INT REFERENCES customers(id)  -- Foreign key constraint
);
```

Schema migration tools manage database schemas as code:

- **Flyway**: Uses standard SQL in .sql files
- **Liquibase**: Uses XML, YAML, JSON, or SQL
- **Knex.js**: Uses JavaScript DSL in .js files

:::tip Key Takeaway #3
Use relational databases as your primary data store (the source of truth), as they are secure, reliable, and mature, and they support schemas, integrity constraints, foreign-key constraints, joins, ACID transactions, and a flexible query language (SQL).
:::

## 3. Caching: Key-Value Stores and CDNs

**In plain English:** Caching is like keeping frequently used items on your desk instead of fetching them from the filing cabinet every time.

**In technical terms:** Caching stores frequently accessed data in fast memory (RAM) to reduce latency and load on primary data stores. Common use cases include session data, computed results, and API responses.

**Why it matters:** Reduces response time from hundreds of milliseconds to single-digit milliseconds and reduces load on expensive backend systems.

<CardGrid
  title="Caching Solutions"
  description="Popular tools for in-memory caching"
  cards={[
    {
      title: 'Redis',
      description: 'In-memory data structure store',
      items: [
        'Strings, lists, sets, hashes',
        'Pub/sub messaging',
        'Persistence options',
        'Atomic operations',
        'Clustering support',
        'AWS ElastiCache, Azure Cache'
      ],
      color: colors.red
    },
    {
      title: 'Memcached',
      description: 'Simple key-value cache',
      items: [
        'Pure key-value store',
        'Very fast, lightweight',
        'No persistence',
        'Simple protocol',
        'Good for basic caching',
        'AWS ElastiCache support'
      ],
      color: colors.blue
    },
    {
      title: 'CDN',
      description: 'Content delivery networks',
      items: [
        'CloudFront, CloudFlare, Akamai',
        'Global edge locations',
        'Cache static content',
        'Reduce latency worldwide',
        'WAF and DDoS protection',
        'Best for: Static assets, media'
      ],
      color: colors.green
    }
  ]}
/>

:::tip Key Takeaway #4
Use CDNs to cache static content, reducing latency for your users and reducing load on your servers.
:::

## 4. File Storage: File Servers and Object Stores

**In plain English:** File storage is where you keep files like images, videos, and documents—either on traditional file servers or modern cloud storage.

**In technical terms:** File servers (NFS, CIFS) provide filesystem semantics with directories and in-place edits. Object stores (S3, GCS) provide HTTP APIs with flat namespaces and immutable objects.

**Why it matters:** Object stores offer near-unlimited scalability, 11-nines durability, and pay-per-use pricing, making them ideal for modern cloud applications.

**File Servers vs. Object Stores**

| Feature | File Servers (NFS/CIFS) | Object Stores (S3/GCS) |
|---------|------------------------|------------------------|
| Interface | Filesystem (mount point) | HTTP API |
| Hierarchy | Directories and files | Flat namespace with keys |
| Modification | In-place edits | Immutable (replace entire object) |
| Scalability | Limited by server | Nearly unlimited |
| Durability | RAID, backups needed | 99.999999999% (11 nines) |
| Cost | Higher (infrastructure) | Pay per GB stored and transferred |
| Use Case | Shared drives, legacy apps | Static assets, backups, data lakes |

:::tip Key Takeaway #5
Use object stores for scalable, durable file storage, especially for static assets, backups, media files, and data lakes.
:::

## 5. Semistructured Data and Search: Document Stores

**In plain English:** Document stores let you save JSON-like data with flexible structure, perfect for content that doesn't fit neatly into rigid tables.

**In technical terms:** Document stores (MongoDB, Couchbase, Amazon DocumentDB) handle semistructured data (JSON/BSON), support flexible schemas, provide native JSON support, horizontal scalability, and full-text search.

**Why it matters:** Great for evolving data models and search-heavy applications, but trade ACID transactions and mature SQL for flexibility.

Example document:

```json
{
  "name": "Fundamentals of DevOps",
  "author": "Yevgeniy Brikman",
  "isbn": "1098174593",
  "tags": ["DevOps", "Software Delivery", "Cloud"]
}
```

:::tip Key Takeaway #6
Use document stores for semistructured data, flexible schemas, and full-text search.
:::

## 6. Analytics: Columnar Databases

**In plain English:** Columnar databases are optimized for reading and analyzing huge amounts of data, like calculating total sales across millions of transactions.

**In technical terms:** Columnar databases (Redshift, BigQuery, Snowflake) store data by column instead of row, enabling massive compression, parallel processing, and fast aggregations over petabytes of data.

**Why it matters:** Queries that would take hours on row-based databases complete in seconds on columnar databases.

<ProcessFlow
  title="Row-Based vs. Column-Based Storage"
  description="How columnar databases optimize for analytical queries"
  steps={[
    {
      name: 'Row-Based (OLTP)',
      description: 'Store entire rows together',
      example: 'Fast for reading/writing individual records',
      color: colors.blue
    },
    {
      name: 'Column-Based (OLAP)',
      description: 'Store columns together',
      example: 'Fast for aggregating specific columns',
      color: colors.green
    },
    {
      name: 'Compression',
      description: 'Similar values compress well',
      example: 'Save 10x-100x storage space',
      color: colors.purple
    },
    {
      name: 'Parallel Processing',
      description: 'Scan columns in parallel',
      example: 'Query petabytes in seconds',
      color: colors.yellow
    }
  ]}
/>

:::tip Key Takeaway #7
Use columnar databases for analytics, data warehousing, and queries that aggregate large datasets.
:::

## 7. Asynchronous Processing: Queues and Streams

### 7.1. Message Queues

**In plain English:** Message queues are like leaving notes in a shared inbox—one service writes a note, another picks it up and processes it later.

**In technical terms:** Message queues (SQS, RabbitMQ, ActiveMQ) enable asynchronous communication by storing messages until consumers process and acknowledge them.

**Why it matters:** Decouples services, smooths traffic spikes, ensures reliable delivery, and enables automatic retries.

:::tip Key Takeaway #8
Use message queues to decouple services, smooth out traffic spikes, and ensure reliable message delivery.
:::

### 7.2. Event Streams

**In plain English:** Event streams are like a permanent log of everything that happened, which multiple systems can read and replay.

**In technical terms:** Event streams (Kafka, Kinesis, Pub/Sub) provide a durable, ordered log of events that multiple consumers can process independently and replay from any point.

**Why it matters:** Enables real-time processing, event sourcing, and the ability to reprocess historical events for new analytics or bug fixes.

<ProcessFlow
  title="Event Stream Architecture"
  description="How event streaming platforms enable real-time data processing"
  steps={[
    {
      name: 'Producer',
      description: 'Service A publishes events',
      example: 'User activity, transactions',
      color: colors.blue
    },
    {
      name: 'Stream',
      description: 'Durable, ordered log',
      example: 'Partitioned, replicated',
      color: colors.purple
    },
    {
      name: 'Multiple Consumers',
      description: 'Services B, C, D subscribe',
      example: 'Each processes independently',
      color: colors.green
    },
    {
      name: 'Replay',
      description: 'Reprocess historical events',
      example: 'Fix bugs, new analytics',
      color: colors.yellow
    }
  ]}
/>

:::tip Key Takeaway #9
Use event streams for real-time data processing, event sourcing, and when you need multiple consumers or the ability to replay events.
:::

## 8. Scalability and Availability

### 8.1. Replication

**In plain English:** Replication means keeping multiple copies of your data on different servers so your system can handle more requests and survive server failures.

**In technical terms:** Read replicas copy data to multiple servers (primary handles writes, replicas handle reads) for read scalability with eventual consistency. Multi-master replication allows multiple servers to accept writes for higher availability but requires complex conflict resolution.

**Why it matters:** Improves both performance and reliability, though at the cost of eventual consistency.

### 8.2. Partitioning (Sharding)

**In plain English:** Partitioning splits your data across multiple servers, like organizing a huge library across multiple buildings.

**In technical terms:** Horizontal partitioning splits rows (e.g., users A-M on server 1, N-Z on server 2). Vertical partitioning splits columns (e.g., user profile on server 1, user activity on server 2).

**Why it matters:** Allows scaling beyond single-server capacity limits, but makes queries more complex and rebalancing challenging.

:::tip Key Takeaway #10
Use replication for high availability and read scalability. Use partitioning when data exceeds single-server capacity.
:::

### 8.3. NoSQL and NewSQL

**NoSQL databases** (Cassandra, DynamoDB, MongoDB) sacrifice ACID for horizontal scalability, high availability, and flexible schemas.

**NewSQL databases** (CockroachDB, Google Spanner, YugabyteDB) aim to provide ACID transactions and SQL with horizontal scalability.

:::tip Key Takeaway #11
Use NoSQL and NewSQL databases when your scalability and availability requirements exceed what you can do with a relational database—but only if you can invest in the time and expertise of deploying and maintaining a distributed data store.
:::

## 9. Backup and Recovery

**In plain English:** Backups are like insurance—you hope you never need them, but when disaster strikes, they're invaluable.

**In technical terms:** Backups create copies of data for disaster recovery. Strategies include snapshots (point-in-time copies), continuous backup (ongoing WAL copying), and replication (live copies).

**Why it matters:** Data loss can destroy a business. Proper backups ensure you can recover from failures, accidental deletions, or ransomware attacks.

**Backup Strategies**

| Strategy | How It Works | Pros | Cons |
|----------|--------------|------|------|
| Snapshots | Point-in-time copy of entire dataset | Fast recovery, easy to understand | Storage intensive, recovery only to snapshot time |
| Continuous Backup | Ongoing copy of all changes (WAL) | Point-in-time recovery to any moment | More complex, storage for logs |
| Replication | Live copy on separate server | Fast failover, minimal data loss | Not a backup (corruption replicates) |

**Backup best practices:**

1. **Automate everything**: Use managed services or IaC
2. **Test restores**: Backups are useless if they don't work
3. **Follow 3-2-1 rule**: 3 copies, 2 different media, 1 offsite
4. **Encrypt backups**: Protect data at rest
5. **Monitor backup status**: Alert on failures

:::tip Key Takeaway #12
Use automated, tested backup strategies. Combine snapshots, continuous backups, and replication for comprehensive protection.
:::

## Conclusion

You've now learned how to store, query, replicate, and back up your data, as per the 12 key takeaways from this chapter:

1. Keep your applications stateless. Store all your data in dedicated data stores.
2. Don't roll your own data stores; always use mature, battle-tested, proven, off-the-shelf solutions.
3. Use relational databases as your primary data store (the source of truth).
4. Use CDNs to cache static content, reducing latency and server load.
5. Use object stores for scalable, durable file storage.
6. Use document stores for semistructured data and full-text search.
7. Use columnar databases for analytics and data warehousing.
8. Use message queues to decouple services and ensure reliable delivery.
9. Use event streams for real-time processing and event sourcing.
10. Use replication for high availability and read scalability.
11. Use NoSQL and NewSQL databases when scalability requirements exceed traditional databases.
12. Use automated, tested backup strategies combining snapshots, continuous backups, and replication.

<TreeDiagram
  title="Data Storage Decision Tree"
  description="Choosing the right data store for your use case"
  root={{
    label: 'Choose Data Store',
    children: [
      {
        label: 'Primary Data',
        description: 'Source of truth',
        children: [
          { label: 'Relational DB (PostgreSQL, MySQL)' },
          { label: 'Schema migrations with Knex/Flyway' },
          { label: 'ACID transactions' }
        ]
      },
      {
        label: 'Fast Access',
        description: 'Caching layer',
        children: [
          { label: 'In-memory: Redis, Memcached' },
          { label: 'CDN: CloudFront, CloudFlare' }
        ]
      },
      {
        label: 'Files',
        description: 'Static content',
        children: [
          { label: 'Object Store: S3, GCS' },
          { label: 'CDN for global distribution' }
        ]
      },
      {
        label: 'Flexible Schema',
        description: 'Evolving data',
        children: [
          { label: 'Document Store: MongoDB' },
          { label: 'Full-text search' }
        ]
      },
      {
        label: 'Analytics',
        description: 'Large-scale queries',
        children: [
          { label: 'Columnar DB: Redshift, BigQuery' },
          { label: 'Data warehousing' }
        ]
      },
      {
        label: 'Async Processing',
        description: 'Decoupled services',
        children: [
          { label: 'Queue: SQS, RabbitMQ' },
          { label: 'Stream: Kafka, Kinesis' }
        ]
      }
    ]
  }}
/>

Data is one of your most valuable assets. Choose the right tools, implement proper backups, test your recovery procedures, and your data will serve your business for decades to come. In Chapter 10, you'll learn how to monitor your systems to ensure everything is running smoothly.

---

**Previous:** [Security](/operations-architecture/ch08-security) | **Next:** [Monitoring](/operations-architecture/ch10-monitoring)
