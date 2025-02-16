# StatSync 🏆

**StatSync** is a social media platform designed for sports hobbyists, starting with fishing and expanding to other sports like golf. The platform allows users to **connect, compare stats, arrange meetups, find locations, and more**.

## 🚀 Features

- **User Authentication** (JWT-based login, register, logout)
- **Refresh Token Management** (Multiple devices supported, one refresh token per device)
- **Session Management** (View and manage active sessions) (Coming soon)
- **Automated Token Cleanup** (Cron job for expired refresh tokens) (Coming soon)
- **User Profiles & Stats Tracking** (Coming soon)
- **Meetup & Social Features** (Coming soon)
- **AI-Based Recommendations** (Future goal)

## 🛠️ Tech Stack

- **Frontend:** React 19 (with Chakra UI planned) (Coming soon)
- **Backend:** Node.js, Express.js
- **Database:** MySQL (XAMPP)
- **Authentication:** JWT with refresh token management
- **Future Expansion:** Mobile app version planned

## 📌 Installation

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/statsync.git
cd statsync
```

### **2. Backend Setup**

```bash
cd backend
npm install
```

- Create a `.env` file and add necessary environment variables (DB credentials, JWT secrets).
- Start the backend:

```bash
npm run dev
```

### **3. Frontend Setup**

```bash
cd ../frontend
npm install
npm start
```

## 🔑 Authentication Flow

1. User logs in and receives an **access token** (short-lived) and **refresh token** (long-lived).
2. When the **access token expires**, the frontend silently requests a new one using the **refresh token**.
3. If the **refresh token is expired**, the user is logged out and redirected to log in again.
4. Users can view and manage **active sessions**, logging out of specific devices if needed.

## 🏗️ Roadmap

- [x] User authentication system
- [ ] Refresh token security improvements
- [ ] Session management (logout from active sessions)
- [ ] User profiles & stats tracking
- [ ] Meetup & location discovery
- [ ] AI-based personalized recommendations
- [ ] Mobile app version

## 🤝 Contributing

Contributions are welcome! Feel free to submit pull requests or report issues.

## 📜 License

This project is licensed under the MIT License.
