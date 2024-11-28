# Running our App

## Section 1: Cloning the Repo:
* Make a folder somewhere on your computer
* `cd` to that folder from the command line
* Run `git clone https://github.com/MasonChenCS/GatorSecurityFall2024` to clone the repo

## Section 2: Installing Node.js Packages
Run the following commands from the `senior_project_dea-main` directory:
* `npm i`

Run the following commands from the `senior_project_dea-main/server` directory:
* `npm i`

## Section 3: Connecting to the Database
From the `senior_project_dea-main/server` directory, do the following:
* Run `touch .env` to create a `.env` file
* Open that file and add the following:
* Note: You will need to replace the first four variables with the correct database credentials and JWT secret
```
DB_URI=mongodb_url
DB_USERNAME=username
DB_PASSWORD=password
JWT_SECRET='secret'
LPORT=5000
```
* In the `GatorSecurity` directory (parent to `senior_project_dea-main` directory) create a `.gitignore` file if one does not already exist
* Add `.env` to the `gitignore` to prevent login credentials from being pushed to the repo

From the `senior_project_dea-main/src` directory, do the following:
* Edit the `Config.js` to have the `SERVER_ADDRESS` variable set to the IP/Hostname of the backend server.

## Section 4: Pulling the Latest Changes to Your Local Environment
If changes are made in the repo, you will need to pull those changes in by doing the following:
* `cd` to the `senior_project_dea-main` directory (if not already there)
* Run `git pull origin main`

## Section 5: Creating a Branch
### **All work you will ever do in a repo should be done in a branch. In other words, NEVER PUSH TO MAIN! EVER!**

There are 2 approaches to creating a branch.
### Option 1: Create branch from terminal
From the `senior_project_dea-main` directory run `git checkout -b <branch-name>` (i.e., `git checkout -b this-is-my-branch`). This will 
automatically switch you and all of you changes over to your new branch. See **Section 6** for the alternate `push` command you will need 
to run.

### Option 2: Create branch in Github and pull into you local repo
* Login to Github and go to `code` -> `branches`
* Click the `New Branch` button
* Name the branch whatever you like
* Complete steps from **Section 4**
* Run `git checkout <branch-name>` (i.e., `git checkout this-is-my-branch`)

## Section 6: Pushing Your Changes to the Repo
If you've made changes locally and you want to commit and push those changes to the repo, do the following:
* `cd` to the `senior_project_dea-main` directory (if not already there)
* Run `git add .` to stage all changed files
* Run `git commit -m "your commit message"` to commit your local changes
* Run `git push` to push your changes to the repo (If you created your branch through the terminal, an error will pop up with the alternative command that you need to run the first time you push changes from this branch. The command will look like this, `git push --set-upstream origin <branch-name>`. Any additional pushes from this branch will only require the `git push` command.) 

## Section 7: Running the App Locally (Developer Mode)
To start the backend run the following commands from the `senior_project_dea-main` directory:
* Navigate to the server directory: `cd server`
* Start the **backend**: `npm start`

To start the frontend run, open a second terminal in the `senior_project_dea-main` directory: 
* Start the **frontend**: `npm start`.
  
To start both frontend and backend in one terminal, navigate to the `senior_project_dea-main` directory: 
* Start **both**: `npm run dev`

NOTE: This setup is intended for development and testing only. For production deployment, refer to Section 8.

## Section 8: Deploying the App (Hosting):

### Starting the Application  
1. SSH into GatorSec EC2 server with provided details
2. Switch to root user: `sudo -i`
3. Navigate to the application root: `cd ../home/ubuntu/GatorSecurityFall2024`
4. Start the application: `./deploy.sh`

### Setting Up a New Fork on EC2 
_Follow steps above to navigate to root directory in EC2._
1. Remove the old fork: `rm -rf GatorSecurityFall2024`
2. Clone new fork: `git clone [fork_url]`
3. Install dependencies in `main` and `server` directories: `npm i`
4. Modify the server IP address in Config.js to point to the host's IP (e.g., the production server's public IP or domain name):
     - Navigate to the src directory: `cd senior_project_dea-main/src`
     - Open Config.js for editing: `nano Config.js`
     - Replace `localhost` with the host's IP or domain
5. Prepare the frontend for production deployment by creating a static build:
     - Navigate back to the project root directory (inside senior_project_dea-main): `cd ../`
     - Clean install of dependencies: `npm ci`
     - Generate the static build: `npm run build`
     - Install the static file server globally: `npm install -g serve`

### Updating the Deployed Application:
1. If the application is running, first kill it
2. Navigate to the root directory of your GitHub fork and pull the latest changes: `git pull origin main`
3. Navigate to `senior_project_dea-main` and rebuild the static frontend files: `npm run build`
5. Navigate back to the root directory of your GitHub fork and redeploy the application: `./deploy.sh`

# About the Included Database    
A database dump with an existing admin user and questions is included with distributions of this project. To see how to import this database dump, refer to `MongoDB Setup.pdf` in the Resources folder found in the root folder of this repository. The `Gator_Security_DB_Dump.zip` referred to in this document can be found in the same Resources folder.         

The administrative user included in this database dump has a default email `admin@localhost` and a default password `admin` that can be changed when using the application while logged in as the admin. It is highly recommended that these default credentials be changed when first using the application.         

# Backend Documentation
The backend documentation is done with JsDoc. Most IDEs will pick up the JsDoc from the code and display it for you, but if you want to view a document, you can build it with JsDoc.

```bash
npm install -g jsdoc
```

You can then run either `build_docs.sh` or `build_docs.bat` depending on your terminal.

## How to Add Traditional Questions
Use the question edit page available to admin users to manipulate traditional questions.

After adding adding new questions, you should be able to refresh the Games page to see the game and play it.
