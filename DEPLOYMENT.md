# Deployment Guide: Pepper 🌶️

Follow these steps to host your San Diego Volleyball Dashboard for free and share it with friends!

## Step 1: Push to GitHub
I have already initialized **git** locally and created an initial commit for you. Now you just need to connect it to a remote repository.

1.  Go to [github.com/new](https://github.com/new) and log in.
2.  Name your repository `pepper-volleyball`.
3.  Keep it **Public** (so Vercel can see it easily) or Private.
4.  **Do NOT** check any "Initialize" boxes (no README, no .gitignore).
5.  Copy the URL of your new repository.
6.  Run these commands in your terminal (I've prepared the first few):

```bash
cd C:\Users\matth\Documents\sd-volleyball-dashboard
git remote add origin https://github.com/YOUR_USERNAME/pepper-volleyball.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel
1.  Go to [vercel.com](https://vercel.com).
2.  Click **"Add New"** > **"Project"**.
3.  Select your **pepper-volleyball** repository from the list.
4.  In the "Configure Project" screen, you don't need to change any settings for Next.js.
5.  Click **"Deploy"**.

---

## Step 3: Manage Environment Variables (CRITICAL)
Since our `.env.local` file is private (and ignored by Git), you must manually add your Supabase credentials to Vercel so the live site can talk to the database.

1.  In your Vercel Project, go to **Settings** -> **Environment Variables**.
2.  Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the values I provided.
3.  Select both **Production** and **Preview** environments.

---

## Step 4: The Professional Flow (UAT vs Prod) 🚀
Following industry best practices, we use a two-tier environment to ensure stability.

### 1. The "Sandbox" (UAT)
- **Branch**: `uat`
- **Testing**: All new features are pushed to the `uat` branch first.
- **Vercel Preview**: Every push to `uat` generates a stable Preview URL. Use this to verify mobile responsiveness and database syncing before going live.
- **Commands**:
  ```bash
  git checkout uat
  git add .
  git commit -m "feat: your new feature"
  git push origin uat
  ```

### 2. The "Live" Site (Production)
- **Branch**: `main`
- **Deployment**: Only "ready-to-go" code is merged into `main`.
- **Automatic Deployment**: Pushing to `main` triggers the official production build.
- **Commands**:
  ```bash
  git checkout main
  git merge uat
  git push origin main
  ```

---

## Step 5: Data Persistence
> [!NOTE]
> **Database is Live**: We have successfully migrated to **Supabase**. Unlike our local JSON version, all gym updates and admin changes on the live site will now persist permanently across all environments!
> 
> ---

## Step 4: Automate with CLI (Optional)
If you want me to be able to push and deploy for you directly, follow these steps:

1.  **Install Vercel CLI**:
    ```powershell
    npm install -g vercel
    ```
2.  **Log in**:
    ```powershell
    vercel login
    ```
3.  **Authorize GitHub** (If you want automated pushes):
    Follow the [GitHub CLI installation](https://cli.github.com/) and then run:
    ```powershell
    gh auth login
    ```

Once these are set up on your machine, just tell me **"Push and deploy to production"** and I'll handle the rest!
