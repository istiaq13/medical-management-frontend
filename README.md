# Doctor Tracker – Frontend Web Application

> High-performance Next.js 14 administrative clinical application featuring TanStack React Query in-memory caching, responsive charts, debounced multi-field searching, and mobile-friendly bottom-sheet drawers.

---

## 📌 Elevator Pitch

Doctor Tracker Frontend is a modern, high-performance administrative clinical portal designed for healthcare administrators to seamlessly manage medical doctors, oversee assigned patient relationships, and visualize hospital operational analytics in real time. Built with Next.js 14 App Router, TypeScript, and Tailwind CSS, the platform delivers zero-latency data querying with TanStack React Query, session-isolated JWT security, rich interactive data visualizations using Recharts, and a mobile-first medical interface.

---

## 🛠️ Tech Stack & Key Libraries

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Custom high-contrast tooltip components, ResponsiveContainer)
- **Data Fetching & Cache**: TanStack React Query v5
- **Form Management & Validation**: React Hook Form, Zod
- **Notifications**: Sonner (Toast notifications)
- **HTTP Client**: Axios (with Request & Response Interceptors)

---

## 🚀 Setup Guide

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+
- **npm** or **yarn**

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to create `.env.local`:
```bash
cp .env.example .env.local
```

Ensure `.env.local` contains:
```env
# Point to your local backend (http://localhost:5000/api/v1) or live Render API
NEXT_PUBLIC_API_URL=https://medical-management-backend-of4a.onrender.com/api/v1
```

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js 14 App Router)"]
        UI["UI Layer (Tailwind CSS, Lucide, Recharts)"]
        Cache["TanStack React Query Cache Layer (60s Stale Time)"]
        AuthContext["Auth Context & Route Guard"]
        Storage[("sessionStorage - In-Memory Ephemeral")]
        UI --> Cache
        UI --> AuthContext
        AuthContext <--> Storage
    end

    subgraph Backend ["Backend (Express 5 & TypeScript)"]
        API["REST API Router (/api/v1)"]
        RateLimit["Rate Limiter & CORS"]
        JWTAuth["JWT Authenticator (8h TTL)"]
        Services["Controllers & Business Services"]
        API --> RateLimit --> JWTAuth --> Services
    end

    subgraph Database ["Persistence Layer"]
        Atlas[("MongoDB Atlas 7.0 Cluster")]
        Services --> Atlas
    end

    Cache <-->|HTTPS Bearer Token Authorization| API
