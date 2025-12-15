---
sidebar_position: 3
title: "Chapter 8: How to Secure Communication and Storage"
description: "Learn how to protect your data and communications using encryption, hashing, secrets management, and secure protocols like TLS. Understand cryptography fundamentals and implement security best practices."
---

import { ProcessFlow, StackDiagram, CardGrid, ComparisonTable, TreeDiagram, colors } from '@site/src/components/diagrams';

# Chapter 8: How to Secure Communication and Storage

In Chapter 7, you learned about the role networking plays in security, including the importance of private networks, bastion hosts, VPCs, and service meshes. But what happens if a malicious actor finds a way to intercept the data you transmit over the network? Or what if they manage to get access to that data when you write it to a hard drive?

Networking provides one important layer of defense, but as you also saw in Chapter 7, you need multiple layers so you're never one mistake away from disaster (defense in depth). In this chapter, you'll learn about two more layers of defense:

- **Secure storage**: Protect your data from unauthorized snooping or interference by using encryption at rest, secrets management, password storage, and key management
- **Secure communication**: Protect your communication over the network from unauthorized snooping or interference by using encryption in transit and secure transport protocols

As you go through these topics, this chapter will walk you through hands-on examples, including how to encrypt data with AES and RSA; verify file integrity with SHA-256, HMAC, and digital signatures; store secrets in AWS Secrets Manager; and serve traffic over HTTPS by using TLS certificates from Let's Encrypt.

## Table of Contents

