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

## Deployment notes

- Replace the JWT secret in production
- Replace default police account credentials in production
- Use HTTPS in production so browser geolocation/notifications work reliably
- Image data is stored in PostgreSQL, so keep the `postgres-data` volume persistent
