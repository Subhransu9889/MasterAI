**An AI assistant that knows the user and gives personalized guidance**.

# MasterAI – 5-Day Development Plan

## 🎯 Goal

By the end of Day 5, your project should allow a user to:

* Sign in
* Complete a short profile
* Chat with an AI
* Receive personalized responses based on their profile
* View AI-generated recommendations on a dashboard

## 🎨 Product Design System

The landing page and future product surfaces should continue this visual system so MasterAI feels distinct, recognizable, and consistent as the MVP grows.

### Color tokens

| Token | Hex | Use |
| --- | --- | --- |
| Deep Ink | `#0A0B0E` | Primary background, navigation, dark product surfaces |
| Ink Soft | `#15171D` | Offset shadows and elevated dark surfaces |
| Warm Paper | `#F3F0EA` | Reading surfaces, product previews, CTA panel |
| Citrus Lime | `#DDF85D` | Primary action, active state, signal, highlight |
| Graphite | `#4A4C52` | Rules, dividers, and muted dark-background text |
| Paper Rule | `#D1CEC7` | Dividers and borders on warm paper surfaces |
| Lime Dark | `#829800` | Accessible lime-on-paper status and progress marks |

### Typography and layout

* **Display:** Newsreader, with italic emphasis for personal or aspirational language.
* **Body/UI:** Geist Sans for clear reading and interface copy.
* **Metadata:** Geist Mono for labels, system states, timestamps, and data.
* **Layout language:** editorial asymmetry, thin rules, sharp corners (maximum `2px` radius), warm paper panels, and generous whitespace.
* **Motion language:** sticky storytelling, restrained scroll-linked reveals, progress feedback, and reduced-motion fallbacks.
* **Accessibility baseline:** keep body copy and primary actions at accessible contrast, maintain visible focus states, and respect `prefers-reduced-motion`.

---

# 📅 Day 1 – Planning & Project Setup

### Objective

Set up the project and create the foundation.

### Tasks

#### Team Meeting (1–2 hours)

* Finalize project scope
* Decide on tech stack
* Divide responsibilities
* Create GitHub repository

#### Project Setup

* Create Next.js project
* Install Tailwind CSS
* Install shadcn/ui
* Configure Clerk Authentication / BetterAuth (selected✅)
* Set up Supabase/neon database
* Configure Gemini API or some free model 

#### Design

Create simple wireframes for:

* Landing Page -> pending......
* Login -> pending......
* Onboarding -> pending......
* Dashboard -> pending......
* Chat -> pending......
* Profile -> pending......

#### Database Tables

* Users
* Preferences -> like interest, goal and you can add as per your own.
* Conversations -> must for the next prediction as it helps to imporove and reply more proffetional

### Deliverables

* ✅ Project setup complete
* ✅ GitHub repository ready
* ✅ Authentication working
* ✅ Database connected

---

# 📅 Day 2 – Authentication & User Onboarding

### Objective

Allow users to create an account and store preferences.

### Build

#### Authentication

* Login
* Signup
* Google Sign-In
* Logout

#### Onboarding Form

Collect:

* Name
* Profession -> ...
* Interests -> ...
* Goals
* Preferred Language

#### Save to Database

Example:

```text
Name: Alex

Profession: Student

Interests:
• AI
• Web Development

Goal:
Placement

Language:
English
```

### UI Pages

* Login
* Register
* Onboarding
* Profile

### Deliverables

* ✅ User authentication
* ✅ Profile creation
* ✅ Preferences saved

---

# 📅 Day 3 – AI Chat Integration

### Objective

Build the personalized AI assistant.

### Chat Interface

Components:

* Chat window
* Input box
* Send button
* Loading animation

### Backend

Flow:

```text
User Message

↓

Load User Preferences

↓

Create AI Prompt

↓

Gemini API

↓

Store Conversation

↓

Return Response
```

### Prompt Example

