# 🗳️ VotMan - Online Voting System with OTP Verification

## 📌 Project Overview

VotMan is a secure web-based Online Voting System developed to simplify the voting process while ensuring transparency and security. The system allows voters to register, authenticate using OTP verification, cast votes digitally, and view election results in real time.

This project is built using **Node.js**, **Express.js**, **MongoDB**, **HTML**, **CSS**, and **JavaScript**.

---

## 🚀 Features

### User Features

* User Registration
* Secure Login
* OTP Verification
* One Vote Per User
* Candidate Selection
* Election Result Viewing
* Responsive User Interface

### Security Features

* Password Hashing using Bcrypt
* JWT Authentication
* OTP-Based Login Verification
* OTP Expiration Handling
* Duplicate Vote Prevention
* Protected API Routes

---

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JWT (JSON Web Token)
* Bcrypt.js
* OTP Verification

---

## 📂 Project Structure

```text
Online-Voting-System/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── otp.html
│   ├── vote.html
│   ├── results.html
│   ├── home.html
│   ├── script.js
│   └── style.css
│
├── backend/
│   ├── models/
│   │   ├── user.js
│   │   ├── candidate.js
│   │   ├── vote.js
│   │   ├── election.js
│   │   └── taluk.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/online-voting-system.git
cd online-voting-system
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4. Start MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas.

### 5. Run the Application

```bash
npm start
```

For development mode:

```bash
npm run dev
```

---

## 🔐 OTP Verification Workflow

1. User enters username and password.
2. System validates credentials.
3. A 6-digit OTP is generated.
4. OTP is sent to the registered mobile number.
5. User enters OTP.
6. OTP is verified on the server.
7. JWT token is issued.
8. User gains access to voting features.

---

## 🗳️ Voting Workflow

1. Register as a voter.
2. Login using credentials.
3. Complete OTP verification.
4. Select preferred candidate.
5. Submit vote.
6. Vote is securely stored.
7. User cannot vote again.
8. Results are displayed after election completion.

---

## 📊 Future Enhancements

* Biometric Authentication
* Aadhaar Integration
* Email OTP Support
* Admin Dashboard
* Live Election Analytics
* Multi-Language Support
* Blockchain-Based Vote Storage

---

## 🎯 Learning Outcomes

Through this project, the following concepts were implemented:

* REST API Development
* Authentication & Authorization
* OTP Verification System
* Database Design with MongoDB
* Frontend-Backend Integration
* Secure Web Application Development

---

## 👨‍💻 Author

Developed as a Mini Project / Final Year Project for demonstrating secure online voting using modern web technologies.

---

## 📜 License

This project is developed for educational and academic purposes.