```

---

## 🧠 Technical Decisions

### Decision 1: TanStack React Query with Realtime Debouncing over Global State (Redux/Zustand)
- **Rationale**: For an administrative dashboard with frequent create, update, and delete actions across doctors and patients, server state differs significantly from client UI state.
- **Why React Query**: 
  - Eliminates boilerplate action creators, reducers, and manual loading/error flags.
  - Automatically handles cache invalidation (`queryClient.invalidateQueries`) across dependent entities (e.g. deleting or assigning a patient under a doctor immediately re-fetches both the doctor's patient count, assigned tables, and the dashboard analytics aggregations).
  - Custom `useDebounce` hook (300ms) coordinates live search typing with reactive backend MongoDB aggregation pipelines without flooding the server.
  - Responsive pagination displays immediate page state changes and replaces rows with skeleton loaders (`isLoading || isFetching`) during live transitions.

### Decision 2: Ephemeral `sessionStorage` JWT Storage over `localStorage`
- **Rationale**: Strict healthcare and clinical application security standards dictate that authentication tokens should never persist indefinitely on shared medical workstations.
- **Implementation**: 
  - Storing the JWT in `sessionStorage` guarantees that closing the browser tab or window immediately revokes the client session.
  - Paired with an 8-hour token expiration on the backend, this provides strong session boundary protection while ensuring medical administrators can navigate between tabs and perform daily tasks uninterrupted.

---

## 🔑 Default Admin Credentials

For evaluation and testing:
- **Email**: `admin@example.com`
- **Password**: `Admin@123`
*(A convenient "Auto-fill" button is provided directly on the `/login` portal screen)*

---

## 📸 Visual Evidence (UI Screenshots)

### 🖥️ Desktop Views

#### 1. Secure Medical Portal Login
![Login Portal](./public/screenshots/desktop-01-login.png)
*Responsive login card with live service health probe (`backend is starting...`), input validation, and password visibility toggle.*

#### 2. Clinical Analytics Dashboard (Patient Intake & Trends)
![Dashboard Patients](./public/screenshots/desktop-02-dashboard-patients.png)
*Live overview metrics cards, Top Attending Physicians by Patient Volume, monthly registration trends, and diagnostic breakdown.*

#### 3. Clinical Analytics Dashboard (Physician Capacity & Workload)
![Dashboard Doctors](./public/screenshots/desktop-03-dashboard-doctors.png)
*Dedicated `[ Patients | Doctors ]` toggle revealing physician staffing capacity and workload analytics.*

#### 4. Doctors Management Directory
![Doctors Directory](./public/screenshots/desktop-04-doctors-directory.png)
*Doctors table with live multi-field debounced search, specialization filtering, date range selector, and immediate skeleton page transitions.*

#### 5. Physician Profile & Patient Roster
![Doctor Detail](./public/screenshots/desktop-05-doctor-detail-profile.png)
*Detailed physician profile (`/doctors/[id]`) displaying hospital affiliations, credentials, and assigned patient roster.*

#### 6. Patient Assignment Drawer (Slide-Over Drawer)
![Doctor Assign Drawer](./public/screenshots/desktop-06-doctor-assign-drawer.png)
*Animated right slide-over drawer with full-page backdrop dimming. Instant 'Assign' and 'Remove' actions with confirmation popups.*

#### 7. Patients Management Directory
![Patients Directory](./public/screenshots/desktop-07-patients-directory.png)
*Comprehensive patients table with debounced search, condition filtering, assigned doctor filtering, gender selector, and pagination.*

#### 8. Patient Intake & Registration Modal
![Patient Registration](./public/screenshots/desktop-08-patient-register-modal.png)
*Intake modal featuring full input validation, disease categorization, attending doctor assignment with lock mechanism, and clinical notes.*

#### 9. Access Control & Administrator Directory
![Access Control](./public/screenshots/desktop-09-access-control.png)
*Administrator directory with live account counter, search, copyable IDs, user DP avatars, and admin account management.*

---

### 📱 Mobile Views

#### 1. Mobile Login & Dashboard Overview
| Mobile Login | Mobile Dashboard Overview |
|:---:|:---:|
| ![Mobile Login](./public/screenshots/mobile-01-login.png) | ![Mobile Dashboard](./public/screenshots/mobile-02-dashboard-top.png) |
| *Fluid single-column authentication* | *Responsive metric cards & overview* |

#### 2. Mobile Visual Charts & Doctors Directory
| Mobile Analytics Charts | Mobile Doctors List |
|:---:|:---:|
| ![Mobile Charts](./public/screenshots/mobile-03-dashboard-charts.png) | ![Mobile Doctors](./public/screenshots/mobile-04-doctors-list.png) |
| *Touch-friendly responsive charts* | *Compact card layout with search* |

#### 3. Mobile Doctor Profile & Intake Action Sheet
| Mobile Doctor Profile | Mobile Bottom Sheet Drawer |
|:---:|:---:|
| ![Mobile Doctor Profile](./public/screenshots/mobile-05-doctor-detail.png) | ![Mobile Actions Sheet](./public/screenshots/mobile-06-doctor-actions-sheet.png) |
| *Physician overview and patients table* | *Native bottom sheet with touch handle* |

#### 4. Mobile Patients Directory & Intake Drawer
| Mobile Patients List | Mobile Patient Modal |
|:---:|:---:|
| ![Mobile Patients](./public/screenshots/mobile-07-patients-list.png) | ![Mobile Patient Modal](./public/screenshots/mobile-08-patient-modal.png) |
| *Patient roster with condition tags* | *Fullscreen mobile intake drawer* |

#### 5. Mobile Access Control & Administrator Form
| Mobile Access Control | Mobile Admin Create Modal |
|:---:|:---:|
| ![Mobile Access Control](./public/screenshots/mobile-09-access-control.png) | ![Mobile Admin Modal](./public/screenshots/mobile-10-admin-create-modal.png) |
| *Administrator directory on mobile* | *Touch-friendly admin creation form* |
