#!/bin/bash
# Script untuk menjalankan ISHAS di port 3003 dengan tmux (tetap jalan walau terminal tertutup)
set -e
cd "$(dirname "$0")"
echo "[ISHAS] bun install..."
bun install
# kill old tmux session if exists
if tmux has-session -t ishas 2>/dev/null; then
  echo "[ISHAS] menghentikan tmux session lama..."
  tmux kill-session -t ishas
  sleep 2
fi
# kill process di port 3003 jika masih ada
PID=$(lsof -ti:3003 2>/dev/null || ss -lptn 'sport = :3003' 2>/dev/null | grep -oP 'pid=\K\d+' | head -1 || true)
if [ -n "$PID" ]; then
  echo "[ISHAS] kill process di port 3003 (PID $PID)"
  kill $PID 2>/dev/null || true
  sleep 2
fi
echo "[ISHAS] memulai tmux session 'ishas' di port 3003..."
tmux new-session -d -s ishas -c "$(pwd)" 'bun run dev 2>&1 | tee /tmp/ishas-tmux.log'
sleep 3
echo "[ISHAS] cek status..."
tmux capture-pane -t ishas -p | tail -n 20
ss -tlnp | grep 3003 && echo "[ISHAS] OK jalan di port 3003" || echo "[ISHAS] GAGAL cek port 3003"
echo "[ISHAS] untuk lihat log: tmux attach -t ishas  atau  tail -f /tmp/ishas-tmux.log"
echo "[ISHAS] untuk stop: tmux kill-session -t ishas"
