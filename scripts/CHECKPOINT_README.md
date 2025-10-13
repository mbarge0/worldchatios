# Checkpoint System Guide

## 🔧 Fixed Issue

**Problem:** The original checkpoint system ran in the background but couldn't display terminal prompts.

**Solution:** Now uses **macOS notifications** instead of terminal prompts, so you get notified even when working in other apps.

---

## 🚀 How It Works Now

### Automatic Reminders (Every 20 Minutes)

1. **Background Process:** The reminder runs silently in the background
2. **Notification:** When you have uncommitted changes, you'll receive a macOS notification with:
   - Number of files changed
   - Suggested commit message
3. **Action:** When you're ready to commit, run the checkpoint command

### Creating a Checkpoint

**Option 1: After notification (Quick)**
```bash
./scripts/checkpoint-now.sh
```

**Option 2: Anytime (Manual)**
```bash
./scripts/checkpoint-now.sh
```

**Option 3: Using the main script**
```bash
./scripts/checkpoint.sh create "your message"
```

---

## 📋 Commands

### Start/Stop Reminders

```bash
# Start reminders (runs automatically with pnpm dev)
./scripts/autostart-checkpoint.sh

# Stop reminders
./scripts/checkpoint-stop.sh

# Check status
./scripts/checkpoint-status.sh
```

### Create Checkpoints

```bash
# Interactive checkpoint (recommended)
./scripts/checkpoint-now.sh

# Quick checkpoint with message
./scripts/checkpoint.sh create "feat: add authentication"

# List all checkpoints
./scripts/checkpoint.sh list

# Revert to a checkpoint
./scripts/checkpoint.sh revert checkpoint-name
```

---

## ⚙️ Configuration

Create a `.checkpointrc` file in the project root to customize:

```bash
# Change reminder interval (in seconds)
REMINDER_INTERVAL=600  # 10 minutes instead of 20

# Change tag prefix
BRANCH_TAG="snapshot"
```

---

## 📝 What the System Does

1. **Smart Commit Messages:** Analyzes your changes and suggests appropriate commit messages:
   - "implement authentication" for auth-related files
   - "add LoginForm component" for new components
   - "implement useAuth hook" for hooks
   - "add tests" for test files
   - And more...

2. **Git Tags:** Each checkpoint gets a timestamped tag like `ckpt-2025-10-10_1455`

3. **Logs:** Activity is logged to `$TMPDIR/checkpoint-reminder.log` for debugging

---

## 🎯 Best Practices

1. **Respond to notifications** when you reach a natural stopping point
2. **Use meaningful messages** - the suggestions are just starting points
3. **Checkpoint frequently** - small, atomic commits are better
4. **Review changes** before committing (the script shows you what changed)

---

## 🐛 Troubleshooting

**Not receiving notifications?**
- Check System Preferences → Notifications → Terminal (allow notifications)
- Ensure the reminder is running: `./scripts/checkpoint-status.sh`

**Want to test immediately?**
- Change `REMINDER_INTERVAL=60` in `.checkpointrc` (60 seconds)
- Or make some changes and run `./scripts/checkpoint-now.sh`

**Notifications annoying?**
- Stop reminders: `./scripts/checkpoint-stop.sh`
- Commit manually when ready: `./scripts/checkpoint-now.sh`

---

## 📊 View Logs

```bash
# View recent reminders
tail -f $TMPDIR/checkpoint-reminder.log

# Or on macOS typically:
tail -f /var/folders/.../checkpoint-reminder.log
```

---

## ✅ Current Status

The checkpoint reminder is now running with:
- ✅ macOS notifications
- ✅ Smart commit message suggestions
- ✅ Non-blocking background operation
- ✅ Easy manual checkpoint command

**Next notification:** ~20 minutes from now (if you have uncommitted changes)

