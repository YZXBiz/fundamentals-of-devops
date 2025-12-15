---
sidebar_position: 3
title: "Chapter 8: How to Secure Communication and Storage"
description: "Learn how to protect your data and communications using encryption, hashing, secrets management, and secure protocols like TLS. Understand cryptography fundamentals and implement security best practices."
---

import { ProcessFlow, StackDiagram, CardGrid, ComparisonTable, TreeDiagram, colors } from '@site/src/components/diagrams';

# Chapter 8. How to Secure Communication and Storage

In Chapter 7, you learned about the role networking plays in security, including the importance of private networks, bastion hosts, VPCs, and service meshes. But what happens if a malicious actor finds a way to intercept the data you transmit over the network? Or what if they manage to get access to that data when you write it to a hard drive? Networking provides one important layer of defense, but as you also saw in Chapter 7, you need multiple layers so you're never one mistake away from disaster (defense in depth). In this chapter, you'll learn about two more layers of defense:

**Secure storage**: Protect your data from unauthorized snooping or interference by using encryption at rest, secrets management, password storage, and key management.

**Secure communication**: Protect your communication over the network from unauthorized snooping or interference by using encryption in transit and secure transport protocols.

As you go through these topics, this chapter will walk you through hands-on examples, including how to encrypt data with AES and RSA; verify file integrity with SHA-256, HMAC, and digital signatures; store secrets in AWS Secrets Manager; and serve traffic over HTTPS by using TLS certificates from Let's Encrypt. But first, let's do a quick primer on what makes all of this possible: cryptography.

## Table of Contents

