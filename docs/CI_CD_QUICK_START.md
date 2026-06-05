# GitHub Actions CI/CD Quick Start Guide

## 🚀 Get Your Pipeline Running in 5 Minutes

### Step 1: Add Docker Hub Credentials (2 min)

1. **Get your Docker Hub token:**
   - Go to [Docker Hub](https://hub.docker.com/settings/security)
   - Click "New Access Token"
   - Name: `github-actions`
   - Copy the token

2. **Add to GitHub secrets:**
   - Go to your GitHub repo
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `DOCKER_USERNAME` → Value: your Docker username
   - Name: `DOCKER_PASSWORD` → Value: your Docker token

### Step 2: Verify Files Are in Place (1 min)

Check these files exist in your repo:

```bash
✅ Jenkinsfile (in root)
✅ .github/workflows/ci-cd.yml (in .github/workflows/)
✅ backend/package.json (with build scripts)
✅ frontend/package.json (with build scripts)
✅ backend/Dockerfile
✅ frontend/Dockerfile
```

### Step 3: Push to GitHub (1 min)

```bash
git add .
git commit -m "ci: add CI/CD pipeline"
git push origin develop
```

### Step 4: Monitor Pipeline (1 min)

1. Go to your GitHub repo
2. Click **Actions** tab
3. Watch the workflow run
4. Should complete in ~20 minutes

### ✅ All Done! Your pipeline is running.

---

## 📊 Understanding the Workflow

### What Runs Automatically?

| Branch | What Happens |
|--------|-------------|
| `develop` | Build + Test + Deploy to Dev |
| `staging` | Build + Test + Docker Push + Deploy to Staging |
| `main` | Build + Test + Docker Push (wait for manual approval) |
| `pull_request` | Build + Test only (no deploy) |

### Pipeline Stages (What You'll See)

```
1️⃣ Setup
   └─ Install dependencies

2️⃣ Lint & Build (Parallel)
   ├─ Backend lint → build
   └─ Frontend lint → build

3️⃣ Tests (Parallel)
   ├─ Backend tests + coverage
   └─ Frontend tests + coverage

4️⃣ Security
   └─ Scan for vulnerabilities

5️⃣ Docker Build
   └─ Create Docker images

6️⃣ Push
   └─ Push to Docker Hub

7️⃣ Deploy
   └─ Deploy to environment

Total time: ~20 minutes
```

---

## 🎨 Viewing Your Pipeline Results

### In GitHub Actions Dashboard

1. **See all workflow runs:**
   - Go to Actions → See workflow history

2. **Click a workflow run:**
   - See all 16 jobs
   - Click a job to see logs
   - Expand each step to see commands

3. **View test results:**
   - Look for "test" job
   - Scroll to coverage output
   - See % of code tested

4. **View deployment:**
   - Look for "deploy-dev" job
   - See where it deployed
   - Check deployment status

### Example Output

```
✅ setup - 2 minutes
├─ ✅ backend-install - 2 minutes
├─ ✅ frontend-install - 2 minutes
├─ ✅ backend-build - 5 minutes
├─ ✅ backend-test - 8 minutes (Coverage: 82%)
├─ ✅ frontend-build - 5 minutes
├─ ✅ frontend-test - 5 minutes (Coverage: 78%)
├─ ✅ security - 5 minutes (0 vulnerabilities)
├─ ✅ docker-build - 10 minutes
└─ ✅ deploy-dev - 3 minutes

🎉 Workflow completed successfully!
Duration: 19 minutes
```

---

## 🐛 Troubleshooting

### Problem: "Build failed: npm not found"
**Solution:** Make sure Node.js version is set correctly
```bash
# Check .github/workflows/ci-cd.yml line:
node-version: '18'  # ✅ Correct
```

### Problem: "Docker push failed: authentication failed"
**Solution:** Check your Docker credentials
```bash
# Verify in GitHub Settings:
DOCKER_USERNAME ✅ (your Docker username)
DOCKER_PASSWORD ✅ (your Docker token, not password)
```

### Problem: "Build timed out"
**Solution:** Increase timeout or check dependencies
```bash
# This usually means npm install is slow
# Try: npm ci (instead of npm install)
```

### Problem: "Tests failed"
**Solution:** Fix the tests locally first
```bash
cd backend
npm test

# Fix errors, then push:
git add .
git commit -m "fix: tests"
git push origin develop
```

---

## 📸 Taking Screenshots for Coursework

### Screenshot 1: Workflow Summary
```
Go to: Repository → Actions → Click latest workflow run
Capture: Full screen showing all 16 jobs with green checkmarks
```

### Screenshot 2: Job Details
```
Go to: Click on "docker-build" job
Capture: Step-by-step output showing image building
```

### Screenshot 3: Test Results
```
Go to: Click on "backend-test" job
Capture: Coverage percentage and test summary
```

### Screenshot 4: Deployment Status
```
Go to: Click on "deploy-dev" job
Capture: "Successfully deployed" message
```

### Screenshot 5: Pipeline Timeline
```
Go to: Workflow run → click "Summary"
Capture: Timeline graph showing all jobs and duration
```

---

## 🔧 Customizing the Pipeline

### Change Build Scripts

Edit `backend/package.json`:
```json
{
  "scripts": {
    "build": "your build command",
    "test": "your test command"
  }
}
```

The pipeline will automatically use these commands.

### Change Deployment Environment

Edit `.github/workflows/ci-cd.yml`:

Find this section:
```yaml
deploy-dev:
  if: github.ref == 'refs/heads/develop'
```

Change to deploy on different branch:
```yaml
deploy-dev:
  if: github.ref == 'refs/heads/main'  # Deploy on main instead
```

### Skip Deployment

To just build and test without deploying:
```yaml
# Comment out or remove the deploy jobs
# deploy-dev:
#   runs-on: ubuntu-latest
```

---

## 📊 Monitoring Builds Over Time

### View Build History

```
Actions → Filter by branch → See all runs
```

### Track Pipeline Times

```
Each run shows:
├─ Total time: e.g., "19 min"
├─ Build time: e.g., "5 min"
├─ Test time: e.g., "8 min"
└─ Deploy time: e.g., "3 min"
```

### Compare Performance

```
If builds are getting slower:
├─ Check dependency sizes
├─ Check if tests are taking longer
├─ Check if Docker images are too large
└─ Consider optimization
```

---

## 🎯 Next: Testing the Pipeline

### Test 1: Verify Build Works

```bash
git checkout develop
git pull origin develop
echo "// test change" >> backend/src/server.ts
git add .
git commit -m "test: pipeline trigger"
git push origin develop

# Wait 2 minutes, then:
# Go to Actions → See workflow run
```

### Test 2: Verify Deployment

```bash
# Check if service is running:
curl http://localhost:3000/health

# Should return: {"status": "ok"}
```

### Test 3: Verify Docker Push

```bash
# Check Docker Hub:
# https://hub.docker.com/repositories

# You should see:
├─ civicbirth-backend:latest
├─ civicbirth-backend:BUILD_NUMBER
├─ civicbirth-frontend:latest
└─ civicbirth-frontend:BUILD_NUMBER
```

---

## ✅ Checklist: Pipeline Ready

- [ ] Docker credentials added to GitHub
- [ ] GitHub Actions enabled in repo settings
- [ ] Jenkinsfile exists in root
- [ ] `.github/workflows/ci-cd.yml` exists
- [ ] Build scripts defined in package.json
- [ ] Dockerfiles exist for backend and frontend
- [ ] First workflow run completed successfully
- [ ] All 16 jobs showed green checkmarks
- [ ] Tests passed with >80% coverage
- [ ] Docker images pushed to Docker Hub
- [ ] Deployment to dev succeeded
- [ ] Screenshots captured for coursework

---

## 🚀 You're Ready!

Your CI/CD pipeline is now:
- ✅ **Automated** - Triggers on code push
- ✅ **Tested** - Runs unit & integration tests
- ✅ **Secure** - Scans for vulnerabilities
- ✅ **Deployed** - Automatically deploys to environments
- ✅ **Documented** - All steps logged

**Next step:** Push code and watch it build automatically! 🎉

---

**Quick Links:**
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Hub](https://hub.docker.com)
- [View Your Repo Actions](https://github.com/YOUR_USERNAME/CivicBirth_Cameroon/actions)
