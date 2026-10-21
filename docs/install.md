---
title: Install
description: Install typed-api-contract and Zod. Add React and TanStack Query only for the React Query entry.
---

# Install

After this page the package is installed, and you know which peer each import needs.

## Requirements

- Node.js 18.17 or newer
- TypeScript. `strict` is the setup this library is tested with
- An ESM consumer or a bundler. The package is `"type": "module"` and has no CommonJS build

## Contract and client

`zod` `^4` is a required peer. The contract entry and the client entry both need it.

::: code-group

```bash [npm]
npm i typed-api-contract zod
```

```bash [pnpm]
pnpm add typed-api-contract zod
```

```bash [yarn]
yarn add typed-api-contract zod
```

:::

## React Query

Install these only if you import `typed-api-contract/react-query`. Peers: `react` `^18` or `^19`, and `@tanstack/react-query` `^5`.

::: code-group

```bash [npm]
npm i react @tanstack/react-query
```

```bash [pnpm]
pnpm add react @tanstack/react-query
```

```bash [yarn]
yarn add react @tanstack/react-query
```

:::

That entry file starts with `"use client"`, so a Next.js App Router Client Component can import the hooks. `typed-api-contract` and `typed-api-contract/client` are plain TypeScript. They run in Node 18+ and in the browser, and they do not import React.

This package does not render a `QueryClientProvider`. The app mounts that itself. See [React Query](./react-query).

Next: [Quickstart](./quickstart).