1. [Cryptography Primer](#1-cryptography-primer)
   - [Encryption](#11-encryption)
   - [Hashing](#12-hashing)
2. [Secure Storage](#2-secure-storage)
   - [Secrets Management](#21-secrets-management)
   - [Encryption at Rest](#22-encryption-at-rest)
3. [Secure Communication](#3-secure-communication)
   - [Transport Layer Security](#31-transport-layer-security)
   - [Example: HTTPS with Let's Encrypt and AWS Secrets Manager](#32-example-https-with-lets-encrypt-and-aws-secrets-manager)
   - [End-to-End Encryption](#33-end-to-end-encryption)

## 1. Cryptography Primer

**In plain English:** Cryptography is the science of keeping secrets. It's like having a magical lockbox that only you and your trusted friends can open.

**In technical terms:** Cryptography is the study of how to protect data from adversaries using mathematical algorithms to provide confidentiality (keeping data secret), integrity (preventing unauthorized modifications), and authenticity (verifying the source).

**Why it matters:** Without cryptography, anyone could read your passwords, intercept your credit card numbers, or impersonate your bank. Modern digital life depends entirely on cryptography.

Cryptography provides three key benefits (the CIA triad):

- **Confidentiality**: Keep your data secret, so only those you intend to see it can see it
- **Integrity**: Ensure that your data can't be modified in any way by unauthorized parties
- **Authenticity**: Ensure that you are really communicating with the intended parties

:::warning Do Not Roll Your Own Cryptography
Anyone, from the most clueless amateur to the best cryptographer, can create an algorithm that he himself can't break. It's not even hard. What is hard is creating an algorithm that no one else can break, even after years of analysis.

— Bruce Schneier, "Memo to the Amateur Cipher Designer"

Cryptography isn't like other software. With most software, you are dealing with users who are mildly engaged at best, and most bugs are minor. With cryptography, you are dealing with determined adversaries who are doing everything they can to defeat you, and any bug found by any of these adversaries can be catastrophic.
:::

:::tip Key Takeaway #1
Don't roll your own cryptography. Always use mature, battle-tested, proven algorithms and implementations.
:::

### 1.1. Encryption

**In plain English:** Encryption is like putting your message in a locked box. Only someone with the right key can unlock it and read what's inside.

**In technical terms:** Encryption transforms plaintext data into ciphertext using a cipher (algorithm) and an encryption key. The ciphertext is unreadable without the key. Decryption reverses the process.

**Why it matters:** Encryption ensures that even if attackers intercept your data, they can't read it without the encryption key.

<ProcessFlow
  title="Encryption Process"
  description="How encryption transforms plaintext into ciphertext and back"
  steps={[
    {
      name: 'Plaintext Input',
      description: 'Original readable data',
      example: 'Hello, World!',
      color: colors.blue
    },
    {
      name: 'Encryption',
      description: 'Apply cipher with encryption key',
      example: 'AES-256 with secret key',
      color: colors.purple
    },
    {
      name: 'Ciphertext',
      description: 'Encrypted unreadable data',
      example: 'U2Fsd...abc=',
      color: colors.red
    },
    {
      name: 'Decryption',
      description: 'Apply cipher with decryption key',
      example: 'AES-256 with secret key',
      color: colors.purple
    },
    {
      name: 'Plaintext Output',
      description: 'Recovered original data',
      example: 'Hello, World!',
      color: colors.green
    }
  ]}
/>

**Kerckhoffs's Principle**

**In plain English:** A good lock should be secure even if everyone knows exactly how it works. Only the key should be secret.

**In technical terms:** The system should remain secure even if everything about the system, except the encryption key, is public knowledge.

**Why it matters:** Security through obscurity (keeping how your system works a secret) doesn't work in the real world. Attackers will eventually figure it out.

Most modern cryptography aims for **computational security**, where breaking the cipher requires so much time and resources that it's not feasible in practice. For a 128-bit key, trying all possible keys would take the world's fastest supercomputer far longer than the age of the universe.

There are three types of encryption:

1. Symmetric-key encryption
2. Asymmetric-key encryption
3. Hybrid encryption

#### 1.1.1. Symmetric-Key Encryption

**In plain English:** Both parties use the same key to lock and unlock the box. Like sharing a house key with your roommate.

**In technical terms:** Symmetric-key encryption uses a single encryption key for both encryption and decryption. Both parties must possess the same secret key.

**Why it matters:** It's fast and efficient, perfect for encrypting large amounts of data. However, securely sharing the key is challenging.

<CardGrid
  columns={2}
  cards={[
    {
      title: "AES",
      description: "Advanced Encryption Standard",
      items: [
        "Winner of NIST competition",
        "Officially recommended by US government",
        "Free to use for any purpose",
        "Extremely fast (CPU instruction sets)",
        "20+ years of analysis, still secure",
        "Use AES-GCM (includes MAC)"
      ],
      color: colors.blue
    },
    {
      title: "ChaCha",
      description: "ChaCha20-Poly1305",
      items: [
        "Winner of eSTREAM competition",
        "Free to use for any purpose",
        "Faster than AES on general hardware",
        "More secure against certain attacks",
        "Not as widely supported as AES",
        "Includes Poly1305 MAC"
      ],
      color: colors.green
    }
  ]}
/>

**The key distribution problem:** If you try to send the encryption key as plaintext, a third party could intercept it. If you try to encrypt the key, you need another encryption key, bringing you back to square one. Until the 1970s, the only solution was to share keys via an out-of-band channel, such as exchanging them in person.

#### 1.1.2. Asymmetric-Key Encryption

**In plain English:** You give everyone a public key that can only lock the box, but keep a private key that unlocks it. Anyone can send you locked messages, but only you can read them.

**In technical terms:** Asymmetric-key encryption (public-key encryption) uses a pair of mathematically related keys: a public key for encryption (can be shared with anyone) and a private key for decryption (must be kept secret).

**Why it matters:** It solves the key distribution problem. You can securely communicate with total strangers without pre-sharing keys.

<CardGrid
  columns={2}
  cards={[
    {
      title: "RSA",
      description: "Rivest-Shamir-Adleman",
      items: [
        "One of the first asymmetric algorithms",
        "Based on prime-number factorization",
        "Ubiquitous, widely supported",
        "Starting to show its age",
        "Use RSA-OAEP (addresses vulnerabilities)",
        "Relatively easy to understand"
      ],
      color: colors.blue
    },
    {
      title: "Elliptic Curve",
      description: "ECIES",
      items: [
        "More recent approach",
        "Based on elliptic curve math",
        "More secure design and implementation",
        "Use ECIES (hybrid approach)",
        "Combines asymmetric + symmetric",
        "Better security properties"
      ],
      color: colors.green
    }
  ]}
/>

**Trade-offs:** Asymmetric-key encryption is considerably slower than symmetric-key encryption and is usually limited in the size of messages you can encrypt.

#### 1.1.3. Hybrid Encryption

**In plain English:** Use the slow but convenient public-key method to securely exchange a fast secret key, then use that fast key for all actual messages.

**In technical terms:** Hybrid encryption combines asymmetric and symmetric encryption. Use asymmetric-key encryption to exchange a randomly generated session key, then use symmetric-key encryption with that session key for all subsequent messages.

**Why it matters:** You get the best of both worlds: the convenience of asymmetric encryption for key exchange and the performance of symmetric encryption for data.

Hybrid encryption provides several advantages:

- **No reliance on out-of-band channels**: You get to use symmetric-key encryption without needing to set up a secure channel ahead of time
- **Performance**: Most encryption is done with fast symmetric-key encryption, with no limits on message sizes
- **Forward secrecy**: Even if an attacker compromises your private key later, they can't decrypt past conversations encrypted with ephemeral session keys

#### 1.1.4. Example: Encryption and Decryption with OpenSSL

:::warning Don't Use OpenSSL to Encrypt Data in Production
The OpenSSL binary is available on most systems, so it's convenient for learning and experimenting, but I do not recommend using it to encrypt data for production. The algorithms it supports are dated and incomplete (e.g., it doesn't support AES-GCM), and the defaults it exposes are insecure and error prone. For production use cases, use mature cryptography libraries built into programming languages (e.g., the Go crypto library) or CLI tools such as GPG or age.
:::

**Symmetric encryption example:**

Run the following command to encrypt the text "Hello, World," using AES:

```bash
$ echo "Hello, World" | openssl aes-128-cbc -base64 -pbkdf2
U2FsdGVkX19V9Ax8Y/AOJT4nbRwr+3W7cyGgUIunkac=
```

OpenSSL will prompt you for a passphrase (twice). The output is the ciphertext - completely unreadable.

To decrypt it:

```bash
$ echo "<CIPHERTEXT>" | openssl aes-128-cbc -d -base64 -pbkdf2
Hello, World
```

**Asymmetric encryption example:**

First, create a key pair:

```bash
$ openssl genrsa -out private-key.pem 2048
$ openssl rsa -in private-key.pem -pubout -out public-key.pem
```

This creates a 2,048-bit RSA private key and the corresponding public key.

Encrypt with the public key:

```bash
$ echo "Hello, World" | \
  openssl pkeyutl -encrypt -pubin -inkey public-key.pem | \
  openssl base64
YAYUStgMyv0OH7ZPSMcibbouNwLfTWKr...
```

Decrypt with the private key:

```bash
$ echo "<CIPHERTEXT>" | \
  openssl base64 -d | \
  openssl pkeyutl -decrypt -inkey private-key.pem
Hello, World
```

> Perl—The only language that looks the same before and after RSA encryption.
>
> — Keith Bostic

### 1.2. Hashing

**In plain English:** Hashing is like creating a unique fingerprint for a piece of data. Any change to the data, even one tiny bit, creates a completely different fingerprint. You can't recreate the original from the fingerprint.

**In technical terms:** A hash function takes input of any size and produces a fixed-size output (hash value or digest) in a deterministic manner. It's a one-way transformation: you cannot get back the original input from the output.

**Why it matters:** Hashing lets you verify data hasn't been tampered with and store passwords securely without actually storing the passwords themselves.

**Hash Functions vs. Encryption**

| Characteristic | Hash Functions | Encryption |
|----------------|----------------|------------|
| Direction | One-way (irreversible) | Two-way (reversible) |
| Output Size | Fixed (e.g., 256 bits) | Variable (matches input) |
| Key Required | No key needed | Requires encryption key |
| Deterministic | Same input → Same output | Same input + key → Same output |
| Use Case | Integrity verification, passwords | Confidentiality, secure communication |
| Example | SHA-256, SHA-3 | AES, RSA |

Cryptographic hash functions have special security properties:

- **Pre-image resistance**: Given a hash value, there's no way to figure out the original input (other than brute force)
- **Second pre-image resistance**: Given a hash value, there's no way to find any input that produces this output
- **Collision resistance**: There's no way to find any two different inputs that produce the same hash value

<CardGrid
  columns={2}
  cards={[
    {
      title: "SHA-2 and SHA-3",
      description: "Secure Hash Algorithm",
      items: [
        "Created by US NSA",
        "Part of NIST standards",
        "SHA-1 is deprecated (insecure)",
        "SHA-2: SHA-256, SHA-512",
        "SHA-3: SHA3-256, SHA3-512",
        "Widely supported and trusted"
      ],
      color: colors.blue
    },
    {
      title: "SHAKE / cSHAKE",
      description: "Extendable Output Functions",
      items: [
        "Based on SHA-3",
        "Variable-length output",
        "SHAKE: standard version",
        "cSHAKE: customizable version",
        "Useful for specific contexts",
        "More flexible than fixed-length"
      ],
      color: colors.green
    }
  ]}
/>

Cryptographic hash functions have four primary uses:

1. Verification of the integrity of messages and files
2. Message authentication codes (MACs)
3. Authenticated encryption
4. Digital signatures

#### 1.2.1. Verification of Integrity

**In plain English:** When you download a file, you can check its fingerprint against the official one to make sure no one tampered with it.

**In technical terms:** Compute the hash of a file and compare it to the official hash value. If they match, the file is identical. If even one bit differs, the hash will be completely different.

**Why it matters:** Ensures that downloads weren't corrupted or maliciously modified during transmission.

#### 1.2.2. Message Authentication Codes (MACs)

**In plain English:** A MAC is like a tamper-evident seal. You combine your data with a secret key to create a seal that proves both that the data came from you and that it hasn't been changed.

**In technical terms:** A MAC combines a hash with a secret key to create an authentication tag for data. This allows you to verify both integrity (no modifications) and authenticity (came from someone with the secret key).

**Why it matters:** Prevents attackers from modifying your data or forging messages pretending to be you.

Standard MAC algorithms:

- **HMAC**: Hash-based MAC using various hash functions (e.g., HMAC-SHA256)
- **KMAC**: A MAC based on cSHAKE

#### 1.2.3. Authenticated Encryption

**In plain English:** Combine encryption (to keep data secret) with a tamper-evident seal (to prevent modifications). Both protection layers together.

**In technical terms:** Authenticated encryption combines symmetric-key encryption with a MAC. Encryption provides confidentiality, and the MAC provides integrity and authenticity.

**Why it matters:** Without authenticated encryption, attackers could modify your encrypted data in subtle ways without you noticing.

Both AES-GCM and ChaCha20-Poly1305 are **authenticated encryption with associated data (AEAD)** protocols that include a MAC.

#### 1.2.4. Digital Signatures

**In plain English:** A digital signature is like signing a document, but impossible to forge. It proves the message came from you and wasn't altered.

**In technical terms:** Combine a hash function with asymmetric-key encryption. The sender creates a signature using their private key and a hash of the message. The receiver validates the signature using the sender's public key.

**Why it matters:** Provides non-repudiation (the sender can't deny sending the message) and guarantees the message wasn't tampered with.

<ProcessFlow
  title="Digital Signature Process"
  description="How digital signatures provide authenticity and integrity"
  steps={[
    {
      name: 'Create Message',
      description: 'Bob writes a message',
      example: 'Hello, World!',
      color: colors.blue
    },
    {
      name: 'Generate Signature',
      description: 'Hash message + sign with private key',
      example: "Bob's private key",
      color: colors.purple
    },
    {
      name: 'Send Message + Signature',
      description: 'Both sent to Alice',
      example: 'Message + Signature',
      color: colors.yellow
    },
    {
      name: 'Verify Signature',
      description: 'Validate with public key',
      example: "Bob's public key",
      color: colors.purple
    },
    {
      name: 'Confirm Authenticity',
      description: 'Message is authentic and unmodified',
      example: '✓ Valid',
      color: colors.green
    }
  ]}
/>

#### 1.2.5. Example: File Integrity, HMAC, and Signatures with OpenSSL

**File integrity check:**

Create a file and calculate its SHA-256 hash:

```bash
$ echo "Hello, World" > file.txt
$ openssl sha256 file.txt
SHA2-256(file.txt)= 8663bab6d124806b...
```

Now change just one character:

```bash
$ echo "Hello, world" > file.txt
$ openssl sha256 file.txt
SHA2-256(file.txt)= 37980c33951de6b0...
```

The hash is completely different!

**HMAC example:**

Use a password as a secret key to generate an authentication tag:

```bash
$ openssl sha256 -hmac password file.txt
HMAC-SHA2-256(file.txt)= 3b86a735fa627cb6...
```

Changing the file or using a different password produces a completely different tag.

**Digital signature example:**

Sign a file with your private key:

```bash
$ openssl sha256 -sign private-key.pem -out file.txt.sig file.txt
```

Verify the signature with your public key:

```bash
$ openssl sha256 -verify public-key.pem -signature file.txt.sig file.txt
Verified OK
```

If you modify the file, signature, or keys, verification fails:

```bash
$ echo "hello world" > file.txt
$ openssl sha256 -verify public-key.pem -signature file.txt.sig file.txt
Verification failure
```

## 2. Secure Storage

**In plain English:** Secure storage is about protecting data when it's saved on a hard drive, just like putting valuables in a safe.

**In technical terms:** Secure storage (encryption at rest) protects data written to persistent storage using encryption, ensuring confidentiality, integrity, and authenticity even if unauthorized parties gain physical or network access.

**Why it matters:** Data breaches often occur not from live database attacks, but from attackers finding old copies of data on forgotten hard drives or poorly protected backup systems.

A prerequisite to secure data storage is being able to manage secrets securely, including encryption keys, passwords, tokens, and certificates. We'll start with secrets management, then move to encryption at rest.

### 2.1. Secrets Management

**In plain English:** Secrets management is about keeping your passwords, keys, and other sensitive information locked up properly, not written on sticky notes or stored in plain text files.

**In technical terms:** Secrets management is the practice of securely storing, accessing, and managing sensitive data (encryption keys, passwords, API tokens, certificates) using specialized tools that provide encryption, access control, rotation, and audit logging.

**Why it matters:** If secrets are compromised, attackers can access your systems, databases, and customer data. Proper secrets management is fundamental to security.

The first two rules of secrets management:

1. **Do not store secrets as plaintext.**
2. **DO NOT STORE SECRETS AS PLAINTEXT.**

:::warning Never Store Secrets as Plaintext
Do not put plaintext secrets directly into your code and check them into version control. Do not send plaintext secrets to colleagues through email or chat. Do not store your plaintext passwords in a .txt file on your desktop or in Google Docs.

If you store secrets in plaintext on a hard drive, you may end up with copies of those secrets scattered across thousands of computers: developer machines, version control systems (GitHub), CI systems (GitHub Actions), deployment tools (HashiCorp Cloud Platform), hosting systems (AWS), backup systems (iCloud), and so on.
:::

:::tip Key Takeaway #2
Do not store secrets as plaintext.
:::

The secure way to store secrets is in a **secrets management tool**. Which tool depends on the type of secret:

- **Personal secrets**: Belong to a single person or are shared with several people (passwords for websites, SSH keys, credit card numbers)
- **Infrastructure secrets**: Need to be exposed to servers running your software (database passwords, API keys, TLS certificates)
- **Customer secrets**: Belong to customers using your software (user passwords, PII, PHI)

:::tip Key Takeaway #3
Avoid storing secrets whenever possible by using SSO, third-party services, or just not storing the data at all.
:::

#### 2.1.1. Personal Secrets

**In plain English:** Use a password manager like a super-secure digital vault that remembers all your passwords so you only need to remember one master password.

**In technical terms:** Use a password manager (1Password, Bitwarden, macOS password manager) that provides symmetric-key encryption for personal secrets, supports MFA, and uses end-to-end encryption.

**Why it matters:** Password managers let you use unique, strong passwords for every account without needing to remember them all.

:::tip Key Takeaway #4
Protect personal secrets, such as passwords and credit card numbers, by storing them in a password manager.
:::

**Creating a strong master password:**

Use **Diceware** to create a unique, long, hard-to-guess password that's still memorable:

- Take a list of thousands of easy-to-remember English words
- Roll dice to pick four to six words at random
- Glue them together to create a password
- Example: "correct-horse-battery-staple"

Key factors for password strength:

- **Unique**: Never reuse passwords across accounts
- **Long**: Minimum 15 characters (breaking an 8-character password takes hours; a 15-character password takes centuries)
- **Hard to guess**: Avoid common phrases and patterns

Make sure your password manager uses **end-to-end encryption** so that it's impossible for the vendor (or anyone else) to read your data, even if stored on their servers.

#### 2.1.2. Infrastructure Secrets

**In plain English:** Store infrastructure secrets (database passwords, API keys) in specialized vaults that your servers can access automatically, with built-in security features like automatic expiration and audit logs.

**In technical terms:** Use a secret store designed for infrastructure that supports temporary secrets, machine authentication, encryption at rest, access control, audit logging, and secret rotation.

**Why it matters:** Infrastructure secrets need different handling than personal secrets—they're accessed by automated systems, need to rotate regularly, and require comprehensive audit trails.

There are two primary kinds of secret stores for infrastructure:

**Key Management System (KMS)**

- Designed to securely store encryption keys
- Performs encryption operations on the KMS server
- Encryption keys never leave the KMS server
- Options: Hardware Security Modules (HSMs from Thales, Yubico), managed services (AWS KMS, Azure Key Vault)
- Often uses **envelope encryption**: Generate data keys for most encryption/decryption, use KMS to manage a root key that encrypts the data keys

**General-Purpose Secret Store**

- Stores various types of secrets (keys, passwords, certificates)
- Performs various cryptographic functions (encryption, hashing, signing)
- Options: HashiCorp Vault/OpenBao, AWS Secrets Manager, Google Cloud Secret Manager, Kubernetes Secrets

:::tip Key Takeaway #5
Protect infrastructure secrets, such as database passwords and TLS certificates, by using a KMS and/or a general-purpose secret store.
:::

Centralized secret stores offer advantages:

- **Audit logging**: Record every secret access
- **Revoking and rotating secrets**: Centrally revoke compromised secrets or automatically rotate them regularly
- **On-demand and ephemeral secrets**: Generate secrets only when needed, with automatic expiration (e.g., Just-in-Time SSH access that expires in 24 hours)

#### 2.1.3. Customer Secrets and Password Storage

**In plain English:** Never store actual user passwords. Instead, store a special kind of fingerprint (hash) that lets you verify the password is correct without being able to reverse-engineer the original password.

**In technical terms:** Store the hash of (password + salt + pepper) using specialized password hash functions (Argon2id, scrypt, bcrypt). When users log in, hash their input and compare it to the stored hash.

**Why it matters:** Even if attackers steal your database, they can't recover the original passwords. This protects your users even if your security fails.

User passwords require special techniques for two reasons:

1. Attackers are trying to compromise passwords all the time (46% of Americans had passwords stolen in 2023; RockYou2024 leak exposed nearly 10 billion passwords)
2. You don't need to store the original password at all

**How to securely store user passwords:**

**Store the hash of the password**

- When the user creates a password, feed it into a cryptographic hash function
- Store the hash value, throw away the original
- When the user tries to log in, hash their input and compare to the stored hash
- If they match, the user typed the correct password

**Use specialized password hash functions**

Instead of standard hash functions (SHA-2), use specialized password hash functions:

- **Argon2** (specifically Argon2id variant) - most recommended
- **scrypt**
- **bcrypt**
- **PBKDF2**

These functions are intentionally designed to run slowly (1-2 seconds vs. less than 1 millisecond for SHA-256) and consume lots of memory, making brute-force attacks much harder.

**Use salt and pepper**

- **Salt**: A unique, random string generated for each user, stored in plaintext next to their data
- **Pepper**: A shared string for all users, stored encrypted separately (e.g., in a secret store)
- Hash the combination: `hash(password + salt + pepper)`

This defeats **dictionary attacks** (trying common words) and **rainbow table attacks** (precomputed tables of password hashes). Attackers would need to:

- Break into two systems (user database for hashes/salts, secret store for pepper)
- Create one table per user (for each unique salt)
- With slow password hash functions, this is not feasible

:::tip Key Takeaway #6
Never store user passwords (encrypted or otherwise). Instead, use a password hash function to compute a hash of each password with a salt and pepper, and store those hash values.
:::

### 2.2. Encryption at Rest

**In plain English:** Encryption at rest is like storing your data in a locked safe, even when it's sitting on a hard drive. If someone steals the hard drive, they still can't read the data.

**In technical terms:** Encryption at rest encrypts data written to persistent storage (hard drives, databases) so that unauthorized access to the storage medium doesn't expose the data.

**Why it matters:** Data breaches often happen not from sophisticated attacks on live databases, but from attackers finding old, poorly protected copies of data on backup systems, developer machines, or forgotten servers.

Why stored data is vulnerable:

- **Many copies**: Data exists in databases, replicas, caches, queues, streaming platforms, data warehouses, and backups
- **Long time frames, little monitoring**: Data sits on hard drives for years, often forgotten, giving attackers time to find vulnerabilities

You can encrypt data at rest at three levels:

1. Full-disk encryption
2. Data store encryption
3. Application-level encryption

#### 2.2.1. Full-Disk Encryption

**In plain English:** Full-disk encryption encrypts everything on a hard drive automatically. If someone steals your laptop, they can't read any files without your password.

**In technical terms:** Full-disk encryption encrypts all data on a hard drive (typically using AES) with an encryption key derived from your login password. It's a type of transparent data encryption (TDE)—automatic encryption/decryption while you're logged in.

**Why it matters:** Protects against physical theft of hard drives, but doesn't protect against attackers who get access to a live (authenticated) system.

Options:

- **OS-level**: macOS FileVault, Windows BitLocker
- **Hardware-level**: Self-encrypting drives (SEDs)
- **Cloud-level**: AWS EBS volumes with AWS KMS keys, Google Cloud Compute Volumes with Cloud KMS keys

#### 2.2.2. Data Store Encryption

**In plain English:** The database software itself encrypts data before writing it to disk. Even if someone gets access to your server, they can't read the database files without the encryption key.

**In technical terms:** Data stores encrypt data at the application layer using TDE, typically with encryption keys from a KMS. The data store encrypts either the entire database or specific parts (e.g., one column).

**Why it matters:** Provides higher protection than full-disk encryption—protects against attackers with OS access, but not against attackers who can authenticate to the database itself.

Options:

- **Database-level**: MySQL Enterprise TDE, pg_tde for PostgreSQL
- **Cloud-level**: AWS RDS encryption with AWS KMS, Azure SQL Database encryption with Azure Key Vault

#### 2.2.3. Application-Level Encryption

**In plain English:** Your application code encrypts data before saving it anywhere. Even if someone steals your database, they get only encrypted gibberish.

**In technical terms:** Implement encryption in your application code. Fetch an encryption key from a secret store, use AES to encrypt data, then store the ciphertext in your database.

**Why it matters:** Provides the highest level of protection—works even if attackers compromise the database. Also allows granular control (different keys for different users/customers/tables).

Advantages:

- Protects against database compromise
- Granular control over encryption
- Can securely store data in untrusted systems

Drawbacks:

- Requires nontrivial application code changes
- Data is opaque to data stores (harder to query, no full-text search)

:::tip Key Takeaway #7
You can encrypt data at rest by using full-disk encryption, data store encryption, and application-level encryption.
:::

<TreeDiagram
  title="Encryption at Rest Hierarchy"
  description="Different levels of encryption protection"
  root={{
    label: 'Encryption at Rest',
    children: [
      {
        label: 'Full-Disk Encryption',
        description: 'Protects against physical theft',
        children: [
          { label: 'macOS FileVault' },
          { label: 'Windows BitLocker' },
          { label: 'Linux LUKS' },
          { label: 'Cloud: AWS EBS, GCP Volumes' }
        ]
      },
      {
        label: 'Data Store Encryption',
        description: 'Protects at database level',
        children: [
          { label: 'MySQL TDE' },
          { label: 'PostgreSQL pg_tde' },
          { label: 'Cloud: AWS RDS, Azure SQL' }
        ]
      },
      {
        label: 'Application-Level',
        description: 'Maximum protection and control',
        children: [
          { label: 'Encrypt before storing' },
          { label: 'Per-user encryption keys' },
          { label: 'Granular control' }
        ]
      }
    ]
  }}
/>

**General recommendation:** Enable full-disk encryption for all computers and servers by default, and enable data store encryption for all data stores by default. Reserve application-level encryption for when the highest security is necessary or no other encryption is supported.

## 3. Secure Communication

**In plain English:** Secure communication is about protecting your messages as they travel across the internet, like sending a letter in a locked, tamper-evident envelope.

**In technical terms:** Secure communication (encryption in transit) protects data transmitted over networks using encryption protocols to ensure confidentiality, integrity, and authenticity.

**Why it matters:** Without encryption in transit, attackers can intercept network traffic, read your data, modify it, or impersonate you.

Common protocols for encryption in transit:

- **TLS**: Secures web browsing (HTTPS), server-to-server communications, instant messaging, email, some VPNs
- **SSH**: Secures remote terminal connections
- **IPsec**: Secures some VPN connections

### 3.1. Transport Layer Security (TLS)

**In plain English:** TLS is the technology that makes the lock icon appear in your browser's address bar. It ensures your communication with a website is private and that you're really talking to the intended website, not an imposter.

**In technical terms:** TLS is a cryptographic protocol that uses hybrid encryption, authenticated encryption, and digital certificates to provide confidentiality, integrity, and authenticity for network communications, especially protecting against man-in-the-middle attacks.

**Why it matters:** TLS makes secure internet commerce possible. Without it, anyone could steal your credit card numbers, passwords, or personal information.

Every time you browse to an HTTPS URL, you're using TLS. TLS replaced SSL (Secure Sockets Layer), which has known vulnerabilities. Use TLS 1.3 or 1.2; all older versions are deprecated.

**How TLS provides security:**

- **Confidentiality**: Encrypts all messages with hybrid encryption
- **Integrity**: Uses authenticated encryption with a MAC for every message
- **Replay protection**: Includes a nonce (incremented number) in every message
- **Authenticity**: Uses asymmetric-key encryption and certificates

**The TLS handshake:**

<ProcessFlow
  title="TLS Handshake Process"
  description="The steps in establishing a secure TLS connection"
  steps={[
    {
      name: 'Client Hello',
      description: 'Client sends supported TLS versions and algorithms',
      example: 'TLS 1.3, AES-GCM, RSA',
      color: colors.blue
    },
    {
      name: 'Server Hello',
      description: 'Server chooses version and algorithms',
      example: 'Selected: TLS 1.3, AES-256-GCM',
      color: colors.purple
    },
    {
      name: 'Certificate Exchange',
      description: 'Server sends TLS certificate with public key',
      example: 'Certificate + CA signature',
      color: colors.yellow
    },
    {
      name: 'Verify Certificate',
      description: 'Client validates certificate against trusted CAs',
      example: 'Check domain, signature, expiry',
      color: colors.orange
    },
    {
      name: 'Key Exchange',
      description: 'Generate and exchange session keys',
      example: 'Random session key (encrypted)',
      color: colors.purple
    },
    {
      name: 'Secure Communication',
      description: 'All messages encrypted with session key',
      example: 'AES-256-GCM encryption',
      color: colors.green
    }
  ]}
/>

The handshake has three phases:

1. **Negotiation**: Client and server agree on TLS version and cryptographic algorithms
2. **Authentication**: Verify identities to prevent man-in-the-middle attacks
3. **Key exchange**: Securely exchange randomly generated encryption keys using asymmetric-key encryption

**Chain of trust and certificate authorities:**

**In plain English:** Your browser comes with a built-in list of trusted organizations (CAs). When you visit a website, it shows you a certificate signed by one of these trusted organizations, proving the site is legitimate.

**In technical terms:** TLS establishes a chain of trust starting from hardcoded root certificate authorities (CAs). Browsers and OSs come with certificates for trusted root CAs (VeriSign, DigiCert, Let's Encrypt, Amazon, Google). These CAs can sign certificates for websites or intermediate CAs.

**Why it matters:** The chain of trust solves the problem of "how do I know this is really google.com?" without falling into infinite loops of needing to authenticate the authentication.

**Getting a TLS certificate:**

<ProcessFlow
  title="Getting a TLS Certificate"
  description="The process of obtaining a TLS certificate from a Certificate Authority"
  steps={[
    {
      name: 'Create CSR',
      description: 'Certificate Signing Request',
      example: 'Domain name, public key, organization info',
      color: colors.blue
    },
    {
      name: 'Prove Ownership',
      description: 'CA verifies you own the domain',
      example: 'Host file at URL or add DNS record',
      color: colors.purple
    },
    {
      name: 'CA Validates',
      description: 'CA checks your proof',
      example: 'ACME protocol verification',
      color: colors.yellow
    },
    {
      name: 'Certificate Issued',
      description: 'CA signs your certificate',
      example: 'Your data + CA signature',
      color: colors.green
    }
  ]}
/>

Modern CAs use the **ACME protocol** for domain verification. The CA asks you to prove ownership by either:

- Hosting a file with specific contents at a specific URL in your domain
- Adding a specific DNS record to your domain

:::tip Key Takeaway #8
You can encrypt data in transit by using TLS. You get a TLS certificate from a certificate authority.
:::

**Types of PKI (Public-Key Infrastructure):**

- **Web PKI**: For public internet HTTPS (use Let's Encrypt, ZeroSSL, AWS Certificate Manager, or buy from traditional CAs like DigiCert)
- **Private PKI**: For microservices (use service mesh, HashiCorp Vault/OpenBao, step-ca, AWS Private CA, Google CA Service)

### 3.2. Example: HTTPS with Let's Encrypt and AWS Secrets Manager

In this section, you'll get hands-on practice with TLS certificates and secrets management:

1. Get a TLS certificate from Let's Encrypt
2. Store the TLS certificate in AWS Secrets Manager
3. Deploy EC2 instances that use the TLS certificate

#### 3.2.1. Get a TLS Certificate from Let's Encrypt

Install Certbot (minimum version 2.11):

```bash
$ brew install certbot  # macOS
```

Create a temporary folder:

```bash
$ mkdir -p /tmp/certs
$ cd /tmp/certs
```

Request a TLS certificate for your domain:

```bash
$ certbot certonly --manual \
    --config-dir . \
    --work-dir . \
    --logs-dir . \
    --domain www.<YOUR-DOMAIN> \
    --cert-name example \
    --preferred-challenges=dns
```

Certbot will prompt you to prove domain ownership by creating a DNS TXT record. Head to Route 53, create the record with the value Certbot provides, wait a minute or two for propagation, then press Enter.

If successful, Certbot will issue a TLS certificate:

```
Successfully received certificate.
Certificate is saved at: /tmp/certs/live/example/fullchain.pem
Key is saved at: /tmp/certs/live/example/privkey.pem
```

View the certificate details:

```bash
$ openssl x509 -noout -text -in /tmp/certs/live/example/fullchain.pem
Certificate:
  Data:
    Issuer: C=US, O=Let's Encrypt, CN=E6
    Validity
      Not After : Nov 18 14:24:35 2024 GMT
    Subject: CN=www.fundamentals-of-devops-example.com
  Signature Value:
    30:65:02:31:00:a3:25:e2:18:8e:06:80:5f:9c:05:df:f0:4e:
    (... truncated ...)
```

#### 3.2.2. Store the TLS Certificate in AWS Secrets Manager

:::warning AWS Secrets Manager Is Not Part of the AWS Free Tier
AWS Secrets Manager offers a 30-day free trial, but each secret costs $0.40 per month (prorated) after the trial.
:::

Format the certificate and private key as JSON using jq:

```bash
$ CERTS_JSON=$(jq -n -c -r \
    --arg cert "$(cat live/example/fullchain.pem)" \
    --arg key "$(cat live/example/privkey.pem)" \
    '{cert:$cert,key:$key}')
```

Store in AWS Secrets Manager:

```bash
$ aws secretsmanager create-secret \
    --region us-east-2 \
    --name certificate \
    --secret-string "$CERTS_JSON"
```

Verify in the AWS Secrets Manager console, then delete the local copy:

```bash
$ certbot delete \
    --config-dir . \
    --work-dir . \
    --logs-dir .
```

#### 3.2.3. Deploy EC2 Instances that Use the TLS Certificate

:::info Example Code
You can find all code examples in the [book's GitHub repo](https://github.com/brikis98/devops-book).
:::

Create a new folder and copy your Chapter 7 code:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch8/tofu/live
$ cp -r ch7/tofu/live/ec2-dns ch8/tofu/live/ec2-dns-tls
```

Update `ec2-dns-tls/main.tf`:

```hcl
module "instances" {
  source = "brikis98/devops/book//modules/ec2-instances"
  version = "1.0.0"

  name           = "ec2-dns-example"
  num_instances  = 3
  instance_type  = "t2.micro"
  ami_name       = "sample-app-tls-packer-*"  # Use the TLS AMI
  http_port      = 443  # Switch to port 443
  user_data      = file("${path.module}/user-data.sh")
}

# Attach IAM policy to allow reading the certificate
resource "aws_iam_role_policy" "tls_cert_access" {
  role   = module.instances.iam_role_name
  policy = data.aws_iam_policy_document.tls_cert_access.json
}

# Look up the certificate secret
data "aws_secretsmanager_secret" "certificate" {
  name = "certificate"
}

# Define the IAM policy
data "aws_iam_policy_document" "tls_cert_access" {
  statement {
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [data.aws_secretsmanager_secret.certificate.arn]
  }
}
```

Copy your Packer template:

```bash
$ cp -r ch3/packer ch8/packer
```

Add `package.json` in `packer/sample-app`:

```json
{
  "name": "sample-app-packer",
  "version": "0.0.1",
  "description": "Sample app for 'Fundamentals of DevOps and Software Delivery'",
  "author": "Yevgeniy Brikman"
}
```

Install the AWS SDK:

```bash
$ cd ch8/packer/sample-app
$ npm install --save @aws-sdk/client-secrets-manager
```

Update `app.js`:

```javascript
const https = require('https');  // Use https instead of http

const secretsMgr = require('@aws-sdk/client-secrets-manager');
const client = new secretsMgr.SecretsManagerClient({region: 'us-east-2'});

(async () => {
  // Fetch the TLS certificate from AWS Secrets Manager
  const response = await client.send(new secretsMgr.GetSecretValueCommand({
    SecretId: 'certificate'
  }));

  // Parse the JSON
  const options = JSON.parse(response.SecretString);

  // Create HTTPS server with the certificate
  const server = https.createServer(options, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');
  });

  // Listen on port 443
  const port = process.env.PORT || 443;
  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
})();
```

Update `install-node.sh`:

```bash
sudo setcap 'cap_net_bind_service=+ep' "$(readlink -f "$(which node)")"

sudo adduser app-user
sudo mv /tmp/sample-app /home/app-user
sudo npm ci --only=production --prefix /home/app-user/sample-app
sudo chown -R app-user /home/app-user/sample-app
sudo npm install pm2@latest -g
eval "$(sudo -u app-user pm2 startup -u app-user | tail -n1)"
```

Update the Packer template in `sample-app.pkr.hcl`:

```hcl
source "amazon-ebs" "amazon-linux" {
  ami_name        = "sample-app-tls-packer-${uuidv4()}"
  ami_description = "Amazon Linux AMI with a TLS Node.js sample app."
  instance_type   = "t2.micro"
  region          = "us-east-2"
  source_ami      = data.amazon-ami.amazon-linux.id
  ssh_username    = "ec2-user"
}
```

Build the new AMI:

```bash
$ cd ../
$ packer init sample-app.pkr.hcl
$ packer build sample-app.pkr.hcl
```

Deploy:

```bash
$ cd ../tofu/live/ec2-dns-tls
$ tofu init
$ tofu apply
```

Test:

```bash
$ curl https://www.<DOMAIN_NAME>
Hello, World!
```

If you see "Hello, World!", congrats! You're now using TLS for encryption in transit and AWS Secrets Manager for encryption at rest.

:::info Get Your Hands Dirty
Try these exercises:

- Configure Certbot to automatically renew certificates (scheduled Lambda functions + `certbot-dns-route53` plugin)
- Deploy an ASG with an ALB and use AWS ACM for free, auto-renewing TLS certificates

When done, commit changes and run `tofu destroy`. Consider marking the certificate secret for deletion in AWS Secrets Manager.
:::

### 3.3. End-to-End Encryption

**In plain English:** End-to-end encryption means only you and your intended recipient can read the messages—not even the company providing the messaging service can decrypt them.

**In technical terms:** E2E encryption encrypts data client-side before it leaves the user's device, using encryption keys that only the end users possess. The service provider cannot decrypt the data.

**Why it matters:** Provides the highest level of privacy. Even if the service provider is compromised or compelled by law enforcement, they cannot access your data.

The old definition of E2E encryption meant encrypting all data at rest and in transit. The modern definition means not even the software provider can access customer data.

:::tip Key Takeaway #9
Use E2E encryption to protect data so that no one other than the intended recipients can see it—not even the software provider.
:::

**Three critical questions about E2E encryption:**

#### 3.3.1. What Encryption Key Do You Use for E2E Encryption?

Most E2E-encrypted software uses **envelope encryption**:

- Root key is derived from your authentication method (e.g., your login password)
- Root key decrypts one or more data keys (stored encrypted)
- Data keys are kept in memory and used to encrypt/decrypt data client-side

For some software (e.g., password managers), data keys are symmetric keys used with AES. For other software (e.g., messaging apps), data keys are private keys for asymmetric encryption.

#### 3.3.2. What Data Needs to Be E2E Encrypted, and What Doesn't?

Not all data can be encrypted client-side. A minimal set must be visible to the software vendor for the software to function.

For example, in an E2E-encrypted messaging app:

- Message contents can be encrypted
- Message recipients must be visible (to deliver the message)

Each vendor must balance privacy (more client-side encryption) versus functionality (more server-side features like search and ad targeting).

#### 3.3.3. How Do You Establish Trust with E2E-Encrypted Software?

How do you know you can trust software claiming to be E2E encrypted? Trust can be broken in multiple ways:

- **The vendor could be lying**: Some companies claiming E2E encryption were later found to be exaggerating (e.g., FTC found Zoom claimed E2E encryption but maintained keys that could access meetings)
- **The vendor could have backdoors**: Government agencies sometimes force vendors to install hidden access methods (e.g., Edward Snowden documents showed Microsoft provided NSA backdoors into Skype and Outlook)
- **The software could have bugs**: Even genuine E2E encryption implementations may have vulnerabilities
- **The software (or hardware) could be compromised**: How do you know downloaded software wasn't swapped by an attacker? How do you trust TLS certificates? Root CAs? Your OS? Your hardware?

This problem has no perfect solution. At some point, you need to make a judgment call to trust something or someone. Technology can help, but it's not the full solution.

## Conclusion

You've now learned how to secure storage and communication, as per the nine key takeaways from this chapter:

1. Don't roll your own cryptography. Always use mature, battle-tested, proven algorithms and implementations.
2. Do not store secrets as plaintext.
3. Avoid storing secrets whenever possible by using SSO, third-party services, or just not storing the data at all.
4. Protect personal secrets, such as passwords and credit card numbers, by storing them in a password manager.
5. Protect infrastructure secrets, such as database passwords and TLS certificates, by using a KMS and/or a general-purpose secret store.
6. Never store user passwords (encrypted or otherwise). Instead, use a password hash function to compute a hash of each password with a salt and pepper, and store those hash values.
7. You can encrypt data at rest by using full-disk encryption, data store encryption, and application-level encryption.
8. You can encrypt data in transit by using TLS. You get a TLS certificate from a certificate authority.
9. Use E2E encryption to protect data so that no one other than the intended recipients can see it—not even the software provider.

**Cryptographic Use Cases Cheat Sheet**

| Use Case | Solution | Example Tools |
|----------|----------|---------------|
| Store personal secrets | Use a password manager | 1Password, Bitwarden |
| Store infrastructure secrets | Use a secret store or KMS | OpenBao, AWS Secrets Manager |
| Store customer passwords | Store hash of (password + salt + pepper) | Argon2id, scrypt, bcrypt |
| Encrypt data at rest | Use authenticated encryption | AES-GCM, ChaCha20-Poly1305 |
| Encrypt data in transit (internet) | Use TLS with public CA | Let's Encrypt, ACM |
| Encrypt data in transit (private) | Use TLS with private CA | Istio, step-ca |
| Validate data integrity | Use cryptographic hash | SHA-2, SHA-3 |
| Validate integrity + authenticity | Use MAC | HMAC, KMAC |

Much of this chapter focused on storing data securely. In Chapter 9, you'll learn more about data storage, including how to use SQL, NoSQL, queues, warehouses, and file stores.

---

**Previous:** [Networking](/operations-architecture/ch07-networking) | **Next:** [Storage](/operations-architecture/ch09-storage)
