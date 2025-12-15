---
sidebar_position: 4
title: "Chapter 9: How to Store Data"
description: "Learn how to store, query, and manage data using relational databases, NoSQL stores, caching, file storage, and backup strategies. Understand data replication, schemas, and recovery techniques."
---

import { ProcessFlow, StackDiagram, CardGrid, ComparisonTable, TreeDiagram, colors } from '@site/src/components/diagrams';

# Chapter 9. How to Store Data

In Chapter 8, you learned how to protect your data in transit and at rest. In this chapter, you'll learn about other aspects of data, including storage, querying, and replication. What data am I referring to? Just about all software relies on data: social networking apps need profile, connection, and messaging data; shopping apps need inventory and purchase data; fitness apps need workout and activity data.

Data is one of your most valuable, longest-lived assets. In all likelihood, your data will outlive your shiny web framework, your orchestration tool, your service mesh, your CI/CD pipeline, most employees at your company, and perhaps even the company itself, starting a second life as part of an acquisition. Data is important, and this chapter will show you how to manage it properly.

## Table of Contents

1. [Local Storage: Hard Drives](#local-storage-hard-drives)
2. [Primary Data Store: Relational Databases](#primary-data-store-relational-databases)
   - [Reading and Writing Data](#reading-and-writing-data)
   - [ACID Transactions](#acid-transactions)
   - [Schemas and Constraints](#schemas-and-constraints)
   - [Example: PostgreSQL, Lambda, and Schema Migrations](#example-postgresql-lambda-and-schema-migrations)
3. [Caching: Key-Value Stores and CDNs](#caching-key-value-stores-and-cdns)
4. [File Storage: File Servers and Object Stores](#file-storage-file-servers-and-object-stores)
5. [Semistructured Data and Search: Document Stores](#semistructured-data-and-search-document-stores)
6. [Analytics: Columnar Databases](#analytics-columnar-databases)
7. [Asynchronous Processing: Queues and Streams](#asynchronous-processing-queues-and-streams)
8. [Scalability and Availability](#scalability-and-availability)
9. [Backup and Recovery](#backup-and-recovery)

## Local Storage: Hard Drives

The most basic form of data storage is to write to your local hard drive. The following are the most common types of hard drives used today:

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

:::caution Running Data Stores in Containers
Containers are designed to be easy to distribute, scale, and throw away (hence the default of ephemeral disks), which is great for stateless apps and local development, but not for data stores in production. Not all data stores, data tools, and data vendors support running in containers, and not all orchestration tools support persistent volumes (and those that do often have immature implementations). I prefer to run data stores in production by using managed services, such as Amazon's Relational Database Service. I'd run a data store in a container only if my company was all-in on Kubernetes, which has the most mature persistent volume implementation, and we had significant operational experience with it.
:::

Just because you have a local hard drive doesn't mean you should always use it. The typical problems with using custom file formats include:

- **Querying the data**: You have to write custom code to extract insights from your custom file format
- **Evolving the data format**: Updates to your format can break compatibility with older files
- **Handling concurrency**: Running on multiple computers requires complex synchronization logic

The solution is to store data in dedicated, mature data stores rather than custom file formats.

:::tip Key Takeaway #1
Keep your applications stateless. Store all your data in dedicated data stores.
:::

## Primary Data Store: Relational Databases

Relational databases have been the dominant data storage solution for decades—and for good reason. They are flexible; do a great job of maintaining data integrity and consistency; can be configured for remarkable scalability and availability; offer a strong security model; have a huge ecosystem of tools, vendors, and developers; store data efficiently (temporally and spatially); and are the most mature data storage technology available.

The maturity of relational databases is worth focusing on. Consider the initial release dates of some of the most popular relational databases: Oracle (1979), Microsoft SQL Server (1989), MySQL (1995), PostgreSQL (1996), and SQLite (2000). These databases have been in development for 25-50 years, and they are still in active development today.

Data storage is not a technology you can develop quickly. Good software takes at least a decade to develop; with databases, it may be closer to two decades. That's how long it takes to build a piece of software that can be trusted with one of your company's most valuable assets.

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

### Reading and Writing Data

A relational database stores data in tables, which represent a collection of related items. Each item is stored in a row, and each row in a table has the same columns. For example, if you were working on a website for a bank, you might have a `customers` table:

| id | name | date_of_birth | balance |
|----|------|---------------|---------|
| 1 | Brian Kim | 1948-09-23 | 1500 |
| 2 | Karen Johnson | 1989-11-18 | 4853 |
| 3 | Wade Feinstein | 1965-02-29 | 2150 |

Relational databases require you to define a schema before you can write any data. To interact with a relational database, you use Structured Query Language (SQL):

```sql
-- Insert data
INSERT INTO customers (name, date_of_birth, balance)
VALUES ('Brian Kim', '1948-09-23', 1500);

-- Query all data
SELECT * FROM customers;

-- Query with filter
SELECT * FROM customers WHERE date_of_birth > '1950-12-31';
```

:::note SQL Dialects
In theory, SQL is standardized by ANSI and ISO. In practice, every relational database has its own dialect of SQL that is slightly different. This book focuses on concepts that apply to all relational databases, but examples use the PostgreSQL dialect.
:::

SQL is ubiquitous in software development, and it's exceptionally flexible. You can use WHERE to filter data; ORDER BY to sort data; GROUP BY to group data; JOIN to query data from multiple tables; COUNT, SUM, AVG, and other aggregate functions to perform calculations; indices to make queries faster; and more.

### ACID Transactions

A transaction is a set of coherent operations that should be performed as a unit. In relational databases, transactions must meet four properties:

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

For example, transferring money between accounts:

```sql
START TRANSACTION;
  UPDATE customers SET balance = balance - 100 WHERE id = 1;
  UPDATE customers SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

With ACID, either both accounts are updated, or neither is. No money vanishes into thin air, even with crashes or concurrency.

### Schemas and Constraints

Relational databases require you to define a schema for each table:

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

This schema includes integrity constraints:

- **Domain constraints**: Type restrictions (INT, VARCHAR, DATE), NOT NULL requirements
- **Key constraints**: Primary keys ensure uniqueness
- **Foreign-key constraints**: Enforce relationships between tables, maintain referential integrity

:::tip Key Takeaway #3
Use relational databases as your primary data store (the source of truth), as they are secure, reliable, and mature, and they support schemas, integrity constraints, foreign-key constraints, joins, ACID transactions, and a flexible query language (SQL).
:::

Schema migration tools help manage database schemas as code:

- **Flyway**: Uses standard SQL in .sql files
- **Liquibase**: Uses XML, YAML, JSON, or SQL
- **Knex.js**: Uses JavaScript DSL in .js files

These tools track which migrations have been applied and ensure your database schema matches your code.

### Example: PostgreSQL, Lambda, and Schema Migrations

In this section, you'll deploy PostgreSQL using Amazon RDS, manage schemas with Knex.js, and deploy a Lambda function that connects to PostgreSQL over TLS.

:::info Example Code
You can find all code examples in the [book's GitHub repo](https://github.com/brikis98/devops-book).
:::

The example demonstrates:

1. **Deploying RDS PostgreSQL**: Using OpenTofu to provision a managed PostgreSQL database
2. **Schema migrations**: Using Knex.js to manage database schemas as code
3. **Secure connections**: Connecting over TLS with proper certificate validation
4. **Lambda integration**: Deploying a serverless app that queries the database

Key configuration points:

```javascript
// knexfile.js - Configure TLS connection
module.exports = {
  client: 'postgresql',
  connection: async () => {
    const rdsCaCert = await fs.readFile('rds-us-east-2-ca-cert.pem');
    return {
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: {rejectUnauthorized: true, ca: rdsCaCert.toString()}
    }
  }
};
```

## Caching: Key-Value Stores and CDNs

Caching stores frequently accessed data in memory for fast retrieval. Common use cases:

- **Session data**: User login sessions, shopping carts
- **Computed results**: Expensive calculations, aggregations
- **API responses**: Reduce load on backend services

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

:::tip Key Takeaway #5
Use CDNs to cache static content, reducing latency for your users and reducing load on your servers.
:::

## File Storage: File Servers and Object Stores

### File Servers

Traditional file storage using NFS, CIFS, or SMB. Good for:

- Shared file access across servers
- Legacy application compatibility
- POSIX filesystem semantics

### Object Stores

Modern cloud-native storage (S3, Google Cloud Storage, Azure Blob Storage):

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

:::tip Key Takeaway #6
Use object stores for scalable, durable file storage, especially for static assets, backups, media files, and data lakes.
:::

## Semistructured Data and Search: Document Stores

Document stores (MongoDB, Couchbase, Amazon DocumentDB) handle semistructured data like JSON:

```json
{
  "name": "Fundamentals of DevOps",
  "author": "Yevgeniy Brikman",
  "isbn": "1098174593",
  "tags": ["DevOps", "Software Delivery", "Cloud"]
}
```

**Advantages**:

- Flexible schema (good for evolving data models)
- Native JSON support
- Horizontal scalability
- Full-text search capabilities

**Trade-offs**:

- No ACID transactions (typically)
- Limited join support
- Query language less mature than SQL

:::tip Key Takeaway #7
Use document stores for semistructured data, flexible schemas, and full-text search.
:::

## Analytics: Columnar Databases

Columnar databases (Amazon Redshift, Google BigQuery, Snowflake) optimize for analytics:

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

:::tip Key Takeaway #8
Use columnar databases for analytics, data warehousing, and queries that aggregate large datasets.
:::

## Asynchronous Processing: Queues and Streams

### Message Queues

Message queues (SQS, RabbitMQ, ActiveMQ) enable asynchronous communication:

1. Service A sends a message to the queue
2. The queue stores the message
3. Service B retrieves and processes the message
4. Service B acknowledges completion
5. The queue deletes the message

**Benefits**:

- **Decoupling**: Services don't need to know about each other
- **Load leveling**: Queue absorbs traffic spikes
- **Reliability**: Messages persist until processed
- **Retry logic**: Automatic retries on failure

:::tip Key Takeaway #9
Use message queues to decouple services, smooth out traffic spikes, and ensure reliable message delivery.
:::

### Event Streams

Event streams (Kafka, Kinesis, Pub/Sub) provide a durable log of events:

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

:::tip Key Takeaway #10
Use event streams for real-time data processing, event sourcing, and when you need multiple consumers or the ability to replay events.
:::

## Scalability and Availability

As your data and traffic grow, you need strategies to scale:

### Replication

**Read replicas**: Copy data to multiple servers for read scalability

- Primary handles writes
- Replicas handle reads
- Eventual consistency trade-off

**Multi-master replication**: Multiple servers accept writes

- Higher availability
- Complex conflict resolution
- Used in distributed databases

### Partitioning (Sharding)

Split data across multiple servers:

- **Horizontal partitioning**: Split rows (e.g., users A-M on server 1, N-Z on server 2)
- **Vertical partitioning**: Split columns (e.g., user profile on server 1, user activity on server 2)

**Benefits**: Scale beyond single-server limits

**Challenges**: Complex queries, rebalancing, operational overhead

:::tip Key Takeaway #11
Use replication for high availability and read scalability. Use partitioning when data exceeds single-server capacity.
:::

### NoSQL and NewSQL

**NoSQL databases** (Cassandra, DynamoDB, MongoDB) sacrifice some ACID properties for:

- Horizontal scalability
- High availability
- Flexible schemas
- Eventually consistent

**NewSQL databases** (CockroachDB, Google Spanner, YugabyteDB) aim to provide:

- ACID transactions
- SQL interface
- Horizontal scalability
- Distributed architecture

:::tip Key Takeaway #12
Use NoSQL and NewSQL databases when your scalability and availability requirements exceed what you can do with a relational database—but only if you can invest in the time and expertise of deploying and maintaining a distributed data store.
:::

## Backup and Recovery

### Backup Strategies

**Backup Strategies**

| Strategy | How It Works | Pros | Cons |
|----------|--------------|------|------|
| Snapshots | Point-in-time copy of entire dataset | Fast recovery, easy to understand | Storage intensive, recovery only to snapshot time |
| Continuous Backup | Ongoing copy of all changes (WAL) | Point-in-time recovery to any moment | More complex, storage for logs |
| Replication | Live copy on separate server | Fast failover, minimal data loss | Not a backup (corruption replicates) |

**Backup recommendations**:

1. **Automate everything**: Use managed services or IaC
2. **Test restores**: Backups are useless if they don't work
3. **Follow 3-2-1 rule**: 3 copies, 2 different media, 1 offsite
4. **Encrypt backups**: Protect data at rest
5. **Monitor backup status**: Alert on failures

:::tip Key Takeaway #13
Use automated, tested backup strategies. Combine snapshots, continuous backups, and replication for comprehensive protection.
:::

## Conclusion

You've now learned how to store, query, replicate, and back up your data, as per the 13 key takeaways from this chapter:

1. Keep your applications stateless. Store all your data in dedicated data stores.
2. Don't roll your own data stores; always use mature, battle-tested, proven, off-the-shelf solutions.
3. Use relational databases as your primary data store (the source of truth).
4. Manage database schemas as code using migration tools.
5. Use CDNs to cache static content, reducing latency and server load.
6. Use object stores for scalable, durable file storage.
7. Use document stores for semistructured data and full-text search.
8. Use columnar databases for analytics and data warehousing.
9. Use message queues to decouple services and ensure reliable delivery.
10. Use event streams for real-time processing and event sourcing.
11. Use replication for high availability and read scalability.
12. Use NoSQL and NewSQL databases when scalability requirements exceed traditional databases.
13. Use automated, tested backup strategies combining snapshots, continuous backups, and replication.

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