1. [Cryptography Primer](#cryptography-primer)
   - [Encryption](#encryption)
   - [Hashing](#hashing)
2. [Secure Storage](#secure-storage)
   - [Secrets Management](#secrets-management)
   - [Encryption at Rest](#encryption-at-rest)
3. [Secure Communication](#secure-communication)
   - [Transport Layer Security](#transport-layer-security)
   - [Example: HTTPS with Let's Encrypt and AWS Secrets Manager](#example-https-with-lets-encrypt-and-aws-secrets-manager)
   - [End-to-End Encryption](#end-to-end-encryption)

## Cryptography Primer

Cryptography is the study of how to protect data from adversaries so as to provide three key benefits, which sometimes go by the acronym CIA:

**Confidentiality**: Keep your data secret, so only those you intend to see it can see it.

**Integrity**: Ensure that your data can't be modified in any way by unauthorized parties.

**Authenticity**: Ensure that you are really communicating with the intended parties.

To achieve these benefits, modern cryptography combines multiple disciplines, including mathematics, computer science, and information security. It's a fascinating topic, but also a highly complex one, and if you take away only one point from this chapter, it should be this: **do not invent your own cryptography** (unless you have extensive training and experience in this discipline).

> Anyone, from the most clueless amateur to the best cryptographer, can create an algorithm that he himself can't break. It's not even hard. What is hard is creating an algorithm that no one else can break, even after years of analysis.
>
> — Bruce Schneier, "Memo to the Amateur Cipher Designer"

Cryptography isn't like other software. With most software, you are dealing with users who are mildly engaged at best, and most bugs are minor. With cryptography, you are dealing with determined adversaries who are doing everything they can to defeat you, and any bug found by any of these adversaries can be catastrophic. You may be able to outsmart some of them some of the time, but you probably won't be able to outsmart all of them all of the time. Any scheme an amateur comes up with from scratch is almost certain to be vulnerable to one or more of the brilliant and devious cryptographic attacks (e.g., side-channel attacks, timing attacks, man-in-the-middle attacks, replay attacks, injection attacks) that clever people have come up with over the many centuries cryptography has been around.

If you ever want a glimpse into just how hard it is to get security right, sign up for security advisory mailing lists for the software you use. I watched these lists for years, and it was both terrifying and humbling to realize that it was a rare day when there wasn't at least one serious vulnerability found in Windows, Linux, OpenSSL, PHP, Jenkins, WordPress, or other software we all rely on. In some ways, this is a good thing: all software has vulnerabilities, but it's only from years of usage and attacks that those vulnerabilities are found and fixed. The same is true of cryptography: all cryptography has vulnerabilities, and it's only after withstanding years of usage and attacks that you can consider it secure.

:::tip Key Takeaway #1
Don't roll your own cryptography. Always use mature, battle-tested, proven algorithms and implementations.
:::

Because of its complexity, a deep dive on cryptography or its underlying mathematics is beyond the scope of this book. My goal in this section is to introduce, at a high level, two key concepts from cryptography:

- Encryption
- Hashing

I believe if you can get a grasp on what these are—and just as important, clear up the many misconceptions about them—that will be sufficient to allow you to make use of cryptography to handle the use cases covered later in this chapter (secure communications and storage). Let's start by looking at encryption.

### Encryption

Encryption is the process of transforming data so that only authorized parties can understand it. You take the data in its original form, called **plaintext**, and you pass it, along with a secret **encryption key**, through an algorithm called a **cipher** to encrypt the data into a new form called the **ciphertext**. The ciphertext should be completely unreadable, essentially indistinguishable from a random string, so it's useless to anyone without the encryption key. The only way to get back the original plaintext is to use the cipher with the encryption key to decrypt the ciphertext back into plaintext.

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

Most modern cryptography systems are built according to **Kerckhoffs's principle**, which states that the system should remain secure even if everything about the system, except the encryption key, is public knowledge. This is essentially the opposite of security through obscurity, where your system is secure only as long as adversaries don't know how that system works under the hood, an approach that rarely works in the real world. Instead, you want to use cryptographic systems that make it infeasible for an adversary to turn ciphertext back into plaintext (without the encryption key), even if they know every single detail of how that system works.

Note that I used "infeasible" rather than "impossible." You could say "impossible" only about the small number of ciphers that offer **perfect secrecy** (aka information-theoretic security), which are secure even against adversaries with unlimited resources and time. For example, in the 1940s, Claude Shannon proved that it is impossible to crack the one-time pad cipher, but this cipher relies on an encryption key that is (a) at least as long as the plaintext, (b) truly random, and (c) never reused in whole or in part. Distributing such encryption keys while keeping them secret is a significant challenge, so such ciphers are used only in special situations (e.g., critical military communications).

Instead of perfect secrecy, the vast majority of ciphers aim for **computational security**, where the resources and time it would take to break the cipher are so high that it isn't feasible in the real world. To put that into perspective, a cryptographic system is considered strong if the only way to break it is through brute-force algorithms that have to try every possible encryption key. If the key is n bits long, then to try every key, you'd have to try 2ⁿ possibilities, which grows at an astonishing rate, so by the time you get to a 128-bit key, it would take the world's fastest supercomputer far longer than the age of the universe to try all 2¹²⁸ possibilities.

Broadly speaking, there are three types of encryption:

1. Symmetric-key encryption
2. Asymmetric-key encryption
3. Hybrid encryption

Let's look at these in more detail.

#### Symmetric-key encryption

Symmetric-key encryption uses a single encryption key for both encryption and decryption. For example, Alice can use an encryption key to encrypt the plaintext "Hello, World" into ciphertext before sending it to Bob, and then Bob can use the same encryption key to decrypt the ciphertext back into plaintext. If a malicious actor named Mallory somehow gets hold of the ciphertext, he can't read it, as he doesn't have access to the encryption key.

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

The main advantage of symmetric-key encryption is that it is typically faster than asymmetric-key encryption. The main drawback of symmetric-key encryption is that it's hard to distribute the encryption key in a secure manner. If you try to send it to someone as plaintext, a third party could intercept the message, steal the key, and use it to decrypt anything you encrypted later. You could try to encrypt the key, but that requires another encryption key, so that just brings you back to square one. Until the 1970s, the only solution was to share keys via an out-of-band channel, such as exchanging them in person, which does not scale well. In the 1970s, asymmetric-key encryption provided a new solution to this problem.

#### Asymmetric-key encryption

Asymmetric-key encryption, also known as public-key encryption, uses a pair of related keys: a **public key** that can be shared with anyone and used to encrypt data, and a **private key** that must be kept a secret and can be used to decrypt data. For example, Alice can use Bob's public key to encrypt the plaintext "Hello, World" into ciphertext before sending it to Bob, and Bob can use his private key to decrypt the ciphertext back into plaintext. If a malicious actor named Mallory somehow gets hold of the ciphertext, he can't read it, as he doesn't have access to Bob's private key.

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

The public and private key and the encryption and decryption are all based on mathematical functions. You can use these functions to create a linked public and private key, such that data encrypted with the public key can be decrypted only with the corresponding private key, and that it's safe to share the public key because there's no way to derive the corresponding private key from it (other than brute force, which is not feasible with the large numbers used in asymmetric-key encryption).

The advantage of asymmetric-key encryption is that you don't need to share an encryption key in advance. Instead, each user shares their public keys, and all other users can use those to encrypt data. This has made it possible to have secure digital communications over the internet, even with total strangers, where you have no pre-existing out-of-band channel to exchange encryption keys. That said, asymmetric-key encryption has two major drawbacks. First, it is considerably slower than symmetric-key encryption, and second, it is usually limited in the size of messages you can encrypt. Therefore, it's rare to use asymmetric-key encryption by itself. Instead, you typically use hybrid encryption.

#### Hybrid encryption

Hybrid encryption combines asymmetric and symmetric encryption, using asymmetric-key encryption initially to exchange an encryption key, and then symmetric-key encryption for all messages after that. For example, if Alice wants to send a message to Bob, she first generates a random encryption key to use for this session, encrypts it by using Bob's public key, and then sends this encrypted message to Bob. After that, she uses symmetric-key encryption with the randomly generated encryption key to encrypt all subsequent messages to Bob. This provides several advantages:

**No reliance on out-of-band channels**: You get to use symmetric-key encryption without the need to set up a secure out-of-band channel ahead of time to exchange the encryption key.

**Performance**: Most of the encryption is done with symmetric-key encryption, which is fast, efficient, and has no limits on message sizes.

**Forward secrecy**: Hybrid encryption can achieve forward secrecy: even in the disastrous scenario of a malicious actor compromising Alice's private key, they still won't be able to read any of the data in any previous conversation. That's because each of those conversations is encrypted with a different, randomly generated encryption key, which Alice never stores, and when Alice shares that encryption key with other users, she encrypts those messages with the public keys of those users, so compromising Alice's private key doesn't allow you to compromise any of those past messages.

ECIES, which I introduced in the previous section, is a hybrid encryption approach. It's a trusted standard for doing a secure key exchange using elliptic curve cryptography for asymmetric-key encryption, followed by symmetric-key encryption using one of several configurable algorithms (e.g., AES).

Now that you've seen some of the basic theory behind encryption, let's see what it looks like in practice by trying out a few real-world examples.

#### Example: Encryption and decryption with OpenSSL

:::caution Watch Out for Snakes: Don't Use OpenSSL to Encrypt Data in Production
The OpenSSL binary is available on most systems, so it's convenient for learning and experimenting, but I do not recommend using it to encrypt data for production. The algorithms it supports are dated and incomplete (e.g., it doesn't support AES-GCM), and the defaults it exposes are insecure and error prone. For production use cases, use mature cryptography libraries built into programming languages (e.g., the Go crypto library) or CLI tools such as GPG or age.
:::

Let's do a quick example of encrypting and decrypting data on the command line by using OpenSSL, which is installed by default on most Unix, Linux, and macOS systems. We'll start with symmetric encryption. Run the following command to encrypt the text "Hello, World," using AES:

```bash
$ echo "Hello, World" | openssl aes-128-cbc -base64 -pbkdf2
U2FsdGVkX19V9Ax8Y/AOJT4nbRwr+3W7cyGgUIunkac=
```

openssl will prompt you for a passphrase (twice). If you were exchanging data between two automated systems, you'd use a randomly generated, 128-bit key instead of a password. However, for this exercise, and when you rely on human memory, you use a password that a person came up with. Since human-generated passwords are typically not exactly 128 bits long, OpenSSL uses a key-derivation function called PBKDF2 to derive a 128-bit key from that password. This derivation process does not add any entropy, so if the password isn't randomly generated, it will be easier to break (through brute force) than a randomly generated 128-bit key, but when you rely on memorization, that's a risk you have to accept.

Once you enter your passphrase, you'll get back a base64-encoded string, such as the `U2Fsd...` text you see in the preceding output. This is the ciphertext! As you can see, there's no way to guess that this jumble of letters and numbers came from the text "Hello, World." You could safely send this to someone, and even if the message is intercepted, there is no way for the malicious attacker to understand what it said without the encryption key. The only way to get back the plaintext is to decrypt it by using the same algorithm and key:

```bash
$ echo "<CIPHERTEXT>" | openssl aes-128-cbc -d -base64 -pbkdf2
Hello, World
```

You'll again be prompted for your passphrase, so make sure to enter the same one, and OpenSSL will decrypt the ciphertext back into the original "Hello, World" plaintext. Congrats, you've successfully encrypted and decrypted data by using AES!

Let's now try asymmetric-key encryption. First, create a key pair as follows:

```bash
$ openssl genrsa -out private-key.pem 2048
$ openssl rsa -in private-key.pem -pubout -out public-key.pem
```

This creates a 2,048-bit RSA private key in the file `private-key.pem` and the corresponding public key in `public-key.pem`. You can now use the public key to encrypt the text "Hello, World" as follows:

```bash
$ echo "Hello, World" | \
  openssl pkeyutl -encrypt -pubin -inkey public-key.pem | \
  openssl base64
YAYUStgMyv0OH7ZPSMcibbouNwLfTWKr...
```

This should output a bunch of base64-encoded text, which is the ciphertext. Once again, the ciphertext is indistinguishable from a random string, so you can safely send it around, and no one will be able to figure out the original plaintext without the private key. To decrypt this text, run the following command:

```bash
$ echo "<CIPHERTEXT>" | \
  openssl base64 -d | \
  openssl pkeyutl -decrypt -inkey private-key.pem
Hello, World
```

This command first decodes the base64 text and then uses the private key to decrypt the ciphertext, giving you back Hello, World. Congrats, you've successfully encrypted and decrypted data by using RSA! That means it's time for one of my favorite jokes:

> Perl—The only language that looks the same before and after RSA encryption.
>
> — Keith Bostic

Now that you've had a chance to experiment with encryption, let's move on to the next major cryptography topic, hashing.

### Hashing

A **hash function** can take a string as input and convert it to a **hash value** (sometimes also called a digest or just a hash) of fixed size, in a deterministic manner, so that given the same input, you always get the same output. For example, the SHA-256 hash function always produces a 256-bit output, whether you feed into it a file that is 1 bit long or 5 million bits long, and given the same file, you always get the same 256-bit output.

Hash functions are one-way transformations: it's easy to feed in an input and get an output, but given just the output, there is no way to get back the original input. This is a marked difference from encryption functions, which are two-way transformations: given an output (and an encryption key), you can always get back the original input.

**Hash Functions vs. Encryption**

| Characteristic | Hash Functions | Encryption |
|----------------|----------------|------------|
| Direction | One-way (irreversible) | Two-way (reversible) |
| Output Size | Fixed (e.g., 256 bits) | Variable (matches input) |
| Key Required | No key needed | Requires encryption key |
| Deterministic | Same input → Same output | Same input + key → Same output |
| Use Case | Integrity verification, passwords | Confidentiality, secure communication |
| Example | SHA-256, SHA-3 | AES, RSA |

Noncryptographic hash functions are used in applications that don't have rigorous security requirements. For example, you've probably come across them used in hash tables in almost every programming language; they are also used for error-detecting codes, cyclic redundancy checks, bloom filters, and many other use cases. Cryptographic hash functions, which are primarily what we'll focus on in this section, have special properties desirable for cryptography, including the following:

**Pre-image resistance**: Given a hash value (the output), there's no way to figure out the original string (the input) that was fed into the hash function to produce that output (you'd have to use brute force to try every possible value, which is not feasible).

**Second pre-image resistance**: Given a hash value (the output), there's no way to find any string (the original or any other input) that could be fed into the hash function to produce this output.

**Collision resistance**: There's no way to find any two strings (any two inputs) that produce the same hash value (the same output).

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

Cryptographic hash functions have a variety of uses:

1. Verification of the integrity of messages and files
2. Message authentication codes (MACs)
3. Authenticated encryption
4. Digital signatures

Let's take a brief look at each of these, starting with verifying the integrity of messages and files.

#### Verification of the integrity of messages and files

When making a file available for download, it's common to share the hash of the file contents too. For example, if you make a binary called `my-app` available through a variety of sources (e.g., APT for Ubuntu, MacPorts for macOS, Chocolatey for Windows), you could compute the SHA-256 hash of `my-app` and post the value on your website. Anyone who downloads `my-app` can then compute the SHA-256 of the file they downloaded and compare that to the official hash on your website. If the values match, that person can be confident that they downloaded the exact same file and that nothing has corrupted it or modified it along the way. That's because if you change even one bit of the file, the resulting hash will be completely different.

#### Message authentication codes

A **message authentication code (MAC)** combines a hash with a secret key to create an authentication tag for data that allows you to not only verify the data's integrity (that no one modified it), but also its authenticity (that the data truly came from an intended party). For example, you can use a MAC to ensure the integrity and authenticity of cookies on your website. When a user logs in, you might want to store a cookie in their browser with their username, so they don't have to log in again. If you do this naively and store just the username, a malicious actor could easily create a cookie pretending to be any user they wanted to be.

The solution is to store not only the username in the cookie but also an authentication tag, which you compute from the username and a secret key. Every time you get a cookie, you compute the authentication tag on the username, and if it matches what's stored in the cookie, you can be confident that this was a cookie only your website could've written, and that it could not have been modified in any way. That's because if you modify even one bit of the username, you would get a completely different authentication tag, and without the secret key, there is no way for a malicious actor to guess what that new tag should be.

The standard MAC algorithms you should be using are listed here:

**HMAC**: Hash-based MAC (HMAC) is a NIST standard for computing a MAC by using various hash functions (e.g., HMAC-SHA256 uses SHA-256 as the hash function).

**KMAC**: A MAC that is based on cSHAKE.

One of the most common uses of MACs is to make symmetric-key encryption more secure, as discussed next.

#### Authenticated encryption

Symmetric-key encryption can prevent unauthorized parties from seeing your data, but how would you ever know if they modified that data (e.g., injected some noise into the ciphertext or swapped it out entirely)? The answer is that, instead of using symmetric-key encryption by itself, you almost always use **authenticated encryption**, which combines symmetric-key encryption with a MAC. The symmetric-key encryption prevents unauthorized parties from reading your data (confidentiality), and the MAC prevents them from modifying your data (integrity and authenticity).

For every encrypted message, you use a MAC to calculate an authentication tag, and you include this associated data (AD) with the message as plaintext. When you receive a message with AD, you use the same MAC with the same secret key to calculate your own authentication tag, and if it matches the authentication tag in the AD, you can be confident that the encrypted data could not have been tampered with in any way. If even one bit of the encrypted data had been changed, the authentication tag would have been completely different, and there's no way for someone to guess the new tag without the secret key.

Both of the encryption algorithms I recommended in the symmetric-key encryption section, AES-GCM and ChaCha20-Poly1305, are actually **authenticated encryption with associated data (AEAD)** protocols that combine a MAC with encryption, as in almost all cases, this is more secure to use than symmetric-key encryption alone.

#### Digital signatures

If you combine a hash function with asymmetric-key encryption, you get a **digital signature**, which can allow you to validate the integrity and authenticity of a message. For example, Bob can take a message such as "Hello, World," and using his private key and a hash function, he can generate a signature for that message, which he can then send to Alice, along with the original message. Alice can then use Bob's public key to validate the signature. If the signature is valid, Alice can be confident the message came from Bob, as he's the only one with access to the corresponding private key. If a malicious actor like Mallory modified even a single bit of the message along the way, the signature validation would fail, and without Bob's private key, Mallory has no way to generate a new, valid signature.

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

You've now seen a few of the common use cases for hash functions. To get a better feel for them, let's try some with a few real-world examples.

#### Example: File integrity, HMAC, and signatures with OpenSSL

Let's start with an example of using hash functions to check the integrity of a file. First, create a file called `file.txt` that contains the text Hello, World:

```bash
$ echo "Hello, World" > file.txt
```

Next, use OpenSSL to calculate a hash for the file by using SHA-256:

```bash
$ openssl sha256 file.txt
SHA2-256(file.txt)= 8663bab6d124806b...
```

You should get back the exact same hash value (which starts with `8663bab6d124806b...`), because given the same input, a hash function always produces exactly the same output. Now, watch what happens if you modify just one character of the file, such as making the W in World lowercase:

```bash
$ echo "Hello, world" > file.txt
```

Calculate the SHA-256 hash again:

```bash
$ openssl sha256 file.txt
SHA2-256(file.txt)= 37980c33951de6b0...
```

As you can see, the hash is completely different!

Now, let's try an example of using a MAC to check the integrity and authenticity of a file. You can use the exact same openssl command, but this time, add the `-hmac <PASSWORD>` argument, with some sort of password to use as a secret key, and you'll get back an authentication tag:

```bash
$ openssl sha256 -hmac password file.txt
HMAC-SHA2-256(file.txt)= 3b86a735fa627cb6...
```

If you had the same `file.txt` contents and used the same password as me, you should get back the exact same authentication tag (which starts with `3b86a735fa627cb6...`). But once again, watch what happens if you modify `file.txt`, perhaps this time making the H lowercase in Hello:

```bash
$ echo "hello, world" > file.txt
```

Generate the authentication tag again:

```bash
$ openssl sha256 -hmac password file.txt
HMAC-SHA2-256(file.txt)= 1b0f9f561e783df6...
```

Once again, changing even a single character in a file results in a totally different output. But now, you can get this output only if you have the secret key (the password). With a different secret key, such as `password1`, the output will not be the same:

```bash
$ openssl sha256 -hmac password1 file.txt
HMAC-SHA2-256(file.txt)= 7624161764169c4e...
```

Finally, let's try a digital signature, reusing the public and private keys from the encryption example section earlier in this chapter. First, compute the signature for `file.txt` by using your private key and write the output to `file.txt.sig`:

```bash
$ openssl sha256 -sign private-key.pem -out file.txt.sig file.txt
```

Next, you can validate the signature by using your public key:

```bash
$ openssl sha256 -verify public-key.pem -signature file.txt.sig file.txt
Verified OK
```

Try modifying anything—the signature in `file.txt.sig`, the contents of `file.txt`, your private key, or your public key—and the signature verification will fail. For example, remove the comma from the text in `file.txt` and then try to verify the signature again:

```bash
$ echo "hello world" > file.txt
$ openssl sha256 -verify public-key.pem -signature file.txt.sig file.txt
Verification failure
```

Now that you've had a chance to see encryption and hashing in action, you should understand the primitives that make secure storage and communication possible, so let's move on to the use cases, starting with secure storage.

## Secure Storage

The first use case for cryptography that we'll look at is storing data securely. That is, how do you write data to a hard drive in a way that provides confidentiality, integrity, and authenticity? The answer, as you can probably guess from the cryptography primer, mostly consists of using encryption. In fact, secure data storage is often referred to as **encryption at rest**, as opposed to encryption in transit (which is the topic of the Secure Communication section).

Encryption always relies on a secret key, so a prerequisite to secure data storage is being able to manage secrets securely, including encryption keys, passwords, tokens, and certificates. So we'll start with a look into the specialized topic of secrets management, and then we'll come back to the more general topic of encryption at rest.

### Secrets Management

At some point, you and your software will be entrusted with a variety of secrets, such as encryption keys, database passwords, and TLS certificates. This is all sensitive data that, if it were to get into the wrong hands, could do a lot of damage to your company and its customers. If you build software, keeping those secrets secure is your responsibility. To do that, you need to learn about secrets management.

The first rule of secrets management is:

**Do not store secrets as plaintext.**

The second rule of secrets management is:

**DO NOT STORE SECRETS AS PLAINTEXT.**

Do not put plaintext secrets directly into your code and check them into version control. Do not send plaintext secrets to colleagues through email or chat. Do not store your plaintext passwords in a .txt file on your desktop or in Google Docs.

If you store secrets in plaintext on a hard drive, you may end up with copies of those secrets scattered across thousands of computers. For example, if you ignore my advice and store plaintext secrets in version control, copies of these secrets may end up on the computers of every developer on your team, computers used by the version-control system itself (e.g., GitHub), computers used for CI (e.g., GitHub Actions), computers used for deployment (e.g., HashiCorp Cloud Platform), computers used to host your software (e.g., AWS), computers used to back up your data (e.g., iCloud), and so on. A vulnerability in any piece of software on any of those computers may leak your secrets to the world.

:::tip Key Takeaway #2
Do not store secrets as plaintext.
:::

The secure way to store secrets is in a **secrets management tool**. Which tool you use depends on the type of secret you need to store. Broadly speaking, secrets fall into one of the following three buckets:

**Personal secrets**: These secrets belong to a single person or are shared with several people. Examples: passwords for websites, SSH keys, credit card numbers.

**Infrastructure secrets**: These secrets need to be exposed to the servers running your software. Examples: database passwords, API keys, TLS certificates.

**Customer secrets**: These secrets belong to the customers that use your software. Examples: usernames and passwords that your customers use to log into your software, personally identifiable information (PII) for your customers, protected health information (PHI) for your customers.

Most secrets management tools are designed to store exactly one of these types of secrets, and forcing it to store other types of secrets is usually a bad idea. For example, the secure way to store passwords that are infrastructure secrets is completely different from the secure way to store passwords that are customer secrets, and using the wrong approach can be catastrophic from a security perspective.

The best way to avoid these sorts of catastrophes is to avoid storing secrets in the first place. Here are a few common alternatives:

**Single sign-on**: Instead of trying to securely store user passwords, you can use single sign-on (SSO), which allows users to log in with an existing identity provider (IdP), using a standard such as Security Assertion Markup Language (SAML), Open Authorization (OAuth), OpenID, Lightweight Directory Access Protocol (LDAP), or Kerberos.

**Third-party services**: Instead of trying to store certain sensitive data yourself, you could offload this work to reputable third-party services. For example, instead of storing user credit cards and being subject to PCI compliance standards, most companies these days leverage third-party payment services such as Stripe or Chargebee.

**Don't store the data at all**: Sometimes you don't need to store the data at all. In fact, many of us wish that companies would store a little less data about us—especially PII and PHI. If it isn't absolutely necessary for your business to store that data, then don't, and you instantly avoid numerous security and compliance headaches.

:::tip Key Takeaway #3
Avoid storing secrets whenever possible by using SSO, third-party services, or just not storing the data at all.
:::

Of course, sometimes you can't use these approaches, and you need to store the data. In these cases, you need to make sure you're using the right tool for the job. Let's dive into the tools and techniques you should use for various types of secrets, starting with personal secrets.

#### Personal secrets

To securely store personal secrets, such as passwords, you typically need to use symmetric-key encryption, so your secrets are encrypted when they are on disk, and can be decrypted only with an encryption key. As you may remember, rolling your own cryptography is a bad idea, so instead, you should use a mature, off-the-shelf **password manager**. This piece of software is designed to provide secure storage for personal secrets, including not only passwords, but also credit card numbers, identity documents (e.g., passport, Social Security card), API tokens, and more. Some of the major players in this space include standalone password managers such as 1Password and Bitwarden; password managers built into OSs, such as the macOS password manager and Windows Credential Manager; and password managers built into web browsers, such as Google Password Manager and Firefox Password Manager.

:::tip Key Takeaway #4
Protect personal secrets, such as passwords and credit card numbers, by storing them in a password manager.
:::

Generally speaking, using almost any reasonable password manager is going to be more secure than not using one at all. That said, since you are trusting the password manager with some of your most valuable data, make sure you pick a password manager that is transparent about its security practices, goes through regular audits from independent third parties, supports MFA and convenient login methods such as Touch ID, Face ID, and passkeys, provides a way to share secrets with others (e.g., family plans or team plans), and works on all the platforms you use (desktop app, mobile app, CLI integration, web browser integration).

Perhaps most important of all, make sure that the password manager uses **end-to-end encryption**. You'll learn more about this later in this chapter, but for now, the key point to understand is that it should be impossible for the password manager vendor (or anyone else) to read your data, even if your data is stored on their servers, or even if that data is compromised, as your data should be encrypted before it leaves your device, using a password that is not stored anywhere (other than in your mind).

The password you pick to access your password manager is likely the single most important password in your life. It's essential that you pick a strong password here. Here are the key factors that make a password strong:

**Unique**: If you use the same password with multiple accounts, then if even one of those accounts (the weakest link) is compromised and your password leaks, a malicious actor can use that password to access all your other accounts.

**Long**: The longer the password, the more bits of entropy it will have, and the harder it is to break. To put it into perspective, breaking a typical 8-character password would take only a few hours, whereas breaking a 15-character password would take several centuries. I recommend using the longest password you can remember, with 15 characters as the bare minimum.

**Hard to guess**: Passwords that contain common phrases and patterns are easier to break. Glance through the list of most common passwords for patterns to avoid, such as 123456, password, qwerty, 111111, and so on.

So, how do you come up with a unique, long, hard-to-guess password that you can remember? The best strategy I've seen is to use **Diceware**: you take a list of thousands of easy-to-remember English words, roll dice a bunch of times to pick four to six such words at random, and glue them together to create a password that is unique, long, and hard to guess—but easy to memorize (e.g., "correct-horse-battery-staple," as per XKCD #936). You can follow the instructions on the Diceware website to come up with a Diceware password by hand, or you can use the web-based Diceware Password Generator, the CLI tool diceware, or similar password generators that are built into your password manager tool (many of which are based on Diceware).

This may seem like a lot of work for a password, but once you start using a password manager, this will be the only password you'll need to memorize. All your other passwords will be stored in the password manager, so there's no need to remember them. In fact, it's better if you can't remember them. That is, you should use the password generator built into your password manager to generate a different, random, strong password for every website you use. That way, if one of those websites is compromised, and your password leaks, it affects only that website and nothing else.

Now that you know how to store personal secrets, let's move on to infrastructure secrets.

#### Infrastructure secrets

To securely store infrastructure secrets, such as database passwords and TLS certificates, you again need to use symmetric-key encryption, and again, you will want to rely on battle-tested, off-the-shelf software. However, password managers are usually not the right fit for this use case, as they are typically designed to store permanent secrets accessed by a human being (who can memorize a password), whereas with infrastructure, you need support for temporary secrets (those that expire after a period of time) and secrets accessed by automated software (where there's no human being around to type in a password). For this use case, you should use a **secret store** designed to protect infrastructure secrets, integrate with your infrastructure, and support authentication for both human and machine users. Human users authenticate to the secret store through passwords or SSO. Machine users authenticate to the secret store by using one of the mechanisms you learned about in Chapter 7.

There are two primary kinds of secret stores for infrastructure secrets:

**Key management system (KMS)**: This is a type of secret store designed to securely store encryption keys. Most of these are services; you send it data, and it performs the encryption operations on the KMS server and sends you back the result, without the underlying encryption key ever leaving the KMS server (which makes it less likely to be compromised). One option for KMS is to use a hardware security module (HSM), such as those from Thales or Yubico. These physical devices include software and hardware features to safeguard your secrets and prevent tampering. Another option for KMS is to use managed services such as AWS Key Management Service (KMS), or Azure Key Vault, many of which also use HSMs under the hood.

Note that a KMS is typically optimized for security, not speed, so it's rare to use a KMS to encrypt large amounts of data. The more common approach is to use **envelope encryption**: you generate one or more encryption keys called data keys, which your app keeps in memory and uses for the vast majority of your encryption and decryption, and you use the KMS to manage a root key, which you use to encrypt the data keys when storing them on disk and to decrypt when loading them into memory (e.g., when an app is booting).

**General-purpose secret store**: This is a type of data store designed to securely store a variety of types of secrets, such as encryption keys, database passwords, and TLS certificates, and perform a variety of cryptographic functions, such as encryption, hashing, and signing. The major players in this space include standalone secret stores such as HashiCorp Vault/OpenBao, secret stores from cloud providers such as AWS Secrets Manager and Google Cloud Secret Manager (many of which use the corresponding cloud's KMS to manage encryption keys), and secret stores built into orchestration tools, such as Kubernetes Secrets.

:::tip Key Takeaway #5
Protect infrastructure secrets, such as database passwords and TLS certificates, by using a KMS and/or a general-purpose secret store.
:::

General-purpose secret stores are becoming more popular, as they keep all your secrets centralized in a single place rather than having little bits of ciphertext all over the place. Centralization offers the following advantages:

**Audit logging**: Every time a secret is accessed, a centralized secret store can record that in an audit log. A KMS can also log access to encryption keys, but the KMS has no way of knowing what secrets those encryption keys are being used to encrypt or decrypt, and if you use envelope encryption, the KMS can't track what you do with the data keys.

**Revoking and rotating secrets**: Occasionally, you may need to revoke a secret (e.g., if you know it was compromised). Automatically rotating secrets on a regular basis, revoking the old version of a secret and switching to a new version, is also a good practice. That way, you significantly reduce the window of time during which a compromised secret could be used to do damage. Revoking and rotating are both easier to do if all your secrets are in a centralized secret store than if you use a KMS to encrypt secrets and store the ciphertext in a variety of locations.

**On-demand and ephemeral secrets**: Even better than rotating secrets is to not have long-term secrets at all. Instead, you generate secrets on demand, when someone actively needs to use the secret. You also make those secrets ephemeral, so they automatically expire after a short period of time and/or after a certain number of usages. For example, instead of each developer having a permanent SSH key, tools like Teleport support Just-in-Time Access Requests. Developers can use a web UI or CLI to request SSH access when they need it, admins can use a web UI or CLI to approve or deny that access request, and any SSH access that is approved automatically expires after a configurable amount of time (e.g., 24 hours). Both on-demand and ephemeral secrets are easier to do with a centralized secret store that integrates with all your infrastructure.

Now that you've seen how to manage secrets that belong to your company, let's look at how to manage secrets that belong to your customers.

#### Customer secrets and password storage

To store customer secrets securely, you first have to consider the type of secret you're storing. You have two buckets to consider: the first is for user passwords, and the second is for everything else (e.g., financial data, health data, and so on). The first bucket, user passwords, requires special techniques, so that's what we'll look at here.

User passwords have to be handled differently than other types of customer secrets for two reasons. First, attackers are trying to compromise passwords all the time. Forbes estimates that 46% of Americans have had their passwords stolen just in 2023, and in 2024, a user posted nearly 10 billion unique leaked passwords on a hacker forum (known as the RockYou2024 leak). Second, you do not need to store the original user password at all, encrypted or otherwise (which means all these password leaks were completely avoidable)! Instead, the way to manage customer passwords is to do the following:

**Store the hash of the password**: When the user creates a password, feed it into a cryptographic hash function, store the hash value, and throw away the original. When the user tries to log in, feed their password into the same cryptographic hash function, and compare it to the hash value you stored: if they are the same, the user must have typed in the correct password. Using a hash function allows you to authenticate users without storing their passwords! This is a huge win, for if you have a breach, all the attacker gets access to are hash values, and since hash functions are one-way, the attacker has no way to figure out the original passwords, other than to try a brute-force attack. That said, hackers are clever, and rather than a naive brute-force attack trying every possible string of every possible length, they try only words from a dictionary of commonly used words and previously leaked passwords (called a **dictionary attack**), and they precompute all the hashes for this dictionary into a table that shows each password and its hash side by side (called a **rainbow table attack**), which allows them to quickly translate the stolen hashes back into the original passwords. To defeat these attacks, you need to take the two steps detailed next.

**Use specialized password hash functions**: Instead of standard cryptographic hash functions such as SHA-2, you must use specialized password hash functions. The main ones to consider, in order from most to least recommended, are Argon2 (specifically the Argon2id variant), scrypt, bcrypt, and PBKDF2. These functions are intentionally designed to run slowly and take up a lot of resources, which makes brute-force attacks harder. To put it into perspective, with modern hardware, running SHA-256 on a typical password will take less than 1 millisecond, whereas Argon2 will take 1–2 seconds (about 1,000 times slower) and use up way more memory.

**Use salt and pepper**: A **salt** is a unique, random string that you generate for each user and store in plaintext next to the user's other data in your user database. A **pepper** is a shared string that is the same for all your users and that you store in an encrypted form separate from your user database (e.g., in a secret store with your other infrastructure secrets). When you hash the user's password, you actually hash the combination of the user's password, their unique salt, and the shared pepper: `hash(password + salt + pepper)`. This helps you defeat dictionary and rainbow table attacks, as to have useful tables, attackers would now need to break into two of your systems—the user database to get the hashes and salts, and your secret store to get the pepper. They'd also have to create not one precomputed table, but one table for each user (for each salt), which with slow password hash functions is not feasible. As an added bonus, using salts ensures that even users with identical passwords end up with different hashes.

Managing passwords is complicated, so it bears repeating: don't roll your own cryptography. Use mature, battle-tested libraries to handle cryptography for you.

:::tip Key Takeaway #6
Never store user passwords (encrypted or otherwise). Instead, use a password hash function to compute a hash of each password with a salt and pepper, and store those hash values.
:::

Let's now turn our attention to the other bucket, which is how to store all other types of customer secrets, such as financial data (e.g., credit cards) and health data (e.g., PHI). For these use cases, you typically do need to store the original data (unlike user passwords), which means that you need to encrypt that data. This brings us to the realm of encryption at rest.

### Encryption at Rest

When you store data on a hard drive, it becomes a tempting target for attackers. There are a few reasons for this:

**Many copies of the data**: In a typical software architecture, you have the data stored not only in an original database but also in database replicas, caches, queues, streaming platforms, data warehouses, and backups (you'll learn more about data systems in Chapter 9). As a result, stored data offers many possible points of attack, and a single vulnerability in any one of those copies can lead to a data breach.

**Long time frames, little monitoring**: The data you store, and all its copies, can sit around on those various hard drives for years (data is rarely, if ever, deleted), often to the extent that no one at the company even remembers the data is there. As a result, attackers have a long time frame during which they can search for vulnerabilities, with relatively little risk of being noticed.

Many data breaches are not from brilliant algorithmic hacks of the primary, live database, but the result of a hacker stumbling upon an old copy of the data in a tertiary, poorly protected data system—and these breaches often go undetected for years. This is why you need to have many layers of defense for the data you store.

One layer is to pick a secure hosting option that prevents unauthorized individuals from getting physical access to your servers (as you saw in Chapter 1). Another layer is to set up a secure networking configuration that prevents unauthorized individuals from getting network access to your servers (as you saw in Chapter 7). But if both of these fail, the final layer of protection is to encrypt your data at rest, so even if an unauthorized individual gets access, they still can't read the data.

You can encrypt data at rest at multiple levels:

1. Full-disk encryption
2. Data store encryption
3. Application-level encryption

Let's look at each of these now.

#### Full-disk encryption

Most modern OSs support **full-disk encryption** (e.g., macOS FileVault, Windows BitLocker), which encrypts all the data stored on the hard drive (e.g., using AES), typically using an encryption key derived from your login password. In addition, **self-encrypting drives (SEDs)** support full-disk encryption directly in the hardware. Cloud providers also typically support full-disk encryption, but with the added option of using an encryption key from that cloud provider's KMS (e.g., AWS EBS volumes can be encrypted with AWS KMS keys, and Google Cloud Compute Volumes can be encrypted with Cloud KMS keys).

Full-disk encryption is a type of **transparent data encryption (TDE)**: once you're logged into the computer, any data you read or write is automatically decrypted and encrypted, without you being aware this is happening. Therefore, full-disk encryption won't help you if an attacker gets access to a live (authenticated) system, but it does protect against attackers who manage to steal a physical hard drive, as they won't be able to read the data without the encryption key.

#### Data store encryption

Some data stores also support TDE (e.g., MySQL Enterprise Transparent Data Encryption and pg_tde for PostgreSQL), typically using an encryption key you provide when the data store is booting up. This key is used to encrypt either the entire data store or parts of the data store (e.g., one column in a database table). Most cloud providers also support encryption for their managed data stores, using encryption keys from that cloud provider's KMS; for example, AWS RDS encryption uses AWS KMS keys, and Azure SQL Database encryption uses Azure Key Vault keys.

Data store encryption provides a higher level of protection than full-disk encryption, as it's the data store software, not the OS, that is doing the encryption. Therefore, you get protection not only against a malicious actor stealing a physical hard drive, but also against a malicious actor who manages to get access to the live (authenticated) OS running the data store software, because any files the data store software writes to disk will be unreadable without the encryption key. However, data store encryption won't protect you against a malicious actor who is able to authenticate to the data store software (e.g., if a malicious actor is able to compromise a database user account and run queries).

#### Application-level encryption

In addition to the various TDE options, you could also implement encryption in your application code, so that you encrypt your data before storing it in a data store or on disk. For example, when a user adds new data in your application, you fetch an encryption key from a secret store, use AES with the encryption key to encrypt the data, and then store the resulting ciphertext in a database.

This approach has several advantages. First, it provides an even higher level of protection than data store encryption, protecting not only against a hard drive being stolen and filesystem access on live (authenticated) OSs, but also against a malicious actor who can authenticate to your data store software. Even if an attacker can compromise a database user and run queries, they still won't be able to read any of the data they get back unless they can also compromise the encryption key. Second, it provides granular control over the encryption, as you can use different encryption keys for different types of data (e.g., for different users, customers, and tables). Third, it allows you to securely store data even in untrusted systems, or systems that aren't as secure as they could be (e.g., systems that don't support TDE).

This approach also has several drawbacks. First, it requires you to make nontrivial updates to your application code, whereas TDE requires no changes to your apps. Second, the data you store is now opaque to your data stores, which makes it more difficult to query. For example, you may not be able to run queries that look up data in specific columns or do full-text search if the data you're storing is ciphertext.

Generally speaking, since the TDE options are transparent, and the performance impact is small for most use cases, it's typically a good idea to enable full-disk encryption for all company computers and servers, and to enable data store encryption for all your data stores, by default. As for application-level encryption, that's typically reserved for only when the highest level of security is necessary or no other types of encryption are supported.

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

Now that you have seen the various ways to store data securely, let's move on to discussing how to transmit data securely.

## Secure Communication

The second use case for cryptography that we'll look at is transmitting data securely. That is, how do you send data over the network in a way that provides confidentiality, integrity, and authenticity? The answer once again is to use encryption, which is why secure communication is often referred to as **encryption in transit**.

Encryption in transit usually relies on hybrid encryption, using asymmetric-key encryption to protect the initial communication and do a key exchange, and then using symmetric-key encryption for all messages after that. Some of the most common protocols for encryption in transit include the following:

**TLS**: Best-known for securing web browsing (HTTPS), but also used in securing server-to-server communications, instant messaging, email, some types of VPN, and many other applications.

**SSH**: Best-known for securing connections to remote terminals (see Chapter 7).

**IPsec**: Best-known for securing some types of VPN connections (see Chapter 7).

A deep dive into each of these protocols is beyond the scope of this book, but it's worth taking a closer look at TLS, as it's something you'll likely have to understand to be able to do software delivery no matter where you happen to work.

### Transport Layer Security

Every time you browse the web and go to an HTTPS URL, you are relying on **Transport Layer Security (TLS)** to keep your communication secure. TLS is the replacement for Secure Sockets Layer (SSL), the original protocol used to secure HTTPS. You'll still see the term "SSL" used in many places, but at this point, all its versions have known security vulnerabilities and are deprecated, so you should be using only TLS. In particular, you should be using TLS versions 1.3 or 1.2; all older versions have known security vulnerabilities and are deprecated (though sometimes you may have to support older versions to maintain compatibility with older clients).

TLS is responsible for ensuring confidentiality, integrity, and authenticity, especially against **man-in-the-middle (MITM)** attacks. In these attacks, a malicious actor may try to intercept your messages, read them, modify them, and impersonate either party in the exchange. To ensure confidentiality, TLS encrypts all messages with hybrid encryption, preventing malicious actors from reading those messages. To ensure integrity, TLS uses authenticated encryption, so every message includes a MAC, preventing malicious actors from modifying those messages. Moreover, every message includes a nonce, which is a number incremented for every message, preventing malicious actors from reordering or replaying messages (as then the nonce in the message wouldn't match the value you're expecting). To ensure authenticity, TLS uses asymmetric-key encryption; more on that shortly.

TLS is a client/server protocol. For example, the client might be your web browser, and the server might be one of the servers running google.com, or both client and server could be applications in your microservices architecture. The first phase of the protocol is the **handshake**, where the client and server do the following:

**Negotiation**: The client and server negotiate which TLS version (e.g., 1.2, 1.3) and which cryptographic algorithms (e.g., RSA, AES) to use. This typically works by the client sending over the TLS versions and algorithms it supports, and the server picking which ones to use from that list. When configuring TLS on your servers, you'll need to find a balance between allowing only the most modern versions and algorithms to maximize security versus allowing older versions and algorithms to support a wider range of clients.

**Authentication**: To protect against MITM attacks, TLS supports authentication. When using TLS for web browsing, you typically do only one-sided authentication, with the web browser validating the server (but not the other way around). When using TLS for applications in a microservices architecture, ideally you use mutual authentication (mTLS), where each side authenticates the other, as you saw in Chapter 7. You'll see how TLS authentication works shortly.

**Key exchange**: The client and server use asymmetric-key encryption to securely exchange randomly generated encryption keys. At this point, the second phase of the protocol starts, and everything is encrypted using symmetric-key encryption with the randomly generated encryption keys.

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

One of the trickiest parts of the handshake phase is authentication. For example, how can your web browser be sure it's really talking to google.com? Perhaps you are thinking you can use asymmetric-key encryption to solve this problem; Google signs a message with its private key, and your browser checks that the message really came from Google by validating the signature with Google's public key. This works, but how do you get Google's public key in the first place? Perhaps you are thinking you can get it from its website, but what stops a malicious actor from doing a MITM attack, and swapping in their own public key instead of Google's? Perhaps now you're thinking you can use encryption, but then how do you authenticate that encryption? That just starts the cycle all over again.

TLS breaks out of this cycle by establishing a **chain of trust**. This chain starts by hard-coding data about a set of entities you know you can trust. These entities are called **root certificate authorities (CAs)**. The data you hardcode consists of their certificates, which are a combination of a public key, metadata (such as the domain name for a website and identifying information for the owner), and a digital signature. When you're browsing the web, your browser and OS come with a set of certificates for trusted root CAs built in, including organizations around the world, such as Verisign, DigitCert, Let's Encrypt, Amazon, and Google. When you're running apps in a microservices architecture, you typically run your own private root CA and hardcode its details into your apps.

If you own a domain, you can get a TLS certificate for it from a CA by going through the following process:

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

1. You submit a **certificate-signing request (CSR)** to the CA, specifying your domain name, identifying details about your organization (e.g., company name and contact details), your public key, and a signature (as proof you own the corresponding private key).

2. The CA will ask you to prove that you own the domain. Modern CAs use the **Automatic Certificate Management Environment (ACME)** protocol for this. For example, the CA may ask you to host a file with specific contents at a specific URL within your domain (e.g., your-domain.com/file.txt) or you may have to add a specific DNS record to your domain with specific contents (e.g., a TXT record at your-domain.com).

3. You update your domain with the requested proof.

4. The CA checks your proof.

5. If the CA accepts your proof, it will send you back a certificate with the data from your CSR, plus the signature of the CA. This signature is how the CA extends the chain of trust. It's effectively saying, "If you trust me as a root CA, you can trust that the public key in this certificate is valid for this domain."

Most TLS certificates have an expiration date, so you'll have to repeat this process periodically to renew your certificate. Once you have a TLS certificate, here's how it gets used:

1. You visit a website in your browser at `https://<DOMAIN>`.

2. During the TLS handshake, the web server sends over its TLS certificate, which includes the web server's public key and a CA's signature. The web server also signs the message with its private key.

3. Your browser validates that the TLS certificate is for the domain `<DOMAIN>` and that it was signed by one of the root CAs you trust (using the public key of that CA). The browser also validates that the web server actually owns the public key in the certificate by checking the signature on the message. If both checks pass, you can be confident that you're really talking to `<DOMAIN>`, and not someone doing a MITM attack, as a malicious actor has no way to get a root CA to sign a certificate for a domain they don't own, and they can't modify even one bit in the real certificate without invalidating the signatures.

Some root CAs don't sign website certificates directly. Instead, they sign certificates for one or more levels of **intermediate CAs** (extending the chain of trust), and one of those intermediate CAs ultimately signs the certificate for a website. In that case, the website returns the full certificate chain, and as long as that chain ultimately starts with a root CA you trust, and each signature along the way is valid, you can then trust the entire thing.

:::tip Key Takeaway #8
You can encrypt data in transit by using TLS. You get a TLS certificate from a certificate authority.
:::

The system of CAs is typically referred to as **public-key infrastructure (PKI)**. You'll typically come across two primary types of PKIs:

**Web PKI**: Your web browser and most libraries that support HTTPS know how to use the web PKI to authenticate HTTPS URLs for the public internet. To get a TLS certificate for the web, you have several options. One option is to use a free CA such as Let's Encrypt or ZeroSSL, which have appeared in recent years as part of an effort to make the web more secure. Another option is to use a service managed by a cloud provider, such as AWS Certificate Manager (ACM) or Google-managed SSL certificates. These have the advantage of being free, auto-renewing, and secure (you never even get access to the private key, so you can't compromise it), but also have the drawback that you can use those certificates only with that cloud provider's managed services (e.g., their load balancers). One final option is to buy TLS certificates from one of the traditional CAs and domain name registrars, such as DigiCert or GoDaddy. These used to be the only game in town, but these days, they are mainly useful for use cases not supported by the free CAs (e.g., if you need a specific type of wildcard certificate, or you have specific renewal and verification requirements).

**Private PKI**: For apps in a microservices architecture, you typically run your own private PKI. One of the benefits of a service mesh is that it handles the PKI for you, as you saw in Chapter 7. If you're not using a service mesh, other options exist. One option is to set up a private PKI by using self-hosted tools such as HashiCorp Vault/OpenBao, step-ca, or CFSSL. Another option is to use a managed private PKI from a cloud provider, such as AWS Private CA or Google CA Service. A third option is to use a managed private PKI from a cloud-agnostic vendor, such as Keyfactor or Entrust.

Now that you understand how TLS works, let's try out an example.

### Example: HTTPS with Let's Encrypt and AWS Secrets Manager

In this section, you're going to get hands-on practice with two concepts you've seen in this chapter: provisioning TLS certificates and storing infrastructure secrets. You'll also see how to use a TLS certificate with a web server to serve a website over HTTPS. Here are the steps you'll go through:

1. Get a TLS certificate from Let's Encrypt.
2. Store the TLS certificate in AWS Secrets Manager.
3. Deploy EC2 instances that use the TLS certificate.

Let's go through the steps.

#### Get a TLS certificate from Let's Encrypt

Let's Encrypt was one of the first companies to offer free TLS certificates and nowadays is one of the largest CAs in the world, used by more than 300 million websites. You can get TLS certificates from Let's Encrypt by using **Certbot**. The idiomatic way to use this tool is to connect to a live web server (e.g., using SSH), run Certbot directly on that server, and Certbot will automatically request the TLS certificate, validate domain ownership, and install the TLS certificate for you. This approach is great for manually managed websites with a single user-facing server, but it's not as good of a fit for automated deployments with multiple servers that could be replaced at any time. Therefore, in this example, you're instead going to use Certbot in manual mode to get a certificate onto your own computer, and later you'll store that certificate in AWS Secrets Manager.

Install Certbot on your own computer (minimum version 2.11). For example, an easy way to install Certbot on macOS is to run `brew install certbot`. Next, create a temporary folder to store the TLS certificate:

```bash
$ mkdir -p /tmp/certs
$ cd /tmp/certs
```

You'll initially have the certificate on your hard drive (a secret in plaintext on disk!), but after storing it in AWS Secrets Manager, you will delete the local copy (and if you forget, `/tmp` is automatically deleted on reboot on many systems).

In Chapter 7, you registered a domain name by using Route 53. Request a TLS certificate for that same domain name as follows:

```bash
$ certbot certonly --manual \
    --config-dir . \
    --work-dir . \
    --logs-dir . \
    --domain www.<YOUR-DOMAIN> \
    --cert-name example \
    --preferred-challenges=dns
```

Here's what this command does:

- Run Certbot in manual mode, where it'll solely request a certificate and store it locally, without trying to install it on a web server for you.
- Configure Certbot to use the current directory, which should be the temporary folder you just created, to store the certificate and other files it generates.
- Fill in your domain name.
- Configure Certbot to use `example` as the name of the subfolder where it will store the certificate (this has no impact on the contents of the certificate itself).
- Configure Certbot to use DNS as the way to validate that you own the domain. You'll have to prove that you own this domain, as explained next.

When you run the preceding command, Certbot will prompt you for a few pieces of information, including your email address and whether you accept its terms of service. After that, Certbot will show you instructions on how to prove that you own the domain name you specified, and it'll pause execution to give you time to do this:

```
Please deploy a DNS TXT record under the name: _acme-challenge.www.<YOUR-DOMAIN>
with the following value: <SOME-VALUE>
```

To prove that you own your domain name, you need to create a DNS TXT record with the randomly generated value `<SOME-VALUE>`. Head to the Route 53 hosted zones page, click the hosted zone for your domain, and click the "Create record" button. On the next page, fill in `_acme-challenge.www` as the name of the record, select TXT as the type, enter the randomly generated `<SOME-VALUE>` as the value, and click "Create records."

After you create the record, give the changes a minute or two to propagate, and then head back to your terminal, and hit Enter to let Certbot know that the DNS record is ready. Let's Encrypt will validate your DNS record, and if everything worked, it'll issue a TLS certificate, showing you a message similar to the following:

```
Successfully received certificate.
Certificate is saved at: /tmp/certs/live/example/fullchain.pem
Key is saved at: /tmp/certs/live/example/privkey.pem
```

Congrats, you just got a TLS certificate signed by a CA! The certificate itself is in `live/example/fullchain.pem`, and the private key is in `live/example/privkey.pem`. Feel free to take a look at the contents of these two files. One way to do that is to use OpenSSL:

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

This will spit out a bunch of information about your certificate, such as the issuer (Let's Encrypt), the domain name it's for (under Subject), the expiration date (under Validity), and the signature. When you're done poking around, feel free to delete the TXT record from your Route 53 hosted zone, as that record is needed only during the verification process.

Note that the private key of a TLS certificate is an infrastructure secret, so you need to store it in encrypted format, ideally in a secret store, as discussed next.

#### Store the TLS certificate in AWS Secrets Manager

AWS Secrets Manager is a general-purpose secret store that provides a way to store secrets in encrypted format; access secrets via API, CLI, or a web UI; and control access to secrets via IAM. Under the hood, the secrets are encrypted using AES and envelope encryption, with a root key stored in AWS KMS.

:::caution Watch Out for Snakes: AWS Secrets Manager Is Not Part of the AWS Free Tier!
While most of the examples in this book are part of the AWS free tier, Amazon Secrets Manager is not. It does offer a 30-day free trial, so you can try these examples at no cost, but each secret you store after the trial ends will cost you $0.40 per month (prorated).
:::

The typical way to store secrets in AWS Secrets Manager is to format them as JSON. Let's format the TLS certificate as JSON:

```json
{"cert": "<CERTIFICATE>", "key": "<PRIVATE-KEY>"}
```

One way to create this JSON format is to install and use jq, which will also take care of converting special characters for you (e.g., converting new lines to `\n`):

```bash
$ CERTS_JSON=$(jq -n -c -r \
    --arg cert "$(cat live/example/fullchain.pem)" \
    --arg key "$(cat live/example/privkey.pem)" \
    '{cert:$cert,key:$key}')
```

This creates a variable called `CERTS_JSON` that contains the certificate and private key in JSON format. Use the AWS CLI to store this JSON in AWS Secrets Manager:

```bash
$ aws secretsmanager create-secret \
    --region us-east-2 \
    --name certificate \
    --secret-string "$CERTS_JSON"
```

This creates a secret with the ID `certificate` in AWS Secrets Manager. If you head over to the AWS Secrets Manager console, you should see the secret called `certificate` in the list. Click it, and on the next page, click "Retrieve secret value" and check that the `cert` and `key` values show up correctly.

If everything looks OK, delete the TLS certificate from your hard drive:

```bash
$ certbot delete \
    --config-dir . \
    --work-dir . \
    --logs-dir .
```

Let's now move on to deploying servers that use these TLS certificates.

#### Deploy EC2 instances that use the TLS certificate

:::info Example Code
As a reminder, you can find all the code examples in the book's repo in GitHub.
:::

In Chapter 7, you deployed several EC2 instances that responded with Hello, World! to HTTP requests on port 8080, and you configured a domain name for those instances in Route 53. Let's extend that example to listen for HTTPS requests on port 443 (the default port for HTTPS), using the TLS certificate in AWS Secrets Manager. Head into the folder you've been using for this book's examples and create a new subfolder for this chapter:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch8/tofu/live
```

Next, copy over your code from Chapter 7 into a new folder called `ec2-dns-tls`:

```bash
$ cp -r ch7/tofu/live/ec2-dns ch8/tofu/live/ec2-dns-tls
```

In `ec2-dns-tls/main.tf`, make the following changes:

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
```

Also in `main.tf`, add the code to allow the EC2 instances to read the TLS certificate data from AWS Secrets Manager:

```hcl
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

Now it's time to update the app itself to use the TLS certificate. Copy the Packer template you created in Chapter 3:

```bash
$ cp -r ch3/packer ch8/packer
```

To fetch the TLS certificate from AWS Secrets Manager, the app will need to use the AWS SDK for Node.js. To install the SDK, first add a minimal `package.json` file in `packer/sample-app`:

```json
{
  "name": "sample-app-packer",
  "version": "0.0.1",
  "description": "Sample app for 'Fundamentals of DevOps and Software Delivery'",
  "author": "Yevgeniy Brikman"
}
```

Next, run npm install to add the AWS Secrets Manager library from the AWS SDK:

```bash
$ cd ch8/packer/sample-app
$ npm install --save @aws-sdk/client-secrets-manager
```

Update the sample app code in `app.js` to use this library:

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

Here are the changes to make to the sample app:

1. Instead of using the http Node.js library, use the https library.
2. To fetch the TLS certificate from AWS Secrets Manager, you're going to have to make an API call, which in Node.js means you'll be using asynchronous I/O. I like using await to deal with this sort of I/O, but you can use await only inside a function marked async, so wrap the rest of the code in an async function that immediately runs itself.
3. Use the AWS Secrets Manager library to fetch the TLS certificate.
4. Parse the data as JSON.
5. Use the https library to run an HTTPS server, and pass it the JSON as configuration. The Node.js https library looks for TLS certificates under the `cert` and `key` fields in its configuration; not coincidentally, these are the exact field names you used when storing the TLS certificate in AWS Secrets Manager.
6. Listen on port 443 rather than port 8080.

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

You need to make two changes to the script:

1. In the past, apps could listen on port 443, or any port less than 1024, only with root user permissions. Nowadays, you can use the Linux capabilities system to grant apps fine-grained permissions, such as binding to low-numbered ports. The preceding code uses the `setcap` utility to grant the node binary permissions to bind on low-numbered ports.
2. Since the sample-app now has dependencies, you need to run `npm ci` to install them.

Finally, update the Packer template in `sample-app.pkr.hcl`:

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

Build a new AMI by authenticating to AWS and running Packer:

```bash
$ cd ../
$ packer init sample-app.pkr.hcl
$ packer build sample-app.pkr.hcl
```

Once the new AMI is built, deploy as usual:

```bash
$ cd ../tofu/live/ec2-dns-tls
$ tofu init
$ tofu apply
```

When apply completes, give the servers a minute or two to boot up, and then test `https://www.<DOMAIN_NAME>`:

```bash
$ curl https://www.<DOMAIN_NAME>
Hello, World!
```

If you see the familiar Hello, World! text, congrats, you're now encrypting data in transit by using TLS, and you're encrypting data at rest by using AWS Secrets Manager!

:::info Get Your Hands Dirty
Here are a few exercises you can try at home to go deeper:

- Let's Encrypt certificates expire after 90 days, so configure Certbot to run on a schedule to automatically renew your certs (scheduled Lambda functions and the `certbot-dns-route53` plugin may help).
- Instead of individual EC2 instances, try deploying an ASG with an ALB, and use AWS ACM to provision a free, auto-renewing TLS certificate for your ALB.

When you're done experimenting, commit your changes to Git, and undeploy this example by running `tofu destroy`. You may also wish to mark the certificate secret for deletion in AWS Secrets Manager (so you don't get charged after the trial period).
:::

Now that you've seen how to transmit data securely over TLS, the last topic to discuss is how to enforce encryption everywhere.

### End-to-End Encryption

The web servers you deployed in the previous section are representative of servers that you expose directly to the public internet (in a DMZ), such as load balancers. In fact, the approach many companies have used for years is to solely encrypt connections from the outside world to the load balancers, which is sometimes referred to as **terminating the TLS connection**. All the other connections within the data center, such as connections between microservices, were left unencrypted.

You may recognize this as the castle-and-moat networking approach from Chapter 7, and it has all the same security drawbacks. As companies move more toward the zero trust architecture approach, they instead require that all network connections are encrypted.

At this point, you're enforcing encryption in transit everywhere. The next logical step is to enforce encryption at rest everywhere too.

Encrypting all data at rest and in transit used to be known as **end-to-end (E2E) encryption**. Assuming you do a good job of protecting the underlying encryption keys, this ensures that all your customer data is protected at all times, and there is no way for a malicious actor to get access to it. But it turns out there is one more malicious actor to consider: you. That is, your company and all its employees. The modern definition of E2E encryption that applies in some cases is that not even the company providing the software should be able to access customer data. For example, this definition of E2E encryption is important in messaging apps, as you typically don't want the company providing the messaging software to be able to read any of the messages; it's also important in password managers, as you read earlier in this chapter, because you don't want the company providing the password manager software to be able to read any of your passwords.

With this definition of E2E encryption, the only people who should be able to access the data are the customers who own it. That means the data needs to be encrypted client-side, before it leaves the user's device.

:::tip Key Takeaway #9
Use E2E encryption to protect data so that no one other than the intended recipients can see it—not even the software provider.
:::

From a privacy and security perspective, E2E encryption is great. However, before you buy the hype and sign up for the latest E2E encryption messaging app or try to build your own E2E-encrypted software, you should ask some questions:

1. What encryption key do you use for E2E encryption?
2. What data needs to be E2E encrypted, and what doesn't?
3. How do you establish trust with E2E-encrypted software?

Let's look at these one at a time.

#### What encryption key do you use for E2E encryption?

This is perhaps the easiest of the three questions to answer: most E2E-encrypted software uses envelope encryption. The root key is typically derived from whatever authentication method you use to access the software (e.g., the password you use to log in to the app). This root key is used to decrypt one or more data keys, which are stored in encrypted format, either on the user's device or in the software provider's servers. Once the data key is decrypted, the software typically keeps it in memory and uses it to encrypt and decrypt data client-side.

For some types of software, the data keys are encryption keys used with symmetric-key encryption; for example, an E2E-encrypted password manager may use AES to encrypt and decrypt your passwords. For other types of software, the data keys may be private keys for asymmetric-key encryption; for example, an E2E-encrypted messaging app may give each user a private key that is stored on the device and used to decrypt messages, and a public key that can be shared with other users to encrypt messages.

#### What data needs to be E2E encrypted, and what doesn't?

This is a slightly trickier question, as not all data can be encrypted client-side. A minimal set of data must always be visible to the software vendor, or the software won't be able to function at all. For example, in an E2E-encrypted messaging app, at a minimum, the software vendor must be able to see the recipients of every message so that the message can be delivered to those recipients.

Beyond this minimum set of data, each software vendor has to walk a fine line. On the one hand, the more data you encrypt client-side, the more you protect your user's privacy. On the other hand, encrypting more data client-side comes at the cost of limiting the functionality you can provide server-side. Whether these limitations are good or bad is a question of your values. For example, the more you encrypt client-side, the harder it is to do server-side search and ad targeting. Is it good or bad that an ad-supported search business like Google could not exist in an E2E-encrypted world?

#### How do you establish trust with E2E-encrypted software?

This is the trickiest question of all. How do you know you can trust software that claims to be E2E encrypted? Consider all the ways this trust could be broken:

**The software vendor could be lying**: Some companies that claimed their software offered E2E encryption were later found out to be lying or exaggerating. For example, according to the FTC, Zoom claimed that it provided E2E encryption for user communications, whereas in reality, "Zoom maintained the cryptographic keys that could allow Zoom to access the content of its customers' meetings."

**The software vendor could have backdoors**: Sometimes a vendor genuinely tries to provide E2E encryption, but a government agency forces the vendor to install backdoors (hidden methods to access the data). For example, the documents Edward Snowden leaked to The Guardian showed that Microsoft provided the NSA with backdoors into Skype and Outlook, despite claiming those systems used E2E encryption.

**The software could have bugs**: Even if the vendor isn't intentionally lying or building in backdoors, the software could still be buggy and provide unintentional ways to bypass E2E encryption.

**The software (or hardware!) could be compromised**: Even if the software has no bugs, how do you know that it hasn't been compromised by an attacker? For example, if you downloaded the software from a website, how do you know that a hacker didn't intercept the download and swap in a compromised version of the software? If your answer is that the website used TLS, then how do you know you can trust the TLS certificate? If your answer is that you can rely on the signatures of root CAs, how do you know you can trust the list of root CAs hardcoded into your OS or web browser? What if those were compromised? Or what if other software on your computer was compromised? Or even the hardware?

This last problem has no perfect solution. In fact, this problem isn't even unique to E2E-encrypted software, or software at all. Fundamentally, this is a question of how you establish trust, and it's something humans have been grappling with for our entire existence. Technology can help, but it's not the full solution. At some point, you need to make a judgment call to trust something, or someone, and build from there.

## Conclusion

You've now seen how to secure storage and communication, as per the nine key takeaways from this chapter:

1. Don't roll your own cryptography. Always use mature, battle-tested, proven algorithms and implementations.
2. Do not store secrets as plaintext.
3. Avoid storing secrets whenever possible by using SSO, third-party services, or just not storing the data at all.
4. Protect personal secrets, such as passwords and credit card numbers, by storing them in a password manager.
5. Protect infrastructure secrets, such as database passwords and TLS certificates, by using a KMS and/or a general-purpose secret store.
6. Never store user passwords (encrypted or otherwise). Instead, use a password hash function to compute a hash of each password with a salt and pepper and then store those hash values.
7. You can encrypt data at rest by using full-disk encryption, data store encryption, and application-level encryption.
8. You can encrypt data in transit by using TLS. You get a TLS certificate from a certificate authority.
9. Use E2E encryption to protect data so that no one other than the intended recipients can see it—not even the software provider.

As you read through this chapter, you came across many cryptographic techniques and tools. The following table summarizes all this information in a "cheat sheet" organized by use case. Next time you need to figure out the right approach to use to secure storage or communication, have a scan through this table.

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

Much of this chapter focused on storing data securely. Let's now move on to Chapter 9, where you'll learn more about data storage, including how to use SQL, NoSQL, queues, warehouses, and file stores.

---

**Previous:** [Networking](/operations-architecture/ch07-networking) | **Next:** [Storage](/operations-architecture/ch09-storage)
