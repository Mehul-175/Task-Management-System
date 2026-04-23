# Task Management System (Multi-Tenant SaaS Backend)

## Overview

This project is a scalable backend for a **company-based task management platform** built using **Node.js, Express, and MongoDB**.
The system follows a **multi-tenant architecture**, where each company operates in isolation with its own users, projects, and tasks.

The platform supports multiple roles and subscription plans, enabling organizations to manage projects and collaborate efficiently while maintaining strict data separation between companies.

This project was developed as part of an internship program and demonstrates backend architecture concepts such as authentication, role-based access control, service-based architecture, real-time communication, and scalable API design.

---

# Core Features

## Multi-Tenant Architecture

* Each company has isolated data.
* Users, projects, and tasks are linked to a specific company.
* Queries are filtered by `company_id` to prevent cross-company data access.

---

## Role Based Access Control (RBAC)

### Super Admin

* Manage companies
* Manage subscription plans
* Monitor system activity

### Company Admin

* Create and manage users
* Create and manage projects
* Assign users to projects
* Create and manage tasks

### User

* View assigned projects
* Work on assigned tasks
* Update task status
* Add comments

---

# System Modules

## Company Management

* Create company
* Update company
* Delete company
* List companies with pagination
* Linked with subscription plans and expiry date

---

## Subscription Plan Management

Plans define system usage limits.

Plan configuration includes:

* Maximum number of users
* Maximum number of projects
* Duration
* Price

---

## User Management

* Create users within company
* Role assignment
* Update user information
* Delete user
* List users with pagination

Roles:

* SUPER_ADMIN
* ADMIN
* USER

---

## Project Management

* Create projects
* Assign users to projects
* Update project details
* List projects
* Company-specific project isolation

---

## Task Management

Each task includes:

* Custom `task_id` (generated from project short code)
* Title
* Description
* Assigned user
* Reporting manager
* Priority
* Status workflow

Task Status Flow:

```
To-Do
in-progress
testing
qa-verified
deployment
done
re-open
```

---

## Comment Module

Users can add comments to tasks for collaboration and updates.

---

## Task History Tracking

Every important task change is stored, including:

* Status updates
* Assignment changes
* Important edits

This enables audit tracking for task progress.

---

## Real-Time Notifications

Implemented using **Socket.io**.

Notifications are triggered for:

* Task assignment
* Status updates
* Important task changes

---

## Email Notifications

Using **Nodemailer**.

Emails are sent for:

* User account creation
* Task assignment
* Important system alerts

---

## Subscription Expiry Management

A scheduled cron job checks subscription expiry and restricts access for expired companies.

---

# Technology Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose ODM

### Authentication

* JSON Web Token (JWT)

### Validation

* Joi

### Realtime Communication

* Socket.io

### Email Service

* Nodemailer

### Scheduling

* Node Cron

---

# Project Architecture

The project follows a **layered architecture** to maintain scalability and maintainability.

```
src
│
├── config
│   └── database configuration
│
├── models
│   └── MongoDB schemas
│
├── controllers
│   └── request handlers
│
├── routes
│   └── API routes
│
├── middlewares
│   └── authentication, RBAC, error handling
│
├── validations
│   └── Joi request validation
│
├── utils
│   └── helper utilities
│
├── sockets
│   └── real-time notification handlers
│
├── cron
│   └── scheduled background jobs
│
├── app.js
└── server.js
```

## Architecture Principles

* Controllers remain thin
* Business logic is placed inside services
* Validation handled separately
* Centralized error handling
* Consistent API response format

---

## Atomic Operations
* Uses MongoDB $inc for thread-safe, collision-free generation of custom Task IDs (e.g., PROJ-01).

* Implements Soft Delete logic across all primary entities to maintain relational integrity and audit trails.

---

## Automated Maintenance
* Plan Lifecycle: Cron jobs automatically manage the transition of subscription plans from Active to Archived based on user churn and expiry gaps.

---

# Authentication & Security

## JWT Authentication

Users authenticate using a login API that returns a JWT token.

Token payload includes:

```
user_id
company_id
role
```

## Authorization

Role-based access control ensures only authorized roles can perform certain operations.

## Data Isolation

All queries enforce company-level isolation using `company_id` from the authenticated token.

---

# API Design Standards

All APIs follow consistent standards:

* Common response format
* Proper HTTP status codes
* Centralized error handling
* Pagination support
* Sorting and filtering
* Joi validation for create/update APIs

Example API response:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {},
  "meta": {}
}
```

---

# Installation & Setup

### 1. Clone the Repository

```
git clone https://github.com/Mehul-175/Task-Management-System.git
cd Task-Management-System
```

---

### 2. Install Dependencies

```
npm install
```

---

### 3. Environment Variables

Create a `.env` file in the root directory.

Example:

```
PORT = 6000
MONGO_URI = your_mongo_uri
ACCESS_KEY = secret_key
ACCESS_EXPIRES = 15m
REFRESH_TTL = 30 
RAZOR_KEY = your_razorpay_key
RAZOR_SECRET = your_razorpay_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_passkey
NODE_ENV = development
```

---

### 4. Start the Development Server

```
npm run dev
```

---

### 5. Production Start

```
npm start
```

---

# Database Entities

### Company

* name
* subscription_plan
* expiry_date
* is_active

### User

* name
* email
* password
* role
* company_id

### Project

* name
* short_code
* company_id
* assigned_users

### Task

* task_id
* title
* description
* project_id
* company_id
* assigned_to
* report_to
* priority
* status

### Comment

* task_id
* user_id
* message

### TaskHistory

* task_id
* old_status
* new_status
* changed_by
* timestamp

---

# Future Improvements

Possible enhancements for production environments:

* API documentation using Swagger
* Rate limiting for security
* Logging using Winston
* Docker containerization
* CI/CD pipeline
* Frontend integration

---

# Learning Outcomes

This project demonstrates understanding of:

* Multi-tenant SaaS architecture
* RESTful API design
* Authentication and authorization
* Service-layer backend architecture
* Real-time event handling
* Scalable backend design principles

---

# Author

Internship Project – Backend Development
Built for academic demonstration and learning purposes.
