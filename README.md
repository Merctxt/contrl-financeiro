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

