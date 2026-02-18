# Organiza Aí - Controle Financeiro
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/Merctxt/ctrl-financeiro)



Organiza Aí is a full-stack personal finance management application designed to help you track income, expenses, and budgets with ease. Built with React, Node.js, and PostgreSQL, it provides a clean, responsive interface for managing your financial life.

![image demo](https://i.imgur.com/54UsQlV.png)

> **Live Demo:** [financeiro.giovannidev.com](https://financeiro.giovannidev.com/)

## Features

*   **Secure Authentication:** User registration, login, and secure password reset via email (using Mailgun).
*   **Interactive Dashboard:** At-a-glance summary of income, expenses, and balance with data visualization for custom time periods.
*   **Transaction Management:** Full CRUD (Create, Read, Update, Delete) functionality for all your financial transactions.
*   **Categorization:** Organize transactions with customizable categories, complete with icons and colors. Includes an option to generate default categories.
*   **In-depth Reporting:** Generate detailed reports with charts showing monthly financial evolution, spending breakdowns by category, and annual summaries.
*   **Data Export:** Export transaction data to CSV for external analysis in spreadsheets.
*   **User Settings:** Update your profile, change your password, and manage your account, including account deletion.
*   **Light & Dark Mode:** Switch between themes for your visual comfort.
*   **Responsive Design:** Fully usable on both desktop and mobile devices.

## Tech Stack

*   **Frontend:** React, React Router, Recharts, Axios, React Icons
*   **Backend:** Node.js, Express.js
*   **Database:** PostgreSQL
*   **Authentication:** JWT (JSON Web Tokens), bcrypt.js
*   **Deployment:** Docker, Railway

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   A running [PostgreSQL](https://www.postgresql.org/) database instance.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/merctxt/ctrl-financeiro.git
    cd ctrl-financeiro
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the root directory by copying the `.env.example` file. Update it with your credentials.

    ```bash
    cp .env.example .env
    ```

    Your `.env` file should look like this:

    ```env
    # PostgreSQL Database Connection URL
    # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
    DATABASE_URL=postgresql://postgres:password@localhost:5432/finance_db

    # Port for the backend server
    PORT=5000

    # Secret key for JWT digital signatures
    JWT_SECRET=your_super_secret_jwt_key_here

    # --- Optional for Password Reset feature ---
    # Mailgun credentials
    MAILGUN_API_KEY=your_mailgun_api_key
    MAILGUN_DOMAIN=your.mailgun.domain.com
    MAILGUN_FROM="Organiza Aí <noreply@your.mailgun.domain.com>"

    # Frontend URL (used in password reset emails)
    FRONTEND_URL=http://localhost:3000
    ```

3.  **Install dependencies:**
    This command will install dependencies for both the server and the client.
    ```bash
    npm run install-all
    ```

4.  **Run the application:**
    This command starts both the backend server and the React development server concurrently. The backend will automatically create the necessary database tables on its first run.

    ```bash
    npm run dev
    ```

    You can now access the application:
    *   **Frontend:** [http://localhost:3000](http://localhost:3000)
    *   **Backend API:** [http://localhost:5000](http://localhost:5000)

## Deployment

This project is configured for easy deployment using Docker.

The `Dockerfile` in the root directory creates a production-ready image by:
1.  Building the React frontend.
2.  Installing only production dependencies for the Node.js server.
3.  Copying the server files and the built frontend into a lean final image.
4.  Exposing port 5000 and starting the server.

The repository also includes a `railway.json` file for simplified deployment on [Railway](https://railway.app/).