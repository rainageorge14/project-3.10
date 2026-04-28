# FridgePolice Prototype

## Overview

FridgePolice is a roommate food-sharing and inventory tracking prototype designed to maintain accurate fridge state even when real-world roommate behavior creates messy system failures.

This project allows roommates to:

- Add food items to a shared fridge
- Request portions of shared food
- Approve and reserve food portions
- Track food consumption
- Correct inventory mismatches
- Handle real-world engineering failures

The focus of this prototype is on system correctness rather than UI complexity.

---

# Tech Stack

## Frontend

- React (Vite)

## Backend

- Node.js
- Express.js

## Storage

- In-memory arrays

---

# Core Engineering Goal

The prototype was built to correctly handle four critical failure scenarios:

1. Concurrency Conflict
2. Stale State
3. Identity Ambiguity
4. Reality Desynchronization

---

# Scenario 1 — Concurrency Collision

## Problem

Two roommates may simultaneously request the final portion of a food item.

Example:

- 25% pizza left
- Jordan requests 25%
- Casey requests 25%
- Both cannot receive the same slice

## Solution

Before approving any request:

- Current quantity is validated
- Portion is reserved immediately
- Quantity is reduced instantly
- Requests fail if insufficient quantity remains

## Engineering Logic

This prevents race-condition style double allocation by ensuring inventory state is checked before approval.

## Outcome

- No overbooking
- No duplicate approvals
- System remains logically correct

---

# Scenario 2 — Spoilage Ghost

## Problem

A roommate gets approval but never consumes the food.

Example:

- Pasta approved
- User never eats it
- Food spoils
- App still thinks approval is active

## Solution

Implemented stale request cleanup system:

- Expiry dates tracked per food item
- Cleanup route invalidates unconsumed expired approvals
- Expired requests marked as:
  - approved: false
  - expired: true
- Spoiled food status updated

## Engineering Logic

This ensures outdated approvals do not permanently corrupt system state.

## Outcome

- Prevents ghost allocations
- Prevents false cost splits
- Maintains real-world accuracy

---

# Scenario 3 — Identical Item Bug

## Problem

Multiple identical real-world items may appear indistinguishable.

Example:

- Two ketchup bottles
- Same brand
- Same appearance

## Solution

Every item receives a unique UUID.

Example:

- Ketchup Bottle A → UUID1
- Ketchup Bottle B → UUID2

## Engineering Logic

Unique identifiers ensure physical objects map to distinct system records.

## Outcome

- Accurate ownership tracking
- Accurate quantity updates
- Eliminates identity ambiguity

---

# Scenario 4 — Phantom Eater / Reality Desync

## Problem

Someone consumes food without updating the app.

Example:

- Orange juice exists digitally
- Juice is physically gone

## Solution

Manual inventory correction endpoint:

- Roommates can adjust quantity manually
- Missing food can be corrected
- Item state updates instantly

## Engineering Logic

Allows the system to recover from real-world desynchronization.

## Outcome

- Restores truth
- Prevents long-term state corruption
- Keeps digital state aligned with physical reality

---

# Additional Features

## Food Management

- Add new food items
- View all items
- Delete items
- Track quantities
- Track expiry dates

## Request Management

- Create requests
- Mark requests consumed
- View all requests
- Cleanup expired requests

---

# Assumptions Made

- Authentication is not required
- Roommate identity is simplified
- Payments are not implemented
- In-memory storage is acceptable
- Manual correction is trusted
- Focus is on product logic

---

# Key Engineering Decisions

## Why In-Memory Storage?

- Simpler implementation
- Faster development
- Sufficient for prototype requirements

## Why UUIDs?

- Required for item uniqueness
- Prevents identity conflicts

## Why Immediate Reservation?

- Prevents concurrency corruption

## Why Cleanup Route?

- Handles stale approvals

## Why Manual Correction?

- Solves physical/digital mismatch

---

# System Strengths

- Handles real-world roommate chaos
- Prevents state corruption
- Maintains inventory fairness
- Simple to understand
- Easy to test

---

# Limitations

- No persistent database
- No real authentication
- No real payment processing
- Limited scalability
- Manual correction depends on honesty

---

# Conclusion

FridgePolice demonstrates that building reliable systems requires engineering beyond the happy path.

This prototype successfully addresses:

- Simultaneous conflicting actions
- Expired unused approvals
- Duplicate real-world objects
- Untracked physical changes

By focusing on resilient state management, the system survives realistic user behavior rather than assuming ideal workflows.

---

# Final Deliverables

- Working React + Express prototype
- Scenario handling for all 4 required cases
- GitHub repository
- Pull Request
- Demo video
- Changes.md documentation

Final submission for Kalvium Challenge #8
