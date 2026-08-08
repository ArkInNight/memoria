# Memoria

Version: 0.1

---

# Project Goal

Build a **Reverse: 1999 Summon Tracker** that serves as a **permanent summon archive**.

Since the official summon history is only available for approximately **90 days**, the application must preserve every imported summon permanently.

The primary goals are:

- Permanently store summon history.
- Display summon statistics.
- Calculate pity and guarantee.
- Display banner-specific history.
- Be easy to maintain as new game versions are released.

---

# Philosophy

Memoria is **not** a clone of the official summon history page.

It is a **personal archive**.

Once a summon has been imported, it is considered permanent.

Importing is only used to retrieve newly available summons.

Automatic synchronization is **not supported** because summon URLs contain temporary authentication tokens.

Users must generate a new summon URL using the Link Grabber whenever they want to update their history.

---

# Tech Stack

## Runtime

- Bun

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Router
- TanStack Query
- TanStack Table

## Backend

- Elysia/Hono

## Database

- PostgreSQL/SQlite (dev)

---

# Development Rules

During the initial development phase:

- Use dummy data.
- Do not depend on the official API.
- Do not depend on game assets.
- Every page should be fully functional using mock data.

The architecture should allow real game data to replace mock data without requiring major code changes.

---

# Core Modules

## Dashboard

Displays an account summary.

Minimum information:

- Total Summons
- Current Pity
- Current Guarantee
- Total 6★
- Total 5★
- Total 4★
- Last Import Time

---

## Import

Import workflow:

1. Run Link Grabber.
2. Copy the summon URL.
3. Paste link or json from URL into Memoria.
4. Import.

Requirements:

- Only import new summons.
- Ignore duplicate records.
- Never delete existing history.

---

## Summon History

Main history page.

Columns:

- Time
- Banner
- Character / Psychube
- Rarity
- Pull Type
- Pity
- Rate ON / OFF
- Guarantee

Features:

- Search
- Filtering
- Sorting

---

## Banner Detail

Displays statistics for a single banner.

Minimum information:

- Banner Name
- Banner Type
- Total Pulls
- Average Pity
- Highest Pity
- Lowest Pity
- Obtained Characters
- Obtained Psychubes

---

## Banner Archive

Displays every banner available in the database.

Minimum information:

- Banner Name
- Version
- Banner Type
- Start Date
- End Date

Selecting a banner opens its detail page.

---

## Current Banner

Displays currently active banners.

During early development, use dummy data.

---

# Statistics

Minimum statistics:

- Total Pulls
- Current Pity
- Average Pity
- Highest Pity
- Lowest Pity
- Total 6★
- Total 5★
- Total 4★

---

# Import Log

Store every import session.

Minimum fields:

- Import Time
- Imported Records
- Duplicate Records
- Failed Records

---

# Future Modules

- Timeline
- Character Collection
- Psychube Collection
- Snapshot History
- Global Summon History (Optional)

---

# Banner Mechanics

**Do not implement banner mechanics directly in the application or this document.**

All summon mechanics must reference:

```
docs/summon-mechanic.md
```

This document is the **single source of truth** for every banner mechanic.

Examples include (but are not limited to):

- Shared Pity
- Independent Pity
- Shared Banner Groups
- Guarantee Rules
- Rate ON / OFF Rules
- Selector Banners
- Box Reward Banners
- Special Event Banners
- Collaboration Banners
- Banners without pity
- Future banner mechanics

Whenever a new banner mechanic is introduced, update **only** `summon-mechanic.md`.

Avoid changing the application's core business logic whenever possible.

---

# Asset Strategy

Game assets must be maintained separately from the application.

Example:

```
assets/

    banners.json

    characters.json


```

The application should consume these assets instead of hardcoding game data.

---

# Dummy Data

Use dummy data throughout the early development phase.

Every feature should function correctly before integrating real game data.

---

# UI Philosophy

The interface should be:

- Clean
- Modern
- Fast
- Data-focused
- Desktop-first
- Mobile-friendly

Avoid unnecessary visual clutter.

Prioritize readability and usability.

---

# Coding Principles

- Clean Architecture
- Feature-based Folder Structure
- Reusable Components
- Type-safe
- Configuration-driven
- Extensible
- No Hardcoded Banner Logic

---

# Long-term Goal

Memoria should remain compatible with future Reverse: 1999 updates without requiring major architectural changes.

Ideally, supporting a new game version should only require:

- Updating asset files.
- Updating `summon-mechanic.md`.
- Create script for scrapping new banner and character.

The core application logic should remain unchanged.
