# Running our App

## Section 1: Cloning the repo:
* Make a folder somewhere on your computer
* `cd` to that folder from the command line
* Run `git clone https://github.com/dellis7/GatorSecurityFall2023.git` to clone the repo

## Section 2: Installing Node.js packages
Run the following commands from the `senior_project_dea-main` directory:
* `npm i mdb-react-ui-kit`

Run the following commands from the `senior_project_dea-main/server` directory:
* `npm install cors`

## Section 3: Connecting to the database
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

## Section 4: Pulling in the latest changes to your local environment
If changes are made in the repo, you will need to pull those changes in by doing the following:
* `cd` to the `senior_project_dea-main` directory (if not already there)
* Run `git pull origin main`

## Section 5: Creating a branch
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


## Section 6: Pushing your changes to the repo
If you've made changes locally and you want to commit and push those changes to the repo, do the following:
* `cd` to the `senior_project_dea-main` directory (if not already there)
* Run `git add .` to stage all changed files
* Run `git commit -m "your commit message"` to commit your local changes
* Run `git push` to push your changes to the repo (If you created your branch through the terminal, an error will pop up with the alternative command that you need to run the first time you push changes from this branch. The command will look like this, `git push --set-upstream origin <branch-name>`. Any additional pushes from this branch will only require the `git push` command.) 

## Section 7: Running the app locally
To start the backend run the following commands from the `senior_project_dea-main` directory:
* `cd server`
* `npm start`

To start the frontend run, open a second terminal in the `senior_project_dea-main` directory and run `npm start`.
(Update: This may result in a fetch error. If the error occurs, please force install npm by using the force tag `npm install --force`)

Note: If PWD is `senior_project_dea-main`, `npm run dev` will automatically run the server and front end concurrently without the need for a second console *EXTREMELY IMPORTANT FOR HOSTING*

# About the Included Database    
A database dump with an existing admin user and questions is included with distributions of this project. To see how to import this database dump, refer to `MongoDB Setup.pdf` in the Resources folder found in the root folder of this repository. The `Gator_Security_DB_Dump.zip` referred to in this document can be found in the same Resources folder.         

The administrative user included in this database dump has a default email `admin@localhost` and a default password `admin` that can be changed when using the application while logged in as the admin. It is highly recommended that these default credentials be changed when first using the application.         

# Backend Documentation
The backend documentation is done with JsDoc. Most IDEs will pick up the JsDoc from the code and display it for you, but if you want to view a document, you can build it with JsDoc.

```bash
npm install -g jsdoc
```

You can then run either `build_docs.sh` or `build_docs.bat` depending on your terminal.

## How to add traditional questions
Use the question edit page available to admin users to manipulate traditional questions.

After adding adding new questions, you should be able to refresh the Games page to see the game and play it.
