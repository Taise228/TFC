# TFC

This is a fictional web application of a gym website.<br>

I publish this project here as a token for my learning django rest framework and react (also as my professor encouraged us to make our projects public).<br>

## Usage

run in your command prompt<br>
```
./startup.sh
./run.sh
```

After them some processes will be running on background of your computer including both frontend and backend. <br>
 So if you want to stop them, you have to check process ids for this project using 
 ```
 ps
 ```
  command and 
 ```
 kill -9 (pid)
 ```
 for each pid related to the project.
 
 ## Annotations
 
 - Before you start the app in your environment, you have to set `SECRET_KEY` in `TFC_PB/TFC/settings.py`.
 - Also you have to set `google_api_key` in `TFC_PF/src/app.js` to show Google Map.
