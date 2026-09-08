#!/usr/bin/env bash

# Define paths to store the background process IDs
PID_FILE_FRONT="/tmp/.planner-frontend.pid"
PID_FILE_BACK="/tmp/.planner-backend.pid"

start_servers() {
    # Check if a PID file already exists to enforce the single-instance rule
    if [ -f "$PID_FILE_FRONT" ] || [ -f "$PID_FILE_BACK" ]; then
        echo "Error: App is already running in the background."
        exit 1
    fi

    echo "Starting frontend and backend in the background..."

    # 1. Start Frontend 
    cd frontend || exit
    npm run dev > /tmp/frontend.log 2>&1 &
    echo $! > "$PID_FILE_FRONT" # Saves the PID of the background process

    # 2. Start Backend 
    cd ../backend || exit
    cargo run > /tmp/backend.log 2>&1 &
    echo $! > "$PID_FILE_BACK" # Saves the PID of the background process

    echo "Application successfully started!"
}

setup_servers() {
    echo "Setting up and running servers"

    # 1. Start Frontend 
    cd frontend || exit
    npm install > /tmp/frontend.log
    npm run dev > /tmp/frontend.log 2>&1 &
    echo $! > "$PID_FILE_FRONT" # Saves the PID of the background process
    cd ..

    # 2. Start Backend 
    cd backend || exit
    cargo run > /tmp/backend.log 2>&1 &
    echo $! > "$PID_FILE_BACK" # Saves the PID of the background process
    cd ..

    echo "Application successfully started!"
}

stop_servers() {
    echo "Stopping background servers..."
    
    # Stop frontend if PID file exists
    if [ -f "$PID_FILE_FRONT" ]; then
        PID=$(cat "$PID_FILE_FRONT")
        kill "$PID" 2>/dev/null
        rm "$PID_FILE_FRONT"
        echo "Frontend stopped."
    else
        echo "Frontend was not running."
    fi

    # Stop backend if PID file exists
    if [ -f "$PID_FILE_BACK" ]; then
        PID=$(cat "$PID_FILE_BACK")
        kill "$PID" 2>/dev/null
        rm "$PID_FILE_BACK"
        echo "Backend stopped."
    else
        echo "Backend was not running."
    fi
}

# Parse the user's command line argument
case "$1" in
    start)
        start_servers
        ;;
    setup)
        setup_servers
        ;;
    stop)
        stop_servers
        ;;
    status)
        if [ -f "$PID_FILE_FRONT" ] || [ -f "$PID_FILE_BACK" ]; then
            echo "Status: Running"
        else
            echo "Status: Stopped"
        fi
        ;;
    *)
        echo "Usage: $0 {setup|start|stop|status}"
        exit 1
esac
