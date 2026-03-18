# Git Quick Commands

## Aliases

| Command | Description |
|---|---|
| `git push-all` | Stage all changes, commit with "Update", and push |
| `git sync` | Pull latest changes, stage all local changes, commit with "Update", and push |

## Setup

Run these once to register the aliases on your machine:

```bash
git config --global alias.push-all '!git add -A && git commit -m "Update" && git push'
git config --global alias.sync '!git pull --rebase && git add -A && git commit -m "Update" && git push'
```

## Common Manual Commands

| Command | Description |
|---|---|
| `git status` | See what files have changed |
| `git add -A` | Stage all changes |
| `git commit -m "message"` | Commit with a custom message |
| `git push` | Push commits to GitHub |
| `git pull` | Pull latest changes from GitHub |
