# Try Monad

Typescript Try monad

## Status

[![npm (scoped)](https://img.shields.io/npm/v/@kirekov/try-monad)](https://www.npmjs.com/package/@kirekov/try-monad)
[![Build Status](https://travis-ci.com/SimonHarmonicMinor/try-monad.svg?branch=master)](https://travis-ci.com/SimonHarmonicMinor/try-monad)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=SimonHarmonicMinor_try-monad&metric=coverage)](https://sonarcloud.io/dashboard?id=SimonHarmonicMinor_try-monad)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=SimonHarmonicMinor_try-monad&metric=code_smells)](https://sonarcloud.io/dashboard?id=SimonHarmonicMinor_try-monad)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=SimonHarmonicMinor_try-monad&metric=bugs)](https://sonarcloud.io/dashboard?id=SimonHarmonicMinor_try-monad)
![NPM](https://img.shields.io/npm/l/@kirekov/try-monad)

## Quick Start

```shell
npm install @kirekov/try-monad
```

or

```shell
yarn add @kirekov/try-monad
```

## Usage

The monad purpose is to build a pipeline of computations that might fail.

```typescript
const result =
    Try.of(() => fetchUserCard(userId))
       .filter(card => card.isAccessible)
       .map(card => ({login: card.login, name: card.name, lastName: card.lastName}))
       .flatMap(card => Try.of(() => withUserPermissions(card)))
       .orElse(STUB_USER_CARD);
```

The monad acts *lazily*. So, all computations deffer until terminal operations call
(`orElse`, `orElseGet`, `orElseThrow`).

```typescript
const tryMonad =
    Try.of<UserDTO>(() => JSON.parse(value))
       .map(user => {
         console.log('parsed user', user);
         return user.name;
       });
const name = tryMonad.orElse('default name');
// print happens after 'orElse' call
```

Besides, it is possible to retrieve the first succeeded result.

```typescript
const tryMonad =
    Try.of<string>(() => {
      throw new Error();
    }).orElseTry(() => "right token")
      .orElseTry(() => "wrong token");
const token = tryMonad.orElse("default");
// token === 'right token'
```