@echo off

IF NOT EXIST node_modules (
    echo Installing npm packages...
    call npm install
)

cls
echo Starting the application...
call npm start
