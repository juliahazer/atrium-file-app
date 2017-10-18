### Notes about Setup:

* Ensure that npm and MonogoDB (e.g., brew install mongodb) are installed 

* ```git clone git@github.com:juliahazer/atrium-file-app.git```

* ```cd atrium-file-app```

* ```npm install``` (to install dependencies)

* To start with an example database / uploaded 5 files:
	* The 5 files are already in the /atrium-file-app/uploads folder
	* The copy of the database is in the /atrium-file-app/db-backup folder. In the terminal, run the following command (inserting the path to the db-backup folder at the end, in place of PATH\_TO\_BACKUP\_DIRECTORY): ```mongorestore --db atrium-files PATH_TO_BACKUP_DIRECTORY```

* IMPORTANT: I am using textract (npm module) to search the contents of PDF and Word docs. In order for it to work, see the requirements on your computer: https://www.npmjs.com/package/textract. For example for Mac:
  * PDF extraction requires pdftotext be installed (https://github.com/nisaacson/pdf-extract#osx):
```brew install poppler```

  * DOC extraction requires antiword be installed, unless on OSX in which case textutil (installed by default) is used.

* In the terminal, type ```nodemon``` to start the app (```http://localhost:3000/```)


### To Move Toward Production-Ready Code:

* Use a service such as AWS S3 to store the uploaded files

* Add functionality to add more users & use the bcrypt module to more safely store passwords (right now the current password info is stored as text in the database). 

* For simplicity sake, I included the .env file in the project with a simple secret key to 'protect' the session - but this .env file typically would be created at the local level and not uploaded onto GitHub (plus the key would be more complicated)

* Add / do additional testing to ensure that the app works for additional test cases (especially around file search functionality)

* Consideration should be given to how this would scale (e.g., search / uploading a LARGE number of files) and how to ensure efficiency during searching files. 

* Due to time constraints, I did not focus on the design of the app. More time should be spent on the design / layout / navigation (and user testing, if possible).

* Currently, if a user adds a file with a duplciate file name, the upload overwrites the existing file but does not delete the associated database file record. Address this issue and/or how to handle the uploading of files with duplicate names.

* Explore adding functionality to handle multiple file uploads (or folder uploads)
