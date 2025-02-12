# 🏆 StatSync - Sports Social Media Platform

StatSync is a sports-focused social media platform that allows users to **track stats, connect with others, arrange meetups, and share achievements**. Initially focusing on **fishing**, the platform will expand to other sports like **golf**.

## 🌟 Features

- ✅ **User Authentication** - Register, login, logout with JWT-based authentication.
- ✅ **Password Security** - Passwords securely hashed using `bcryptjs`.
- ✅ **JWT Blacklist on Logout** - Tokens stored in `node-cache` for secure logout.
- ✅ **RESTful API** - Structured API endpoints with best practices.
- ✅ **Meetups & Leaderboards** _(Upcoming)_ - Connect with other users and compare stats.

## 🛠️ Tech Stack

- **Frontend:** React 19 _(Planned)_
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MySQL (via XAMPP)
- **Authentication:** JSON Web Tokens (JWT), `bcryptjs`
- **Caching:** `node-cache` _(Alternative to Redis for JWT Blacklisting)_
- **Deployment:** _(To be decided: Vercel, DigitalOcean, AWS)_

## 🚀 Getting Started

### 1️⃣ Clone the Repository

````sh
git clone https://github.com/your-username/statsync.git
cd statsync


## 2️⃣ Install Dependencies
```sh
npm install


## 3️⃣ Set Up Environment Variables
Create a .env file in the root directory and add the following:

```sh
JWT_SECRET=your_super_secret_key
DATABASE_URL=mysql://user:password@localhost:3306/statsync


## 4️⃣ Start the Server

```sh
npm run dev

Server will be running on http://localhost:5000.

### 📡 API Endpoints
Method	Endpoint	Description
POST	/users/register	Register a new user
POST	/users/login	Authenticate & receive JWT
POST	/users/logout	Blacklist JWT & log out
GET	/leaderboards	Retrieve leaderboards (Upcoming)
POST	/meetups	Create or join meetups (Upcoming)

###🔒 Security & Authentication

Password Hashing: All passwords are securely hashed before storage.
JWT-Based Auth: Authentication is handled using access tokens.
Logout Blacklisting: JWTs are stored in node-cache to prevent reuse after logout.

###🚀 Future Enhancements
Real-time Stats Tracking (Upcoming)
Push Notifications for Meetups (Upcoming)
Mobile App Support (Planned)

###🤝 Contributing
Feel free to fork this repo and submit a pull request with any improvements.

###📝 License
This project is licensed under MIT License.
````
