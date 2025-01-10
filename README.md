# Suedit - A Full-Stack Social Media App

Welcome to **Suedit**! This is a basic Reddit-like clone built using modern technologies including **Vite**, **TypeScript**, and **Supabase** for authentication and storage. The app allows users to post text with images and edit their profiles. The best part is, it's live and working! You can check it out at [suedit.vercel.app](https://suedit.vercel.app).

## Features
- **Post with Image**: Users can create posts with text and images.
- **Profile Editing**: Users can edit their profiles.
- **Real-time Functionality**: The app provides real-time updates for posts and interactions.
- **Authentication**: Using **Supabase** for secure sign-up and login.

## Live Demo
Check out the live version of the app at:  
[**suedit.vercel.app**](https://suedit.vercel.app)

## Tech Stack
- **Frontend**: 
  - Vite
  - React
  - TypeScript
- **Backend**:
  - Supabase (Authentication, Database, and Storage)

## How to Clone and Run Locally

If you'd like to clone and run Suedit locally, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/sudhaanshuu/suedit.git
```

2. Install Dependencies
Navigate to the project directory and install the necessary dependencies:

```bash
cd suedit
npm install
```
3. Set up Supabase
Create a free account on Supabase.
Create a new project and get your Supabase URL and anon key.
In your project, create a .env file in the root directory.
Add the following environment variables:
```bash
Copy code
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
4. Run the Development Server
Once everything is set up, you can start the development server:

```bash
Copy code
npm run dev
```
