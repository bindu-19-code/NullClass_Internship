## 🚀 Tech Stack

### **Frontend (internarea/)**

* Next.js (React + TypeScript)
* Redux Toolkit for state management
* Tailwind CSS for styling
* i18next for multi-language support

### **Backend (backend/)**

* Node.js + Express.js
* MongoDB with Mongoose
* JWT for authentication
* Nodemailer for email notifications
* Stripe for payment integration

---

## ⚙️ Features

### 👩‍💻 User Features

* Register and login with JWT authentication
* Apply for internships and jobs
* Track application status
* Reset password via email (secure token system)
* Multi-language UI

### 💳 Payment Integration (Stripe)

* Stripe payment gateway integration for premium plan or posting access
* **Test card for payment:**

  ```
  4242 4242 4242 4242
  Expiry: Any future date (e.g., 12/34)
  CVC: Any 3 digits (e.g., 123)
  ```

  > 💡 Use this card only in test mode.

---

## 🛠️ Installation Guide

### 1️⃣ Clone the repository

```bash
git clone https://github.com/bindu-19-code/NullClass_Internship.git
cd NullClass_Internship
```

### 2️⃣ Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

Start the backend:

```bash
npm run dev
```

---

### 3️⃣ Setup the frontend

```bash
cd ../internarea
npm install
npm run dev

---

## 🧪 Testing Payments

To test Stripe payments, use:

```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 10000
```

> ⚠️ **Important:** This card is for Stripe’s **test mode only**.

---

## 🧑‍💻 Author

**Bindu K Reddy**
GitHub: [@bindu-19-code](https://github.com/bindu-19-code)
