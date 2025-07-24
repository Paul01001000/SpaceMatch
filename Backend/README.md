# SpaceMatch Backend – Project Structure & Setup

This backend uses [Express](https://expressjs.com/) and [Mongoose](https://mongoosejs.com/) to provide a REST API and connect to a MongoDB database. The structure is modular for easy scaling and maintenance.

## Folder Structure

```
Backend/
  config/        # Configuration files (e.g., database connection)
  controllers/   # Route logic and business logic
  models/        # Mongoose data models (schemas)
  routes/        # Express route definitions
  index.js       # Entry point for the server
  package.json   # Project metadata and scripts
  .gitignore     # Git ignore rules
```

## Setup & Running

### 1. Install dependencies

Navigate to the `Backend` folder and run:

```sh
npm install
```

### 2. Configure MongoDB connection
- Install MongoDB and MongoDb compass (check whether mongoDB server is running)
- Run npm run dev, you will be able to see default entries in the database (use the URL as below to connect to MongoDB Compass):
  ```
  mongodb://localhost:27017/spacematch
  ```
- By default, the app tries to connect to `mongodb://localhost:27017/spacematch`.
- To use a different MongoDB URI, create a `.env` file in the `Backend/` folder:

![img.png](img.png)
```
MONGO_URI=mongodb://your-mongodb-host:27017/spacematch
```
- Make sure MongoDB is running locally or your URI is accessible.

### 3. Start the server

- For production:
  ```sh
  npm start
  ```
- For development (with auto-reload):
  ```sh
  npm run dev
  ```

The server will start on [http://localhost:3000](http://localhost:3000) by default.

## Scripts

See [`package.json`](package.json):

- `npm start` – Start server
- `npm run dev` – Start with ```nodemon (https://nodemon.io/) for auto-reload

## Main Technologies

- **Express:** Web server and routing
- **Mongoose:** MongoDB object modeling and schema validation

## Where to Add Code

- **Database models:** `models/`
- **API logic:** `controllers/`
- **Routes:** `routes/`
- **Configuration:** `config/`

---

For more details, see the comments in each folder or file.

---

# Git Workflow

# 1. Create and switch to a new branch
git checkout -b feature/space-form-component

# 2. Pull latest changes from remote main into your new branch
git pull origin master

# 3. Make your changes (edit files, add new components, etc.)
# ... work on your SpaceForm component ...

# 4. Stage your changes
git add .

# 5. Commit your changes
git commit -m "Add SpaceForm component with CRUD functionality"

# 6. Switch back to main branch
git checkout master

# 7. Pull latest changes from remote main (to make sure you're up to date)
git pull origin master

# 8. Switch back to your feature branch
git checkout feature/space-form-component

# 9. Merge main into your feature branch (to integrate any new changes)
git merge master

# 10. Push your updated feature branch to remote
git push origin feature/space-form-component

# 11. (Optional) Create a Pull Request on your Git platform
# Then after PR approval, merge to main via the platform