```text
You are MasterAI.

User Profile:
Profession: Student
Interests: AI, Web Development
Goal: Placement

Question:
Suggest a learning roadmap.

Provide a personalized answer.
```

### Deliverables

* ✅ AI chat working
* ✅ Responses personalized
* ✅ Conversations stored

---

# 📅 Day 4 – Dashboard & Recommendations

### Objective

Show users personalized content.

### Dashboard Sections

#### Welcome Card

```text
Hello Alex 👋

Welcome back!
```

#### Profile Summary

* Profession
* Goals
* Interests

#### AI Recommendations

Generate:

* Courses
* Skills
* Projects
* Books
* Career Tips

Example:

```text
Recommended Today

• Learn React Hooks

• Build a Weather App

• Read Clean Code

• Practice Arrays
```

#### Recent Conversations

Show last 5 chats.

### Deliverables

* ✅ Dashboard complete
* ✅ Recommendations displayed
* ✅ Profile summary visible

---

# 📅 Day 5 – Testing, Polish & Presentation

### Objective

Prepare a polished demo.

### UI Improvements

* Responsive layout
* Better spacing
* Icons
* Empty states
* Loading animations
* Error handling

### Testing

Check:

* Login
* Profile updates
* AI responses
* Database
* Navigation
* Mobile responsiveness

### Deployment

* Deploy frontend to Vercel
* Configure environment variables
* Test production build

### Documentation

Prepare:

* README
* Architecture diagram
* Database schema
* API list
* Setup instructions

### Presentation

Include:

* Problem statement
* Solution
* Features
* Tech stack
* Architecture
* Live demo
* Future enhancements

### Deliverables

* ✅ Deployed application
* ✅ Documentation
* ✅ Presentation
* ✅ Demo-ready MVP

---

# 👥 Team Allocation

## 👤 Member 1 – Frontend

**Responsibilities**

* Landing page
* Authentication UI
* Dashboard
* Profile page
* Responsive design

**Day-wise**

* Day 1: Project setup
* Day 2: Authentication UI
* Day 3: Chat interface
* Day 4: Dashboard
* Day 5: UI polish

---

## 👤 Member 2 – Backend

**Responsibilities**

* Supabase
* Database schema
* API routes
* User profile
* Conversation storage

**Day-wise**

* Day 1: Database setup
* Day 2: Onboarding API
* Day 3: Chat API
* Day 4: Recommendations API
* Day 5: Testing

---

## 👤 Member 3 – AI Engineer

**Responsibilities**

* Gemini integration
* Prompt engineering
* Recommendation generation
* AI response quality

**Day-wise**

* Day 1: Gemini setup
* Day 2: Prompt design
* Day 3: Chat integration
* Day 4: Recommendation logic
* Day 5: AI testing

---

## 👤 Member 4 – Integration & QA

**Responsibilities**

* Connect frontend/backend
* Testing
* Deployment
* Documentation
* Presentation

**Day-wise**

* Day 1: Wireframes
* Day 2: Integration support
* Day 3: Feature testing
* Day 4: Deployment prep
* Day 5: Final deployment & presentation

---

# 📁 Final Project Structure

```text
MasterAI
│
├── Landing Page
├── Authentication
├── User Onboarding
├── Dashboard
├── AI Chat
├── Personalized Recommendations
├── Profile
├── Supabase Database
├── Gemini AI Integration
└── Deployment
```

---

# 🎯 Demo Flow (5–7 minutes)

1. Open **MasterAI**
2. Sign in with Google
3. Complete the onboarding form
4. Show the personalized dashboard
5. Ask the AI:

   * "Create a 30-day AI learning roadmap."
   * "Suggest projects based on my interests."
6. Highlight how the response changes based on the user's saved profile.
7. Show recommendation cards.
8. End with future enhancements (voice assistant, calendar integration, long-term memory).

This plan keeps the scope realistic for five days while still showcasing authentication, databases, AI integration, personalization, and a polished user experience—enough to make a strong academic project and presentation.
