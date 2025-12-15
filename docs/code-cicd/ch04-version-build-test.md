---
sidebar_position: 2
title: "Version, Build, and Test Code"
description: "Learn how to use version control, build systems, and automated testing to enable team collaboration and maintain code quality in modern software development."
---

import { ProcessFlow, TreeDiagram, CardGrid, colors } from '@site/src/components/diagrams';

# Chapter 4. How to Version, Build, and Test Your Code

## Table of Contents

1. [Version Control](#version-control)
2. [Build System](#build-system)
3. [Automated Testing](#automated-testing)
4. [Testing Recommendations](#testing-recommendations)
5. [Conclusion](#conclusion)

## 1. Introduction: The Team Collaboration Challenge

In Chapter 2, you learned how to manage your infrastructure, and in Chapter 3, you learned how to manage your apps. You wrote code using tools like Node.js, Kubernetes, and OpenTofu.

But what did you do with all that code? Is it just sitting on your computer?

That's fine for learning, but most software development is a team sport. You need to solve three critical problems:

**Code access**
All developers need access to the same code. When they make changes, you need to merge their work together.

**Automation**
To save time and ensure consistency, you need to automate common operations like downloading dependencies, building code, and packaging.

**Correctness**
It's hard enough to make your own code work. When multiple people modify it, you need to prevent a stream of bugs.

Modern companies solve these problems using three tools:

- Version control
- Build system
- Automated testing

<ProcessFlow
  title="Git Workflow"
  steps={[
    {
      label: "Create Branch",
      description: "Create feature branch from main",
      color: colors.blue
    },
    {
      label: "Make Changes",
      description: "Write code and commit frequently",
      color: colors.green
    },
    {
      label: "Open PR",
      description: "Request code review from team",
      color: colors.purple
    },
    {
      label: "Review & Test",
      description: "Automated tests and peer review",
      color: colors.orange
    },
    {
      label: "Merge",
      description: "Integrate changes into main",
      color: colors.green
    }
  ]}
/>

## 2. Version Control

### 2.1. What is Version Control?

**In plain English:** Version control is like a time machine for your code. You can go back to any point in history and see what changed.

**In technical terms:** A version-control system (VCS) is a tool that stores source code, shares it with your team, integrates work together, and tracks changes over time.

**Why it matters:** Without version control, teams overwrite each other's work and lose the ability to undo mistakes.

> **Insight**
>
> Version control was item 1 on the Joel test 25 years ago and remains central to every modern software delivery process. The first version-control system was developed roughly 50 years ago.

### 2.2. Git and GitHub

Numerous options exist for version control:

- Apache Subversion
- Perforce
- Mercurial
- Git (most popular)

For Git hosting, several options exist:

- GitHub (most popular)
- GitLab
- Bitbucket

> **Warning**
>
> Many examples in the rest of this book require Git and GitHub. If you don't know how to use these tools, go through the "Learn Git and GitHub in 15 Minutes" tutorial on this book's website.

### 2.3. Example: Turn Your Code into a Git Repo

Go into the folder you've been using to work on the code samples for this book. Turn it into a Git repo by running `git init`:

```bash
$ cd fundamentals-of-devops
$ git init
Initialized empty Git repository in /fundamentals-of-devops/.git/
```

Next, add a `.gitignore` file with the contents shown below.

**Example 4-1. The gitignore file (.gitignore)**

```
*.tfstate*
.terraform
*.key
*.zip
node_modules
```

**Understanding the .gitignore file:**

The `.gitignore` file specifies files that Git should not track:

- `*.tfstate*` - OpenTofu state (you'll learn the proper way to store state in Chapter 5)
- `.terraform` - OpenTofu's scratch directory
- `*.key` - SSH private keys (secrets should never be in version control)
- `*.zip` - Build artifacts (don't belong in version control)
- `node_modules` - Node.js dependencies (downloaded automatically)

> **Insight**
>
> Commit `.gitignore` first to ensure you don't accidentally commit files that don't belong in version control.

Commit the `.gitignore` file:

```bash
$ git add .gitignore
$ git commit -m "Add .gitignore"
```

Now commit the rest of your code:

```bash
$ git add .
$ git commit -m "Example code for first few chapters"
```

The code is now in a Git repo on your local computer. The next step is to push it to GitHub.

### 2.4. Example: Store Your Code in GitHub

To store your code in GitHub:

1. If you don't have a GitHub account already, sign up for one now (it's free)
2. Authenticate to GitHub in your terminal
3. Create a new private repo in GitHub
4. Add your new GitHub repo as a remote in your local Git repo:

```bash
$ git remote add origin https://github.com/<USERNAME>/<REPO>.git
```

5. Push the main branch of your local Git repo to GitHub:

```bash
$ git push origin main
```

In subsequent chapters, you will use GitHub as a central part of your software delivery process.

This includes collaboration, automated tests, automated deployments, and more.

### 2.5. Version-Control Recommendations

Now that your code is in version control, let's go through tips on how to use it effectively:

- Always use version control
- Write good commit messages
- Commit early and often
- Use a code-review process
- Protect your code

#### 2.5.1. Always Use Version Control

The single most important recommendation with version control is to use it.

> **Key Takeaway 1**
>
> Always manage your code with a version-control system.

**In plain English:** If you're writing code, store it in version control. No exceptions.

**Why it matters:** Using version control is easy, cheap or free, and provides massive benefits for software engineering.

#### 2.5.2. Write Good Commit Messages

Commit messages are important. When you're trying to figure out what caused a bug or an outage, `git log` and `git blame` can be your best friends.

But only if the commit messages are well written.

Good commit messages consist of two ingredients:

**Summary**
The first line should be a short summary of the change (fewer than 50 characters).

**Context**
If the change is trivial, a summary line is enough. For anything larger, add a new line and provide context.

Focus on the *what* and *why*, which you can't get from reading code. Don't focus on the *how*, which should be clear from the code itself.

Here's an example:

```
Fix bug with search auto complete

A more detailed explanation of the fix, if necessary. Provide
additional context that isn't obvious from reading the code.

- Use bullet points
- If appropriate

Fixes #123. Jira #456.
```

> **Insight**
>
> Just adding summary and context will make your commit messages considerably better. For large projects, consider adopting Conventional Commits.

#### 2.5.3. Commit Early and Often

**In plain English:** Break large problems into small, manageable parts. Do the same with your commits.

**In technical terms:** Aim for atomic commits and atomic pull requests.

**Why it matters:** Small, frequent commits are easier to understand, review, and revert if needed.

**Atomic commits**
Each commit should do exactly one small, relatively self-contained task.

You should be able to describe it in one short sentence (your commit message summary).

If you can't fit everything into one sentence, the commit is likely doing too many tasks and should be broken into multiple commits.

**Atomic pull requests**
Each pull request (PR) should do exactly one small, relatively self-contained task.

A single PR can contain multiple commits, so it'll naturally be larger in scope.

But it should still represent a set of cohesive changes that naturally and logically go together.

> **Warning**
>
> If your PR contains a new feature, a bug fix, and refactored code, that's usually a sign you should break it into three separate PRs.

**Benefits of atomic commits and PRs:**

- **More useful Git history** - Commits that do one task are easier to understand than those that do many
- **Easier code reviews** - Reviewing small, self-contained changes is easy. Reviewing massive PRs with thousands of lines is hard
- **Cleaner mental model** - Breaking down work ahead of time produces cleaner results
- **Stronger safety net** - Committing hourly means you'll never lose more than an hour of work
- **More frequent integration** - Small, frequent commits make team integration easier (as you'll see in Chapter 5)

> **Get Your Hands Dirty**
>
> It's normal for initial commits to be messy. Learn how to go back and tidy up by amending commits, squashing commits, and rebasing (see "Rewriting History in Git").

#### 2.5.4. Use a Code-Review Process

> Every page in this book has been checked over by an editor. Why? Because even if you're the smartest, most capable, most experienced writer, you can't proofread your own work. You're too close to the concepts. Writing code is no different.
>
> — Jason Cohen in *Making Software*

**In plain English:** Just like writers need editors, programmers need code reviewers.

**In technical terms:** Code reviews reduce defect rates by 50–80% and spread knowledge throughout the team.

**Why it matters:** You can't catch all your own bugs. A second pair of eyes dramatically improves code quality.

**Code review approaches:**

- **Enforce a PR workflow** - All changes go through PRs with reviews before merging
- **Use pair programming** - Two programmers work at one computer (driver and observer)
- **Use formal inspections** - Live code review meetings for mission-critical parts

> **Insight**
>
> Define your code review guidelines up front. Everyone will know what to look for (automated tests), what not to look for (code formatting), and how to communicate feedback effectively.

For an example, see Google's Code Review Guidelines.

#### 2.5.5. Protect Your Code

For many companies, the code you write is your most important asset. It's also highly sensitive.

If someone slips malicious code into your codebase, it can be devastating.

Enable these security measures to protect your code:

**Signed commits**
Git allows you to set your username and email to any values. You could make commits pretending to be someone else!

**How it works:**
- Create a GPG or SSH key (public and private key pair)
- Configure Git to use the private key to sign your commits
- Upload your public key to your VCS host to validate signatures
- Enable commit signature verification in your repos

**Branch protection**
Most VCS hosts allow you to enforce requirements before code can be pushed to certain branches.

**Example requirements:**
- All code changes to main must be submitted via PRs
- PRs must be reviewed by at least *n* other developers
- Certain checks (security scans) must pass before PRs can merge

> **Insight**
>
> Even if an attacker compromises one developer account, they still won't be able to merge code into main without scrutiny.

## 3. Build System

### 3.1. What is a Build System?

**In plain English:** A build system is like a recipe book for your code. It tells everyone how to compile, test, and package your application the same way.

**In technical terms:** Most software projects use a build system to automate important operations, such as compiling code, downloading dependencies, packaging the app, and running automated tests.

**Why it matters:** Without a build system, every developer has their own ad hoc scripts. This leads to "works on my machine" problems.

> **Key Takeaway 2**
>
> Use a build system to capture, as code, important operations and knowledge for your project in a way that can be used both by developers and automated tools.

### 3.2. Choosing a Build System

The reality is that for most software projects, you can't *not* have a build system.

Either you use an off-the-shelf build system, or you create your own out of ad hoc scripts, duct tape, and glue.

**Language-specific build tools:**
- Rake for Ruby
- Gradle for Java
- npm for JavaScript (Node.js)

**Language-agnostic build tools:**
- Bazel
- Just
- Make (the granddaddy of all build systems)

> **Insight**
>
> Language-specific tools will give you the best experience with that language. Use language-agnostic tools like Bazel only for massive teams using dozens of languages in a single repo.

<TreeDiagram
  title="Build Pipeline Steps"
  root={{
    name: "npm start",
    children: [
      {
        name: "Install Dependencies",
        children: [
          { name: "npm ci --production" }
        ]
      },
      {
        name: "Build & Package",
        children: [
          { name: "Compile TypeScript" },
          { name: "Bundle Assets" },
          { name: "Create Docker Image" }
        ]
      },
      {
        name: "Run Tests",
        children: [
          { name: "Unit Tests" },
          { name: "Integration Tests" },
          { name: "E2E Tests" }
        ]
      }
    ]
  }}
/>

### 3.3. Example: Configure Your Build by Using npm

> **Example Code**
>
> You can find all code examples in the book's repo in GitHub.

Let's set up npm as the build system for the Node.js sample app.

Head into the folder you created for this book and create a new subfolder:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch4/sample-app
$ cd ch4/sample-app
```

Copy the `app.js` file you first saw in Chapter 1:

```bash
$ cp ../../ch1/sample-app/app.js .
```

Next, make sure you have Node.js installed. This should also install npm for you.

To use npm as a build system, you must first configure the build in a `package.json` file.

You can create this file by hand, or let npm scaffold it for you by running `npm init`:

```bash
$ npm init
```

npm will prompt you for the package name, version, description, and so on.

You can enter whatever data you want, or hit Enter to accept the defaults.

When you're done, you should have a `package.json` file that looks similar to this:

**Example 4-2. The generated npm build file (ch4/sample-app/package.json)**

```json
{
  "name": "sample-app",
  "version": "0.0.1",
  "description": "Sample app for 'Fundamentals of DevOps and Software Delivery'",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

Most of this build file is metadata about the project. The part to focus on is the `scripts` object.

npm has built-in commands like `npm install`, `npm start`, and `npm test`.

All of these have default behaviors, but you can override them by updating the `scripts` block.

Update the `scripts` block with a `start` command, which will define how to start your app:

**Example 4-3. Add a start command to the scripts block (ch4/sample-app/package.json)**

```json
"scripts": {
  "start": "node app.js"
}
```

Now you can use the `npm start` command to run your app:

```bash
$ npm start

> sample-app@0.0.1 start
> node app.js

Listening on port 8080
```

### 3.4. The Power of Convention

**In plain English:** `npm start` may not seem like much of a win over `node app.js`, but the difference is convention.

**In technical terms:** `npm start` is a well-known convention. Most developers and tooling familiar with Node.js know to try `npm start`.

**Why it matters:** Running `node app.js` is known only to you. Documentation becomes outdated, but code in your build system that your team runs regularly stays current.

Of course, `start` isn't the only command you would add. The idea is to add all common operations to the build.

For example, in Chapter 3, you created a Dockerfile to package the app as a Docker image.

To build that Docker image for multiple CPU architectures (arm64, amd64), you had to use a complicated `docker buildx` command.

This is perfect for capturing in your build system.

First, create a Dockerfile with the contents shown below:

**Example 4-4. Dockerfile for the app (ch4/sample-app/Dockerfile)**

```dockerfile
FROM node:21.7

WORKDIR /home/node/app

COPY *.json .
COPY *.js .

EXPOSE 8080

USER node

CMD ["npm", "start"]
```

This is identical to the Dockerfile from Chapter 3, except for three changes:

1. Copy all `.json` files, including `package.json`, into the Docker image
2. Copy all `.js` files, including `app.js`, into the Docker image
3. Use `npm start` to start the app, rather than hardcoding `node app.js`

> **Insight**
>
> If you ever change how you run the app (which you will later in this chapter), the only thing you'll need to update is `package.json`.

Second, create a script called `build-docker-image.sh`:

**Example 4-5. A script to build a Docker image (ch4/sample-app/build-docker-image.sh)**

```bash
#!/usr/bin/env bash

set -e

name=$(npm pkg get name | tr -d '"')
version=$(npm pkg get version | tr -d '"')

docker buildx build \
  --platform=linux/amd64,linux/arm64 \
  --load \
  -t "$name:$version" \
  .
```

This script does the following:

1. Use `npm pkg get` to read `name` and `version` from `package.json`. This ensures `package.json` is the single source of truth
2. Run the `docker buildx` command, setting the Docker image name and version to the values from step 1

Make the script executable:

```bash
$ chmod u+x build-docker-image.sh
```

Finally, add a `dockerize` command to the `scripts` block in `package.json`:

**Example 4-6. Add a dockerize command (ch4/sample-app/package.json)**

```json
"scripts": {
  "start": "node app.js",
  "dockerize": "./build-docker-image.sh"
}
```

Now, instead of trying to figure out a long, esoteric `docker buildx` command, team members can execute `npm run dockerize`:

```bash
$ npm run dockerize
```

> **Note:** You need `npm run dockerize` and not just `npm dockerize`, as `dockerize` is a custom command and not one of the ones built into npm.

### 3.5. Dependency Management

#### 3.5.1. What are Dependencies?

**In plain English:** Dependencies are other people's code that your code uses. Think of them as building blocks.

**In technical terms:** Most software projects rely on a large number of dependencies—other software packages and libraries that your code uses.

**Why it matters:** 96% of codebases rely on open source, and 70% of all code originates from open source (2024 Open Source Security and Risk Analysis Report).

**Types of dependencies:**

- **Code in the same repo** - Break code into multiple modules that depend on one another
- **Code in different repos** - Your company stores code across multiple repos
- **Open source code** - The most common type of dependency these days

#### 3.5.2. Never Copy and Paste Dependencies

Whatever type of dependency you have, never copy and paste dependencies into your codebase.

**Problems with copy-pasting:**

- **Transitive dependencies** - If a dependency has its own dependencies, copying becomes difficult
- **Staying up-to-date** - You'll have to copy and paste new code and dependencies repeatedly
- **Private APIs** - You may use private APIs instead of public ones, leading to unexpected behavior
- **Bloating your repo** - Every dependency you copy makes your VCS larger and slower

> **Key Takeaway 3**
>
> Use a dependency management tool to pull in dependencies—not copy and paste.

**The better way:**

Use a dependency management tool. Most build systems have dependency management built in.

You define dependencies as code in the build configuration, including the version.

The dependency management tool downloads that dependency, plus any transitive dependencies, and makes them available to your code.

### 3.6. Example: Add Dependencies in npm

So far, the Node.js sample app has not had any dependencies other than the `http` standard library built into Node.js.

Although you can build web apps this way, the more common approach is to use a web framework.

For example, Express is a popular web framework for Node.js. To use it:

```bash
$ npm install express --save
```

If you look into `package.json`, you will now have a new `dependencies` section:

**Example 4-7. npm-managed dependencies (ch4/sample-app/package.json)**

```json
"dependencies": {
  "express": "^4.19.2"
}
```

You should also see two other changes in the folder:

**node_modules**
This is a scratch directory where npm downloads dependencies.

This folder should be in your `.gitignore` file so you do not check it into version control.

Instead, whenever anyone checks out the repo, they can run `npm install`, and npm will automatically install all dependencies.

**package-lock.json**
This is a dependency lock file, which captures the exact dependencies that were installed.

This is useful because in `package.json`, you can specify a version range instead of a specific version.

For example, `npm install` set the version of Express to `^4.19.2`.

Note the caret (`^`) at the front. This is a caret version range, and it allows npm to install any version of Express at or above 4.19.2 (so 4.20.0 would be OK, but not 5.0.0).

> **Insight**
>
> Without a lock file, every time you ran `npm install`, you might get a different version of Express. With a lock file, you get the exact version defined in that lock file, ensuring reproducible builds.

Now that Express is installed, you can rewrite the code in `app.js` to use the Express framework:

**Example 4-8. The sample app rewritten using Express (ch4/sample-app/app.js)**

```javascript
const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

This app listens on port 8080 and responds with "Hello, World!" just as before.

But because you're using a framework, it'll be easier to evolve this code by leveraging all the features built into Express (routing, templating, error-handling, middleware, security).

Now that the app has dependencies, you need to update the Dockerfile to install dependencies:

**Example 4-9. Install dependencies (ch4/sample-app/Dockerfile)**

```dockerfile
COPY *.json .

RUN npm ci --only=production

COPY *.js .
```

You're making just one change:

Run `npm ci`, which is similar to `npm install`, except it's designed to do a clean install.

It deletes any previously installed dependencies and then installs them from scratch based on `package-lock.json`.

The command throws an error if any dependencies in `package.json` don't match what's in `package-lock.json`.

This is meant for automated environments where you want reproducible builds.

Note the use of the `--only=production` flag to install only production dependencies.

You can have a `devDependencies` block in `package.json` for dependencies used only in the dev environment (like testing tools).

There's no need to bloat the Docker image with these dependencies.

Check that everything works by building a Docker image and running it:

```bash
$ npm run dockerize
$ docker run -p 8080:8080 -it --init sample-app:0.0.1
Example app listening on port 8080
```

If you open http://localhost:8080, you should see "Hello, World!"

> **Get Your Hands Dirty**
>
> To avoid introducing too many new tools, I used npm as a build system in this chapter. For production, you may want to try a more modern and robust build system, such as Yarn, Turborepo, or Lerna.

## 4. Automated Testing

### 4.1. Why Automated Testing Matters

> Programming can be scary. One of the underappreciated costs of technical debt is the psychological impact it has on developers. Thousands of programmers out there are scared of doing their jobs. Perhaps you're one of them.
>
> You get a bug report at three in the morning and, after digging around, you isolate it to a tangled mess of spaghetti code. There is no documentation. The developer who originally wrote the code no longer works at the company. You don't understand what the code is doing. You don't know all the places it gets used. What you have here is legacy code.
>
> — Michael Feathers, *Working Effectively with Legacy Code*

**In plain English:** Legacy code is scary. You're afraid because you still have scars from "trivial" changes that took two months or brought down the whole system.

**In technical terms:** The main reason to write automated tests is not to prove correctness (they don't) or to catch all bugs (you won't), but to give you the **confidence** to make changes quickly.

**Why it matters:** The key word is confidence. Tests provide a psychological benefit as much as a technical one.

> **Key Takeaway 4**
>
> Use automated tests to give your team the confidence to make changes quickly.

**Benefits of automated tests:**

- You don't have to keep the state of the whole program in your head
- You don't have to worry about breaking other people's code
- You don't have to repeat the same boring, error-prone manual testing over and over
- You just run a single test command and get rapid feedback on whether the code is working

### 4.2. A Personal Story: The Database Disaster

In 2008, I had just started a job at TripAdvisor. My first task was to add a new sort option to the hotel listings page.

I got it done and pushed to production in my first week.

The same day, my manager went to test it. He selected the new sort option on the Paris hotels page and waited.

And waited. And waited.

It took nearly two hours for the page to load. Or maybe it was two minutes.

It's hard to tell when you're sweating profusely and wondering whether you're going to be fired in your first week on the job.

Later that night, I figured out that my sorting code called a function that made two database calls.

I was calling this function during sort comparisons. As it takes roughly *n* log *n* comparisons to sort *n* items, where *n* = 2,000 for Paris, that works out to roughly 40,000 database calls for a single page load.

I didn't get fired that day. Good companies recognize that incidents aren't caused by a single person but by systemic failures.

They use incidents to improve tools and processes.

> **Insight**
>
> What tooling could have caught this issue before it reached production? What processes could mitigate damage if issues do make it to production? In Chapter 5, you'll learn how continuous integration, canary deployments, and feature toggles help answer these questions.

I had manually tested my sorting feature, but I hadn't written any automated tests. As a result, I nearly melted our database.

From that experience, I learned about all the types of automated tests.

### 4.3. Types of Automated Tests

**Compiler**
If you're using a statically typed language (Java, Scala, Go, TypeScript), you can compile the code to identify syntactic issues and type errors.

If you're using a dynamically typed language (Ruby, Python, JavaScript), you can pass the code through the interpreter to identify syntactic issues.

**Static analysis/linting**
Tools that read and check your code statically (without executing it) to automatically identify potential issues.

Examples: ShellCheck for Bash, ESLint for JavaScript, Terrascan for OpenTofu.

**Policy tests**
Policy-as-code tools define and enforce company policies and legal regulations in code.

Examples: Open Policy Agent (OPA) and Sentinel.

Many are based on static analysis, except they give you flexible languages to define the rules you want to check.

**Plan tests**
Whereas static analysis tests code without executing it, plan testing partially executes your code.

This applies only to tools that can generate an execution plan, like OpenTofu.

The `plan` command shows the changes the code would make without actually making them (running all read operations but none of the write operations).

You can write automated tests against plan output using tools like OPA and Terratest.

**Unit tests**
This is the first test type that fully executes your code.

Unit tests execute only a single unit of your code. The definition of a "unit" depends on the programming language, but it's typically a small part, like one function or one class.

You typically mock any dependencies outside that unit (databases, other services, the filesystem).

> **Insight**
>
> Had I written unit tests for my sorting code at TripAdvisor, I would've had to mock out the database and might've realized how many database calls my code was making, catching the bug before production.

Examples: testing package for Go, unittest for Python, JUnit for Java, Jest for JavaScript.

**Integration tests**
Just because you've tested a unit in isolation doesn't mean multiple units will work together.

Integration testing tests multiple units of your code (multiple functions or classes), often with a mix of real dependencies (a database) and mocked dependencies (a mock remote service).

**End-to-end (E2E) tests**
These tests verify that your entire product works as a whole.

You run your app, all the other services you rely on, all your databases and caches, and test them all together.

These often overlap with acceptance tests, which verify your product works from the user or customer perspective.

> **Insight**
>
> If I had created an E2E test for my sorting code at TripAdvisor, I might have noticed that the test took ages to run on larger cities and caught the bug then.

**Performance tests**
Most unit, integration, and E2E tests verify correctness under ideal conditions: one user, low system load, and no failures.

Performance tests verify stability and responsiveness in the face of heavy load and failures.

> **Insight**
>
> If I had created performance tests for my sorting code at TripAdvisor, it would've been obvious that my change had severely degraded performance.

Automated tests are how you fight your fear. They are how you fight legacy code.

In fact, Michael Feathers writes, "To me, legacy code is simply code without tests."

I don't want to add more legacy code to this world, so that means it's time to write some tests!

### 4.4. Example: Add Automated Tests for the Node.js App

Look again at the Node.js sample app code in Example 4-8. How do you know this code actually works?

So far, you've answered that question through manual testing: manually running the app with `npm start` and checking URLs in your browser.

This works fine for a tiny, simple app. But once the app grows larger (hundreds of URLs) and your team grows larger (hundreds of developers), manual testing becomes too time-consuming and error prone.

With automated testing, you write code that performs the testing steps for you.

This takes advantage of the computer's capability to perform checks faster and more reliably than a person.

Let's add an E2E test for the sample app that makes an HTTP request and checks the response.

To do that, you first need to split `app.js` into two parts:

- One part that configures the app
- One part that has the app listen on a port

This allows you to write automated tests for the configuration part and run those tests concurrently, without errors due to trying to listen on the same port.

Update `app.js` to configure only the Express app:

**Example 4-10. Update app.js to configure only the app (ch4/sample-app/app.js)**

```javascript
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

module.exports = app;
```

Next, create a new file called `server.js` that imports the code from `app.js` and has it listen on a port:

**Example 4-11. Create server.js to listen on a port (ch4/sample-app/server.js)**

```javascript
const app = require('./app');

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

Update the `start` command in `package.json` to now use `server.js`:

**Example 4-12. Update the start command (ch4/sample-app/package.json)**

```json
"start": "node server.js",
```

Next, install testing libraries. Use Jest as a testing framework and SuperTest as a library for testing HTTP apps.

Use `npm install` with the `--save-dev` flag to save them as dev dependencies:

```bash
$ npm install --save-dev jest supertest
```

This updates `package.json` with a new `devDependencies` section:

**Example 4-13. Dev dependencies (ch4/sample-app/package.json)**

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

Update the `test` command in `package.json` to run Jest:

**Example 4-14. Update the test command to run Jest (ch4/sample-app/package.json)**

```json
"scripts": {
  "test": "jest --verbose"
}
```

Finally, add a test in a new file called `app.test.js`:

**Example 4-15. Add an automated test for the app (ch4/sample-app/app.test.js)**

```javascript
const request = require('supertest');
const app = require('./app');

describe('Test the app', () => {
  test('Get / should return Hello, World!', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello, World!');
  });
});
```

Here's how this test works:

1. Import the app code from `app.js`
2. Use the `describe` function to group several tests together
3. Use the `test` function to define individual tests
4. Use the SuperTest library (imported as `request`) to fire up the app and make an HTTP GET request to "/"
5. Use the `expect` matcher to check that the response status code is 200 OK
6. Use `expect` to check that the response body is the text "Hello, World!"

Use `npm test` to run this test:

```bash
$ npm test

PASS ./app.test.js
  Test the app
    ✓ Get / should return Hello, World! (12 ms)

Tests: 1 passed, 1 total
Time: 0.308 s, estimated 1 s
```

The test passes! And it takes all of 0.308 seconds, which is far faster than any manual testing you can do.

That's just for one test. The difference in testing speed only increases as you add more tests.

For example, add a second endpoint to `app.js`:

**Example 4-16. Add a second endpoint to app.js (ch4/sample-app/app.js)**

```javascript
app.get('/name/:name', (req, res) => {
  res.send(`Hello, ${req.params.name}!`);
});
```

When you go to `/name/xxx`, this endpoint will return "Hello, xxx!"

Under the hood, the `/name/:name` syntax tells Express to extract the `:name` part of the path and make it available under `req.params.name`.

Test this by running `npm start`, opening http://localhost:8080/name/Bob:

```
Hello, Bob!
```

Update `app.test.js` to add a test for this new endpoint:

**Example 4-17. Add an automated test for the new endpoint (ch4/sample-app/app.test.js)**

```javascript
test('Get /name/Bob should return Hello, Bob!', async () => {
  const response = await request(app).get('/name/Bob');
  expect(response.statusCode).toBe(200);
  expect(response.text).toBe('Hello, Bob!');
});
```

This test automates the `/name/Bob` check you just did manually. Rerun the tests:

```bash
$ npm test

PASS ./app.test.js
  Test the app
    ✓ Get / should return Hello, World! (13 ms)
    ✓ Get /name/Bob should return Hello, Bob! (5 ms)

Tests: 2 passed, 2 total
Time: 0.339 s, estimated 1 s
```

Excellent! You now have tests for both endpoints, and these tests run in just 0.339 seconds.

### 4.5. Example: Finding a Security Vulnerability

However, there's a serious bug—a security vulnerability—hidden in that second endpoint.

To see it, run `npm start` once more and try opening the following URL:

```
http://localhost:8080/name/%3Cscript%3Ealert(%22hi%22)%3C%2Fscript%3E
```

You should see an alert box popup.

**In plain English:** This is like someone writing graffiti on your wall because you forgot to lock the door.

**In technical terms:** This is an **injection attack** (one of the most common types of attacks per the OWASP Top Ten), where a user includes malicious code in their input, and your application executes that code.

**Why it matters:** This was a **cross-site scripting (XSS)** injection attack. The malicious code was a `<script>` tag (URL encoded) that executes JavaScript. The code `alert("hi")` is harmless, but it could've been far worse, like the 2014 XSS vulnerability in eBay that allowed hackers to steal payment details.

The way to prevent injection attacks is to **sanitize** all user-provided data by stripping out unsafe characters.

Which characters are "unsafe" depends on how you plan to use that data.

If you are using it in a database query, you need to strip out characters specific to SQL (a topic you'll learn about in Chapter 9).

If you are using that data in HTML, as in the Node.js sample app, you need to escape characters specific to HTML, such as angle brackets (`<` and `>`).

A good way to fix this bug is to write an automated test for it first, specifying the expected (escaped) output, and then working on the implementation until that test passes.

This is known as **test-driven development**, a topic you'll learn more about later in this chapter.

Update `app.test.js` with a new test:

**Example 4-18. Add a test for sanitization (ch4/sample-app/app.test.js)**

```javascript
const maliciousUrl = '/name/%3Cscript%3Ealert("hi")%3C%2Fscript%3E';
const sanitizedHtml = 'Hello, &lt;script&gt;alert(&#34;hi&#34;)&lt;/script&gt;!'

test('Get /name should sanitize its input', async () => {
  const response = await request(app).get(maliciousUrl);
  expect(response.statusCode).toBe(200);
  expect(response.text).toBe(sanitizedHtml);
});
```

This test runs the malicious URL from before and expects the resulting HTML to be fully sanitized. Rerun the tests:

```bash
$ npm test

FAIL ./app.test.js
  Test the app
    ✓ Get / should return Hello, World! (13 ms)
    ✓ Get /name/Bob should return Hello, Bob! (3 ms)
    ✕ Get /name should sanitize its input (3 ms)

  ● Test the app › Get /name should sanitize its input

    expect(received).toBe(expected) // Object.is equality

    Expected: "Hello, &lt;script&gt;alert(&#34;hi&#34;)&lt;/script&gt;!"
    Received: "Hello, <script>alert(\"hi\")</script>!"

Tests: 1 failed, 2 passed, 3 total
Time: 0.254 s, estimated 1 s
```

As expected, the test fails. The current code does not sanitize user input.

Now you can work on the implementation code until the test passes.

The best way to sanitize input is to use battle-tested libraries.

For sanitizing HTML, most HTML templating libraries will sanitize input automatically.

Express works with several HTML templating libraries, including Pug, Mustache, and Embedded JavaScript (EJS).

Let's give EJS a shot. First, use `npm install` to install EJS:

```bash
$ npm install --save ejs
```

Second, update `app.js` to use EJS as a template engine:

**Example 4-19. Configure the Express app to use EJS (ch4/sample-app/app.js)**

```javascript
const app = express();
app.set('view engine', 'ejs');
```

Third, update the new endpoint in `app.js`:

**Example 4-20. Render an EJS template (ch4/sample-app/app.js)**

```javascript
app.get('/name/:name', (req, res) => {
  res.render('hello', {name: req.params.name});
});
```

This code renders an EJS template called `hello`, passing it the `:name` parameter.

Create this EJS template under `views/hello.ejs`:

**Example 4-21. The hello EJS template (ch4/sample-app/views/hello.ejs)**

```ejs
Hello, <%= name %>!
```

In EJS, the `<%= xxx %>` syntax renders the value of `xxx` while automatically sanitizing HTML characters.

Also update the Dockerfile to copy the views folder into the Docker image:

**Example 4-22. Copy the views folder (ch4/sample-app/Dockerfile)**

```dockerfile
COPY *.js .
COPY views views
```

To check that the EJS template is working, run the tests one more time:

```bash
$ npm test

PASS ./app.test.js
  Test the app
    ✓ Get / should return Hello, World! (15 ms)
    ✓ Get /name/Bob should return Hello, Bob! (7 ms)
    ✓ Get /name should sanitize its input (2 ms)

Tests: 3 passed, 3 total
Time: 0.32 s, estimated 1 s
```

All your tests are now passing! And these tests take just 0.32 seconds, far faster than you could test those three endpoints manually.

> **Get Your Hands Dirty**
>
> - Try creating other types of automated tests for the Node.js app (static analysis, unit tests, performance tests)
> - Add the `--coverage` flag to the `jest` command to enable code coverage, which shows the percent of your code executed by automated tests

### 4.6. The Power of Rapid Feedback Loops

The process you just went through is a good example of the typical way you write code when you have a good suite of automated tests.

You make a change, you rerun the tests, you make another change, you rerun the tests again, and so on, adding new tests as necessary.

With each iteration, your test suite gradually improves. You build more confidence in your code. And you can go faster and faster.

> **Key Takeaway 5**
>
> Automated testing makes you more productive while coding by providing a rapid feedback loop: make a change, run the tests, make another change, rerun the tests, and so on.

Rapid feedback loops are a big part of the DevOps methodology and a big part of being more productive as a programmer.

This not only makes you more productive in fixing the HTML sanitization bug, but also enables you to have a regression test in place that will prevent that bug from coming back.

This is a massive boost to productivity that often gets overlooked.

> **Key Takeaway 6**
>
> Automated testing makes you more productive in the future too. You save a huge amount of time not having to fix bugs, because the tests prevented those bugs from slipping through in the first place.

All the benefits of automated testing apply not only to application code but also to infrastructure code.

### 4.7. Example: Add Automated Tests for the OpenTofu Code

As an example of infrastructure testing, let's add an E2E test using OpenTofu's built-in `test` command for the `lambda-sample` OpenTofu module you created in Chapter 3.

Copy that module, unchanged, into a new folder for this chapter:

```bash
$ cd fundamentals-of-devops
$ mkdir -p ch4/tofu/live
$ cp -r ch3/tofu/live/lambda-sample ch4/tofu/live
$ cd ch4/tofu/live/lambda-sample
```

The book's sample code repo includes a module called `test-endpoint` in the `ch4/tofu/modules/test-endpoint` folder that can make an HTTP request to an endpoint you specify.

You can use this module to test `lambda-sample`, sending HTTP requests to the function URL and checking you get the expected response.

Create a file called `deploy.tftest.hcl`:

**Example 4-23. OpenTofu test (ch4/tofu/live/lambda-sample/deploy.tftest.hcl)**

```hcl
run "deploy" {
  command = apply
}

run "validate" {
  command = apply

  module {
    source = "brikis98/devops/book//modules/test-endpoint"
    version = "1.0.0"
  }

  variables {
    endpoint = run.deploy.function_url
  }

  assert {
    condition = data.http.test_endpoint.status_code == 200
    error_message = "Unexpected status: ${data.http.test_endpoint.status_code}"
  }

  assert {
    condition = data.http.test_endpoint.response_body == "Hello, World!"
    error_message = "Unexpected body: ${data.http.test_endpoint.response_body}"
  }
}
```

These tests go into files with the `.tftest.hcl` extension. They use the same language (HCL) as your OpenTofu code.

They consist of `run` blocks that are executed sequentially:

1. The first `run` block runs `apply` on the `lambda-sample` module itself
2. The second `run` block runs `apply` on the `test-endpoint` module, followed by assertions
3. The `module` block tells the `run` block to run `apply` on the `test-endpoint` module from the book's sample code repo
4. Read the Lambda function URL output from the `lambda-sample` module and pass it as the `endpoint` input variable for the `test-endpoint` module
5. `assert` blocks check whether the code works as expected. This first `assert` block checks that the HTTP request got a response status code of 200 OK
6. The second `assert` block checks that the HTTP request got a response body with the text "Hello, World!"

To run this test, authenticate to AWS, and run `tofu init` and `tofu test` (these tests take several minutes, so be patient):

```bash
$ tofu init
$ tofu test
deploy.tftest.hcl... fail
  run "deploy"... pass
  run "validate"... fail
╷
│ Error: Test assertion failed
│
│   on deploy.tftest.hcl line 23, in run "validate":
│   23:     condition = data.http.test_endpoint.response_body == "Hello, World!"
│       ├────────────────
│       │ data.http.test_endpoint.response_body is "Fundamentals of DevOps!"
│
│ Unexpected body: Fundamentals of DevOps!
```

Whoops, the test failed.

That's because at the end of Chapter 3, you updated the Lambda function to respond with "Fundamentals of DevOps!" instead of "Hello, World!"

The good news is that the test caught this issue.

Update `tofu/live/lambda-sample-app/src/index.js` to respond with "Hello, World!" and re-run the test:

```bash
$ tofu init
$ tofu test
deploy.tftest.hcl... pass
  run "deploy"... pass
  run "validate"... pass

Success! 2 passed, 0 failed.
```

You now have automated tests for your infrastructure!

Under the hood, OpenTofu ran `apply`, deployed your real resources, validated that they worked as expected, and then ran `destroy` to clean everything up.

With this sort of testing, you can have a reasonable degree of confidence that your module creates infrastructure that really works.

> **Get Your Hands Dirty**
>
> - Add other types of tests for your OpenTofu code, such as static analysis (Terrascan), policy enforcement (OPA), and integration tests (Terratest)
> - Add a new endpoint in your lambda module and add a new automated test to validate that the endpoint works as expected

## 5. Testing Recommendations

### 5.1. Introduction

Almost any kind of automated testing is better than none, but some patterns tend to be more effective than others.

The following are my recommendations:

- The test pyramid
- What to test
- Test-driven development (TDD)

### 5.2. The Test Pyramid

#### 5.2.1. Which Testing Approach Should You Use?

One question that comes up often is, which testing approach should you use? Unit tests? Integration tests? E2E tests?

The answer is: a mix of all of them!

**In plain English:** Think of testing like home security. You don't just use one lock. You use door locks, window locks, and maybe an alarm system.

**In technical terms:** Each type of test has different types of errors they can catch, plus different strengths and weaknesses.

**Why it matters:** The only way to be confident your code works as expected is to combine multiple types of tests.

That doesn't mean you use all types in equal proportion. In most cases, you want the proportion of tests to follow the test pyramid.

The idea of the test pyramid is that, as you go up the pyramid, the cost and complexity of writing the tests, the brittleness of the tests, and the runtime of the tests all increase.

Therefore, you typically want to do as much testing as you can with the types of tests that are fast to write, fast to run, and stable.

This means the majority of your testing (the base of the pyramid) should leverage:

- Compiler
- Static analysis
- Plan tests
- Policy tests
- Unit tests

You then have a smaller number of integration tests (the middle of the pyramid), and an even smaller number of high-value E2E and performance tests (the top of the pyramid).

> **Insight**
>
> You don't have to add all types of tests at once. Pick the ones that give you the best bang for your buck and add those first. Almost any testing is better than none.

If all you can add for now is static analysis or unit tests, that's still better than no tests.

Or maybe the highest value in your use case is a single E2E test verifying your system really works.

Start with something, anything that gives you value, and then add more tests incrementally.

### 5.3. What to Test

#### 5.3.1. Should You Test Every Line of Code?

Another question that comes up often is, what should you test?

Some testing purists believe that every line of code must be tested and that your tests must achieve 100% code coverage.

I am not one of them.

**In plain English:** Tests are like insurance. You buy insurance based on risk, not because someone told you to insure everything you own.

**In technical terms:** There is no doubt that tests offer a huge amount of value. But they also have a cost. Writing tests, maintaining them, and ensuring they run quickly and reliably can take a lot of time.

**Why it matters:** In many cases, the overhead is worth it. In some cases, it's not. You need to evaluate trade-offs.

In practice, deciding whether you should invest in adding automated tests for a certain part of your code comes down to continuously evaluating your testing strategy and making trade-offs between these factors:

**The cost of bugs**
The higher the cost of bugs, the more you should invest in automated testing.

If you're building a prototype that you'll throw away in a week, the cost of bugs is low, and tests aren't as important.

If you're working on code that processes payments, manages user data, or is related to security, the cost of bugs is high, and automated tests are more important.

**The likelihood of bugs**
The higher the likelihood of bugs, the more you should invest in automated testing.

As a general rule, the larger the codebase, and the more people that work on it, the higher the likelihood of bugs.

To scale, you'll have to invest more in testing.

**The cost of testing**
The lower the cost of testing, the more you should invest in automated testing.

With most languages and tools, setting up unit tests is so easy, the tests run so fast, and the improvement to code quality is so high that investing in unit tests is almost always worthwhile.

On the other hand, integration tests, E2E tests, and performance tests are each progressively more expensive to set up, so you need to be more thoughtful about how much to invest.

**The cost of not having tests**
It's possible to get lost in a cost/benefit analysis and conclude that tests aren't worth it. Many companies do just that.

But you have to remember that this has a cost too: fear.

When you work in a codebase without tests, you end up with a bunch of developers who are afraid to make changes.

So if every time you go to add a new feature or deploy something to production, you find your team hesitating and stalling, then you are paying a high cost for not having tests.

In those cases, the cost of automated tests may be lower than the cost of having a paralyzed Dev team.

> **Insight**
>
> One factor that impacts both the cost of writing tests and the benefits you get from those tests is when you write those tests. Trying to add tests several years after you write the code tends to be more expensive and not as beneficial. Adding tests a day after you write the code tends to be cheaper and have more benefits. Adding tests *before* you write the code may be the lowest cost and most beneficial option of all.

### 5.4. Test-Driven Development

#### 5.4.1. What is Test-Driven Development?

**In plain English:** Test-driven development (TDD) is like writing the instruction manual before building the furniture. It forces you to think through the design first.

**In technical terms:** The mere act of trying to write tests for your code will force you to take a step back and ask important questions: How do I structure the code so I can test it? What dependencies do I have? What are the common use cases? What are the corner cases?

**Why it matters:** If your code is hard to test, that's almost always a sign that it needs to be refactored for other reasons too.

For example, if the code is hard to test because it uses lots of global variables, the code is also likely hard to understand, maintain, and reuse.

Or if the code is difficult to test because it has many complex interactions with its dependencies, the code is likely too tightly coupled and will be difficult to change.

> **Insight**
>
> Tests not only help you write correct code, but also provide feedback that leads to a better design. You get the most benefit from this feedback if you write the test code *before* you write the implementation code.

#### 5.4.2. How TDD Works

Here's how test-driven development works:

1. Add placeholders for the new functionality (e.g., function signatures), just enough for the code to compile, but not the full implementation
2. Add tests for the new functionality
3. Run all the tests. The new tests should fail (it's always good to check that your tests can fail), but all other tests should pass
4. Implement the new functionality
5. Rerun the tests. Everything should now pass
6. Refactor the code until you have a clean design, rerunning the tests regularly to check that everything is still working

One of the unexpected consequences of using TDD is that the design of your code emerges as a result of a repeated test-code-test cycle.

Without TDD, you often end up shipping the first design you can think of.

With TDD, the very act of trying to figure out how to write tests forces you to iterate on your design, and you often ship something more effective.

> **Insight**
>
> TDD affects not only the design of small parts of your code, but also the design of your entire system. Some TDD practitioners use TDD only for writing unit tests up front, but you can also use TDD with integration tests, E2E tests, and performance tests.

**How TDD affects system design:**

- **Integration tests** - Thinking about integration tests up front forces you to consider how parts of your system will communicate
- **E2E tests** - Thinking about E2E tests up front forces you to think through how to deploy everything
- **Performance tests** - Thinking about performance tests up front forces you to think about where your bottlenecks are and what metrics you need to identify them

Being forced to think through all this up front, simply because you try to write tests first, can have a profoundly positive impact on the final design.

> **Insight**
>
> If I had used TDD to write my sorting code at TripAdvisor, I would've written the tests first, realized my code depended on the database, and that would've led to a different design that prevented the bug before I had written even a single line of implementation code.

#### 5.4.3. Benefits of Writing Tests Up Front

Writing tests up front increases the chances that you'll have thorough test coverage, because it forces you to write code incrementally.

Tests can be tedious to write, so it's easier if you have to do only a few at a time:

- Write a few tests and then a little bit of implementation
- Then a few more tests, then a little more implementation
- And so on

It's less effective to spend weeks writing thousands of lines of implementation code and then try to go back and do a marathon session of writing test cases.

You'll get bored and end up with far less code coverage. You'll also miss many corner cases because you'll forget the nuances of implementation code you wrote weeks ago.

#### 5.4.4. When TDD Doesn't Apply

Note that not all types of coding are a good fit for TDD.

For example, if you're doing exploratory coding, where you don't yet know exactly what you're building, and you're just exploring the problem space by coding and messing with data, TDD might not be a good fit.

If you don't know the result you're looking for, you can't write a test for it.

In that case, writing tests shortly after you write the code is still valuable.

Also, if you're working on an existing codebase that doesn't have any tests (a legacy codebase), you might feel like TDD doesn't apply.

However, you can still use TDD for any changes you make to the codebase.

It's similar to the standard TDD process, but with a couple of steps at the front:

1. Write a test for the functionality you're about to modify
2. Run all the tests. They should all pass
3. Use standard TDD for any new functionality or changes you're about to make

This way, you incrementally build out the test coverage for the codebase, specifically in those parts that you're modifying.

Each test you add for existing functionality gives you a way to prove to yourself that you truly understand how that code works, which can make it less scary to start making changes.

And each test you add for new functionality gives you all the standard benefits of TDD.

When you're done, you leave the codebase with at least a few tests in place, which will make it less scary—make it feel less like legacy code—for the next developer.

#### 5.4.5. TDD for Bug Fixing

TDD is also useful for bug fixing.

If you found a bug in production, that means no test caught the problem.

A good way to start on the fix is, as a first step, to write a failing test that reproduces the bug (test-driven bug fixing).

This is exactly what you did when fixing the HTML sanitization bug in the sample app earlier in this chapter.

The failing test proves you understand the cause of the bug and, after you fix it, leaves you with a regression test that will prevent the bug from coming back.

> **Reminder: Commit Your Code!**
>
> While working through this chapter, you've probably made a lot of code changes in the `ch4` folder, including updating `package.json` with build steps and dependencies, switching to an Express app, and adding automated tests for the app and infrastructure code. If you haven't already, make sure to commit all this code—especially changes in the `sample-app` and `tofu` folders—so you don't lose it and can iterate on it in future chapters.

## 6. Conclusion

You've now taken a big step forward in allowing your team members to collaborate on your code by following the six key takeaways from this chapter:

1. Always manage your code with a version-control system
2. Use a build system to capture, as code, important operations and knowledge for your project in a way that can be used both by developers and automated tools
3. Use a dependency management tool to pull in dependencies—not copy and paste
4. Use automated tests to give your team the confidence to make changes quickly
5. Automated testing makes you more productive while coding by providing a rapid feedback loop: make a change, run the tests, make another change, rerun the tests, and so on
6. Automated testing makes you more productive in the future too. You save a huge amount of time not having to fix bugs, because the tests prevented those bugs from slipping through in the first place

This is terrific progress, but it doesn't fully solve the collaboration problem.

You have a version-control system, but if teams go off and work in branches for months, merging their work back together becomes difficult.

You have automated tests, but developers don't always remember to run them, so broken code still slips by.

And you have a build system that automates some operations, but deployments are still largely manual.

To collaborate efficiently as a team, you not only need to use version control, build systems, and automated tests, but you also need to combine them in a specific way.

This is done using two software delivery practices: continuous integration and continuous delivery.

These practices are the focus of Chapter 5.

---

**Previous:** [Link](/infrastructure-deployment/ch03-orchestration) | **Next:** [Link](/code-cicd/ch05-continuous-deployment)
