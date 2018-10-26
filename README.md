# itu-kontenjan-takipcisi

Node + Express powered backend of İtü kontenjan takipçisi API

### Environment Variables

This projects uses [dotenv](https://github.com/motdotla/dotenv) to get the environment variables from a file.

You must create a `.env` file and place it into the root of the workspace. (Same level with app.js)

You can use `.env.example` file to construct the `.env` file and fill the info according to your environment.

### VSCode

The preferred IDE for this project is VSCode.

#### API Docs

Facebook Messenger API is used. For more information, you can check https://developers.facebook.com
If you want to run it on your computer, you need to have SSL connection. We used `ngrok` to tunnel our local port to SSL connection. https://ngrok.com

#### Running

The folder `.vscode` consists all of the files related to vscode configuration. To debug/run the project you can use "Launch Program" configuration by pressing `F5`.

#### Linting

Open a file to lint it automatically.

Press `Ctrl + Shift + B` on Windows or `CMD + Shift + B` on Mac to lint all of the files in the project.

We use [airbnb's javascript guideline](http://github.com/airbnb/javascript) to lint but with a little [modification](.eslintrc.json).

#### Prettifying

In the current setup, `prettifier-eslint` formats the file automatically after you save it. The prettifier uses the eslint configuration to format the code.

#### Status
This lovely bot can not be used anymore because of the facebook api policy. 
I hope our great developers will do something better for us!
