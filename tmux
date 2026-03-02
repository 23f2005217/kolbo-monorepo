#!/bin/bash

SCRIPTS=("dev:hq" "dev:ads" "dev:web")
LOG_DIR="logs"
SESSION_NAME="kolbo"

mkdir -p "$LOG_DIR"

if [[ "$1" == "-l" ]]; then
    for script in "${SCRIPTS[@]}"; do
        nohup npm run "$script" > "$LOG_DIR/${script}.log" 2>&1 &
    done
    echo "Apps running in background. Logs: $LOG_DIR/"
    exit 0
fi

if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    tmux rename-session -t "$SESSION_NAME" "$SESSION_NAME"
else
    tmux new-session -d -s "$SESSION_NAME" -n "apps"
fi

tmux send-keys -t "$SESSION_NAME:apps" "npm run ${SCRIPTS[0]} 2>&1 | tee $LOG_DIR/${SCRIPTS[0]}.log" C-m
sleep 1

tmux split-window -h -t "$SESSION_NAME:apps"
tmux send-keys -t "$SESSION_NAME:apps" "npm run ${SCRIPTS[1]} 2>&1 | tee $LOG_DIR/${SCRIPTS[1]}.log" C-m
sleep 1

tmux split-window -v -t "$SESSION_NAME:apps"
tmux send-keys -t "$SESSION_NAME:apps" "npm run ${SCRIPTS[2]} 2>&1 | tee $LOG_DIR/${SCRIPTS[2]}.log" C-m
sleep 1

tmux select-pane -t "$SESSION_NAME:apps.0"
tmux split-window -v -t "$SESSION_NAME:apps"

tmux attach -t "$SESSION_NAME"
