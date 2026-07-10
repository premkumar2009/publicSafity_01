# Public Safety Alert System

A deployable police-only public alert system using **PostgreSQL** for police data, alert data, and uploaded image storage.

## What this version supports

- Police-only signup/login with password hashing
- Police access code required for new officer registration
- Police can create alerts with:
  - alert type
  - title
  - description
  - image
  - location name
  - latitude/longitude
  - radius in kilometers
  - police contact number
- Public users do **not** need to login
- Public users do **not** enter personal details
- Public receives nearby alerts based on browser location
- Browser notifications show alert title, message, and image
- Public alert detail page includes a **call button**
- Public users can submit proof reports with an optional image, description, phone number, and location
- Police officers can review submitted proofs directly from the dashboard
- Dockerized frontend + backend + PostgreSQL, ready for local deployment
- Uploaded images are stored in the **PostgreSQL database**, not on disk

## Default officer login

A default police officer is created on first startup:

- Email: `officer@police.local`
- Password: `Police@123`

Change these with environment variables before production use.

## Run with Docker Compose

```bash
docker compose up --build -d
```

App URLs:

- Frontend: `http://localhost:5173`
- Receiver frontend: `http://localhost:5174`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Default PostgreSQL values

- Database: `publicsafetydb`
- Username: `postgres`
- Password: `postgres`

## Environment setup

Copy the sample environment file and adjust the values for your local setup:

```bash
cp .env.example .env
```

The example file includes the default Docker/PostgreSQL and authentication settings used by the backend services.

## Main tables

- `police_officers`
- `alerts`
- `alert_images`

## Check the database

```bash
docker exec -it public-safety-postgres psql -U postgres -d publicsafetydb
```

Then run:

```sql
\dt
SELECT id, name, email, badge_number, phone FROM police_officers;
SELECT id, title, type, location_name, radius_km, image_file_name FROM alerts;
SELECT id, storage_key, original_file_name, content_type, file_size_bytes FROM alert_images;
```

## Public notification flow

1. Public user opens `/public`
2. Browser asks for location access and notification permission
3. The page sends the current latitude and longitude to the backend
4. Backend returns only alerts whose radius contains the public user
5. New matching alerts trigger browser notifications with image
6. Public can open the alert details page and tap the call button

## Render deployment

### Backend service

1. Create a new Web Service on Render.
2. Connect this repository and select the backend folder as the root service directory.
3. Use the following build and start commands:

```bash
mvn -DskipTests package
java -jar target/*.jar
```

4. Add these environment variables in Render:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/<database>
SPRING_DATASOURCE_USERNAME=<db-user>
SPRING_DATASOURCE_PASSWORD=<db-password>
PUBLIC_SAFETY_JWT_SECRET=<long-random-secret>
PUBLIC_SAFETY_POLICE_ACCESS_CODE=POLICE-2026
BOOTSTRAP_POLICE_EMAIL=officer@police.local
BOOTSTRAP_POLICE_PASSWORD=Police@123
BOOTSTRAP_POLICE_NAME=Officer Demo
BOOTSTRAP_POLICE_PHONE=1000000000
BOOTSTRAP_POLICE_BADGE=PS-001
APP_CORS_ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
```

5. Render will inject `PORT` automatically; the application is configured to use it.

### Frontend service

1. Create a separate Static Site or Web Service for the frontend.
2. Set the build command for the frontend folder:

```bash
npm install
npm run build
```

3. Set the environment variable:

```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

### Local validation

Run the backend with the required environment variables:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/publicsafetydb \
SPRING_DATASOURCE_USERNAME=postgres \
SPRING_DATASOURCE_PASSWORD=postgres \
PUBLIC_SAFETY_JWT_SECRET=replace-with-a-strong-secret \
mvn spring-boot:run
```

### Deployment notes

- Use HTTPS in production so browser geolocation and notifications work reliably.
- Replace the default admin credentials and JWT secret before going live.
- Image data is stored in PostgreSQL, so keep the database persistent.
