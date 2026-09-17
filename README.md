# Expense Management System

A secure RESTful Expense Management System built using **Java, Spring Boot, Spring Security, JWT, JPA/Hibernate, and MySQL**.

The application allows users to register, log in securely, and manage their personal expenses through authenticated REST APIs.

## 🚀 Features

* User registration
* Duplicate email validation
* Input validation using Jakarta Bean Validation
* BCrypt password encryption
* User login with JWT authentication
* Stateless authentication using Spring Security
* Create expenses
* View all personal expenses
* View expense by ID
* Update expenses
* Delete expenses
* User-specific expense access
* Protection against cross-user expense access
* DTO-based API responses
* Global exception handling
* MySQL database integration
* Environment variables for sensitive configuration
* RESTful API architecture

## 🛠️ Tech Stack

| Technology      | Purpose                          |
| --------------- | -------------------------------- |
| Java 17         | Backend programming              |
| Spring Boot     | Backend framework                |
| Spring Security | Authentication and authorization |
| JWT             | Token-based authentication       |
| Spring Data JPA | Database interaction             |
| Hibernate       | ORM                              |
| MySQL           | Relational database              |
| Maven           | Dependency management            |
| Eclipse         | Development environment          |
| Postman         | API testing                      |

## 🏗️ Project Architecture

The application follows a layered architecture:

```text
Client / Postman
       ↓
Controller Layer
       ↓
Service Layer
       ↓
Repository Layer
       ↓
MySQL Database
```

### Main Packages

```text
com.expense
│
├── config
│   ├── PasswordConfig
│   └── SecurityConfig
│
├── controller
│   ├── AuthController
│   ├── UserController
│   └── ExpenseController
│
├── dto
│   ├── LoginRequestDTO
│   ├── UserResponseDTO
│   └── ExpenseResponseDTO
│
├── entity
│   ├── User
│   └── Expense
│
├── exception
│   ├── EmailAlreadyExistsException
│   └── GlobalExceptionHandler
│
├── repository
│   ├── UserRepository
│   └── ExpenseRepository
│
├── security
│   ├── JwtService
│   └── JwtAuthenticationFilter
│
└── service
    ├── UserService
    └── ExpenseService
```

## 🔐 Authentication & Security

The application uses **JWT-based authentication** with Spring Security.

### Authentication Flow

```text
User Login
    ↓
Email + Password
    ↓
Password Verification using BCrypt
    ↓
JWT Token Generated
    ↓
Client Sends JWT in Authorization Header
    ↓
JWT Authentication Filter
    ↓
Authenticated Request
    ↓
Protected API
```

Protected requests use:

```http
Authorization: Bearer <JWT_TOKEN>
```

Passwords are never stored as plain text. They are encrypted using **BCrypt** before being stored in the database.

Sensitive configuration such as the database password and JWT secret is loaded through environment variables instead of being stored directly in the source code.

## 📌 REST API Endpoints

### Authentication

| Method | Endpoint          | Description | Authentication |
| ------ | ----------------- | ----------- | -------------- |
| POST   | `/api/auth/login` | User login  | No             |

### Users

| Method | Endpoint          | Description    | Authentication |
| ------ | ----------------- | -------------- | -------------- |
| POST   | `/api/users`      | Register user  | No             |
| GET    | `/api/users`      | Get users      | No             |
| GET    | `/api/users/{id}` | Get user by ID | Yes            |
| PUT    | `/api/users/{id}` | Update user    | Yes            |
| DELETE | `/api/users/{id}` | Delete user    | Yes            |

### Expenses

| Method | Endpoint             | Description                   | Authentication |
| ------ | -------------------- | ----------------------------- | -------------- |
| POST   | `/api/expenses`      | Create expense                | Yes            |
| GET    | `/api/expenses`      | Get logged-in user's expenses | Yes            |
| GET    | `/api/expenses/{id}` | Get expense by ID             | Yes            |
| PUT    | `/api/expenses/{id}` | Update expense                | Yes            |
| DELETE | `/api/expenses/{id}` | Delete expense                | Yes            |

## 💾 Database

The application uses **MySQL** with the database:

```text
expense_management
```

### Users Table

```text
users
├── id
├── name
├── email
└── password
```

### Expense Table

```text
expense
├── id
├── title
├── amount
├── category
├── date
├── description
├── payment_method
└── user_id
```

### Relationship

```text
User
  │
  │ 1
  │
  │
  │ *
Expense
```

One user can have multiple expenses.

## 🧪 API Testing

The APIs were tested using **Postman**.

Testing includes:

* Successful user registration
* Duplicate email validation
* Invalid input validation
* Successful login
* JWT token generation
* Unauthorized access protection
* Authenticated expense creation
* User-specific expense retrieval
* Expense update
* Expense deletion
* Cross-user expense access protection

## ⚙️ Environment Variables

The application uses environment variables for sensitive configuration.

Required variables:

```text
DB_PASSWORD
JWT_SECRET
```

Example:

```text
DB_PASSWORD=<your-mysql-password>
JWT_SECRET=<your-jwt-secret>
```

Do not commit actual passwords or JWT secrets to the repository.

## ▶️ How to Run

### 1. Clone the repository

```bash
git clone https://github.com/suyashdate1/expense-management.git
```

### 2. Open the project

Open the project in Eclipse or another Java IDE.

### 3. Create the MySQL database

```sql
CREATE DATABASE expense_management;
```

### 4. Configure environment variables

Set:

```text
DB_PASSWORD=<your-mysql-password>
JWT_SECRET=<your-jwt-secret>
```

### 5. Run the application

Run:

```text
ExpenseManagementApplication.java
```

The application runs on:

```text
http://localhost:8081
```

## 📂 Project Structure

```text
expense-management
│
├── src
│   ├── main
│   │   ├── java
│   │   └── resources
│   │       └── application.properties
│   │
│   └── test
│
├── .gitignore
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

## 🔮 Future Enhancements

* React.js frontend
* Expense dashboard
* Monthly and yearly expense analytics
* Category-wise expense charts
* Expense search and filtering
* Pagination
* Budget management
* Export expenses to CSV/PDF
* Role-based authorization
* Docker deployment
* Cloud deployment

## 👨‍💻 Developer

**Suyash Date**

Computer Engineering | Java Full Stack Development

### Technologies

`Java` `Spring Boot` `Spring Security` `JWT` `JPA` `Hibernate` `MySQL` `REST API` `Maven`

---

⭐ If you find this project useful, feel free to explore the repository.
