# Expense Management System

A secure full-stack Expense Management System built using **Java, Spring Boot, Spring Security, JWT, JPA/Hibernate, MySQL, React, Tailwind CSS, and Recharts**.

The application allows users to register, log in securely, and manage their personal expenses through a responsive web dashboard and authenticated REST APIs.

## 🚀 Features

### Authentication & Security
- User registration
- Duplicate email validation
- Input validation
- BCrypt password hashing
- JWT-based login authentication
- Stateless authentication using Spring Security
- Protected expense APIs
- User-specific expense access
- Cross-user expense access protection

### Expense Management
- Create expenses
- View personal expenses
- View expense by ID
- Update expenses
- Delete expenses
- Category-wise expense organization
- Payment method tracking
- Search and filtering
- Date-range filtering
- Sorting expenses

### Dashboard
- Total expenses summary
- Current month expense summary
- Transaction count
- Average expense
- Recent expenses
- Category-wise spending chart
- Responsive dashboard UI

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Java 17 | Backend programming |
| Spring Boot | Backend framework |
| Spring Security | Authentication and authorization |
| JWT | Token-based authentication |
| Spring Data JPA | Database interaction |
| Hibernate | ORM |
| MySQL | Relational database |
| Maven | Dependency management |
| React.js | Frontend |
| Tailwind CSS | UI styling |
| Recharts | Expense analytics charts |
| Axios | API communication |
| Eclipse | Backend development |
| VS Code | Frontend development |
| Postman | API testing |

## 🏗️ Project Architecture

The application follows a layered full-stack architecture:

```text
React Frontend
      ↓
Axios REST API Calls
      ↓
Spring Boot REST API
      ↓
Spring Security + JWT
      ↓
Controller Layer
      ↓
Service Layer
      ↓
Repository Layer
      ↓
MySQL Database