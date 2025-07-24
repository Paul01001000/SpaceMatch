Step 1: copy the MONGO_URI from the .env.example file in the backend directory and paste it your .env in backend.
Step 2: Make sure you have Docker and Docker Compose installed on your machine.
Step 3: Move the docker-compose.yml file to the root directory of your project i.e in the directory where backend and frontend project resides
Step 4: Open a terminal and navigate to the directory where the docker-compose.yml file is located.
Step 5: Run the following command "docker compose up --build" to build and start the containers
Step 6: Once the containers are up and running, you can access the application at http://localhost:3000 for the frontend and http://localhost:5173
Step 7: To stop the containers, you can run "docker compose down" in the terminal.

Imp: We use mongodb container for the database, which means when you are running application it will use a
a fresh database and not local database (see db.ts and env variables). Therefore you might need to add some initial data
to the database for testing purposes.


Additional information:
Our setup uses Docker Compose to orchestrate the backend and frontend services.
The backend service is built using Node.js and Express, while the frontend service is built using React.
The Dockerfile for each service is included in their respective directories.


