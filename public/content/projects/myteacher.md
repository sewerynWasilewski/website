---
title: "myTeacher"
description: "An app for e-lessons."
year: "2023"
technologies: ["angular", "js", "mysql"]
weight: 3
---

An online tutoring platform that connects students with private tutors for e-lessons.

## Features

- **Tutor profiles** — biography, subjects, hourly rate, availability calendar
- **Lesson booking** — students pick a time slot and book directly
- **Messaging** — in-app chat between student and tutor before the first lesson
- **Review system** — students leave ratings after completed lessons

## Stack

| Layer    | Technology        |
|----------|-------------------|
| Frontend | Angular           |
| Backend  | Node.js + Express |
| Database | MySQL             |
| Auth     | JWT               |

## Lessons Learned

The trickiest part was the **scheduling system** — handling timezone differences between tutors and students, and preventing double-bookings under concurrent requests. Solved it with optimistic locking on the MySQL side.

```sql
SELECT * FROM slots
WHERE tutor_id = ? AND start_time = ?
FOR UPDATE;
```
