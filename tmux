#!/bin/bash

SCRIPTS=("dev:hq" "dev:ads" "dev:web")
LOG_DIR="logs"
SESSION_NAME="krun"
WINDOW_NAME="apps"

mkdir -p "$LOG_DIR"

if [[ "$1" == "kill" ]]; then
  if [[ -n "$TMUX" ]]; then
    tmux kill-window -t "$WINDOW_NAME" 2>/dev/null
    echo "Killed tmux window: $WINDOW_NAME"
  else
    tmux kill-session -t "$SESSION_NAME" 2>/dev/null
    echo "Killed tmux session: $SESSION_NAME"
  fi
  exit 0
fi

if [[ "$1" == "-l" ]]; then
  for script in "${SCRIPTS[@]}"; do
    nohup npm run "$script" >"$LOG_DIR/${script}.log" 2>&1 &
  done
  echo "Apps running in background. Logs: $LOG_DIR/"
  exit 0
fi

if [[ -n "$TMUX" ]]; then
  # We are already inside a tmux session
  # Kill existing window if it exists to restart clean
  tmux kill-window -t "$WINDOW_NAME" 2>/dev/null || true

  tmux new-window -n "$WINDOW_NAME"

  tmux send-keys "npm run ${SCRIPTS[0]} 2>&1 | tee $LOG_DIR/${SCRIPTS[0]}.log" C-m
  sleep 1

  tmux split-window -h
  tmux send-keys "npm run ${SCRIPTS[1]} 2>&1 | tee $LOG_DIR/${SCRIPTS[1]}.log" C-m
  sleep 1

  tmux split-window -v
  tmux send-keys "npm run ${SCRIPTS[2]} 2>&1 | tee $LOG_DIR/${SCRIPTS[2]}.log" C-m
  sleep 1

  tmux select-pane -t 0
  tmux split-window -v
else
  # Not inside tmux, create a new session
  if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    tmux kill-session -t "$SESSION_NAME"
  fi

  tmux new-session -d -s "$SESSION_NAME" -n "$WINDOW_NAME"

  tmux send-keys -t "$SESSION_NAME:$WINDOW_NAME" "npm run ${SCRIPTS[0]} 2>&1 | tee $LOG_DIR/${SCRIPTS[0]}.log" C-m
  sleep 1

  tmux split-window -h -t "$SESSION_NAME:$WINDOW_NAME"
  tmux send-keys -t "$SESSION_NAME:$WINDOW_NAME" "npm run ${SCRIPTS[1]} 2>&1 | tee $LOG_DIR/${SCRIPTS[1]}.log" C-m
  sleep 1

  tmux split-window -v -t "$SESSION_NAME:$WINDOW_NAME"
  tmux send-keys -t "$SESSION_NAME:$WINDOW_NAME" "npm run ${SCRIPTS[2]} 2>&1 | tee $LOG_DIR/${SCRIPTS[2]}.log" C-m
  sleep 1

  tmux select-pane -t "$SESSION_NAME:$WINDOW_NAME.0"
  tmux split-window -v -t "$SESSION_NAME:$WINDOW_NAME"

  tmux attach -t "$SESSION_NAME"
fi
