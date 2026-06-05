# GitHub Projects Setup Guide - CivicBirth Scrum

## Complete Instructions for Setting Up Scrum in GitHub Projects

---

## Step 1: Create GitHub Project

### 1.1 Navigate to Project Settings
1. Go to GitHub Repository: [qw123-h/CivicBirth_Cameroon](https://github.com/qw123-h/CivicBirth_Cameroon)
2. Click **Projects** tab
3. Click **New Project**

### 1.2 Configure Project
- **Project Name:** `CivicBirth Sprint Board`
- **Description:** `Scrum board for tracking stories and tasks`
- **Visibility:** Internal (team only)
- **Template:** Choose "Table" (better for burndown tracking)

### 1.3 Create Columns
In the new project, create columns (in order):
1. **Backlog** - Product backlog items not yet planned
2. **Sprint Backlog** - Items committed for current sprint
3. **In Progress** - Actively being worked on
4. **In Review** - Waiting for code review
5. **Testing** - In QA/testing phase
6. **Done** - Completed and accepted

---

## Step 2: Create Product Backlog Issues

### 2.1 Issue Template
For each backlog item, create an Issue with this format:

```
Title: PB-XXX: [User Story Title]

## User Story
As a [role], I want [feature], so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Estimated Story Points
5 points

## Priority
High/Medium/Low

## Type
Feature / Bug / Enhancement / Technical Debt

## Labels
sprint-1, backend, authentication
```

### 2.2 Example Issues to Create

**Issue 1: Authentication System**
```
Title: PB-001: User Authentication System

User Story:
As a system user, I want to login with email and password, 
so that I can access the application securely.

Acceptance Criteria:
- [ ] Login page with email/password form
- [ ] JWT token generation and validation
- [ ] Logout functionality
- [ ] Password reset via email
- [ ] Session timeout after 30 minutes
- [ ] Error messages for invalid credentials

Estimated Story Points: 5
Priority: High
Type: Feature
Labels: sprint-1, authentication, backend, frontend
```

**Issue 2: Role-Based Access Control**
```
Title: PB-002: Role-Based Access Control (RBAC)

User Story:
As a system administrator, I want to control user access 
by roles, so that different users have appropriate permissions.

Acceptance Criteria:
- [ ] 6 distinct roles defined (see specification)
- [ ] RBAC middleware in backend
- [ ] Role checks on API endpoints
- [ ] UI elements hidden/shown based on role
- [ ] Audit log of role assignments
- [ ] Admin panel for role management

Estimated Story Points: 8
Priority: High
Type: Feature
Labels: sprint-1, security, rbac, backend, frontend
```

**Issue 3: Birth Registration Form**
```
Title: PB-003: Birth Registration Form

User Story:
As a municipal registrar, I want a form to register births,
so that I can record vital statistics accurately.

Acceptance Criteria:
- [ ] Multi-step form (personal info, location, etc.)
- [ ] Validation for all required fields
- [ ] File upload for documents
- [ ] Form saves as draft
- [ ] Database storage
- [ ] Confirmation email sent
- [ ] Audit trail of entries

Estimated Story Points: 8
Priority: High
Type: Feature
Labels: sprint-1, registration, backend, frontend
```

### 2.3 Create All Backlog Issues
Create similar issues for:
- PB-004: Registration Management
- PB-005: Certificate Generation
- PB-006: Analytics Dashboard
- PB-007: Field Agent Workspace
- PB-008: Agent Management
- PB-009: Export Functionality
- PB-010: Audit Trail
- TB-001 through TB-006 (Technical Debt)

---

## Step 3: Sprint Planning - Move to Sprint Backlog

### 3.1 Sprint 1 Planning (Day 1)
1. **Open Project Board**
2. **Select issues for Sprint 1:**
   - Drag PB-001 to "Sprint Backlog"
   - Drag PB-002 to "Sprint Backlog"
   - Drag PB-003 to "Sprint Backlog"
   - Drag PB-004 to "Sprint Backlog"
   - Drag PB-008 to "Sprint Backlog"
   - Drag TB-001 (partial) to "Sprint Backlog"

3. **Total committed:** 22 story points

### 3.2 Create Sprint Label
```
Label Name: sprint-1
Color: Yellow
Description: User stories for Sprint 1 (May 22 - June 5)
```

Apply label to all Sprint 1 issues:
```bash
# In GitHub, select multiple issues and apply labels
# Or use this GitHub CLI command:
gh issue edit --label sprint-1 1 2 3 4 5 8
```

---

## Step 4: Create Subtasks (Break Down Stories)

### 4.1 Create Task Issues
For each story, create subtask issues. Example for PB-001:

```
Title: Task 1.1: Implement JWT token generation (BE)

## Related Story
Closes #1 (PB-001 issue)

## Subtask of
PB-001: User Authentication System

## Description
Backend: Implement JWT token generation with 24-hour expiry

## Acceptance Criteria
- [ ] Token includes user ID, role, issued time
- [ ] Token signing with HS256 algorithm
- [ ] Secret key stored securely
- [ ] Unit tests for token generation

## Estimated Hours: 4 hours

## Assigned to: @backend-dev
```

### 4.2 Link Subtasks to Parent Stories
```
- In each subtask issue, add comment:
  "Subtask of #1 (PB-001)"
- GitHub will auto-link them
```

### 4.3 Example Task Breakdown for Story 1

Create these issues:
```
Sprint 1 Tasks:
├─ Task 1.1: Implement JWT token generation (BE) - 4h
├─ Task 1.2: Create login endpoint (BE) - 4h
├─ Task 1.3: Create logout endpoint (BE) - 2h
├─ Task 1.4: Build login page (FE) - 6h
├─ Task 1.5: Add auth guard to routes (FE) - 4h
└─ Task 1.6: Write tests for auth (QA) - 6h
```

---

## Step 5: Assign Issues to Team Members

### 5.1 Configure Team
In GitHub Repository Settings → Collaborators:
1. Invite team members with roles:
   - **Admin:** Product Owner (Hosanne)
   - **Maintain:** Scrum Master
   - **Write:** Developers
   - **Read:** Optional stakeholders

### 5.2 Assign Issues
For each issue, assign to responsible person:
- Backend tasks → Backend Developer
- Frontend tasks → Frontend Developer
- DevOps tasks → DevOps Engineer
- QA tasks → QA Engineer

**Avoid:**
- Multiple assignees (creates confusion)
- Unassigned issues (except backlog)
- Assignment changes mid-sprint

---

## Step 6: Daily Standup Tracking

### 6.1 Update During Daily Standup
Team members update their assigned issues:

**Status Updates:**
- Comment: "Started work on this today"
- Comment: "70% complete, awaiting review"
- Move card to "In Review" when PR created
- Move to "Testing" when merged

**Example Comment:**
```
Starting implementation of JWT token generation.
Will have initial implementation by EOD.
No blockers so far.
```

### 6.2 Tracking Blockers
If blocked, comment:
```
⚠️ BLOCKER: Waiting for database schema confirmation from Product Owner
Estimated resolution: Tomorrow EOD
```

**Scrum Master Action:** Follow up on blocker within 2 hours

---

## Step 7: Sprint Board Management

### 7.1 Daily Board Review
**Every morning (before standup):**
1. Check "In Progress" column - should match active work
2. Check "In Review" - should have PR link
3. Check blockers - Scrum Master follows up
4. Move cards based on status

### 7.2 Mid-Sprint Check (Day 5)
1. Calculate points completed vs ideal burn
2. Assess if team is on track
3. Plan workload for second half
4. Identify scope creep

### 7.3 Sprint End Review (Day 10)
1. All "Done" items demoed to Product Owner
2. Count completed story points (velocity)
3. Archive Sprint 1 column
4. Create Sprint 2 column

---

## Step 8: Burndown Chart Tracking

### 8.1 Manual Burndown (Spreadsheet)
Create a simple Google Sheet:

```
Date       Ideal  Actual  Notes
May 22      40     43     Sprint planning
May 23      36     35     Auth started
May 24      31.5   28     Good progress
May 25      27     27     On track
May 26      22.5   20     Form endpoints
May 27      18     16     Frontend work
May 28      13.5   14     Testing begins
May 29       9      9     Most tests pass
May 30       4.5    5     Final cleanup
June 5       0      0     Sprint complete ✓
```

### 8.2 Automated Burndown (GitHub Actions)
Create `.github/workflows/burndown.yml`:

```yaml
name: Burndown Calculator

on:
  schedule:
    - cron: '0 17 * * *'  # Run daily at 5 PM

jobs:
  calculate:
    runs-on: ubuntu-latest
    steps:
      - name: Calculate Points
        run: |
          # Count points by column
          # Write to CSV file
          # Push to repo
```

---

## Step 9: Sprint Review & Demo

### 9.1 Demo Checklist
For each completed story, demo:
- [ ] Feature working in staging environment
- [ ] All acceptance criteria met
- [ ] User can complete the workflow
- [ ] Error handling works
- [ ] No console errors

### 9.2 Create Demo Video (Optional)
```bash
# Record sprint demo
ffmpeg -f gdigrab -i desktop -c:v libx264 demo.mp4

# Upload to team drive
# Link in sprint retrospective
```

### 9.3 Product Owner Sign-Off
PO comments on each issue:
```
✅ ACCEPTED - Meets all acceptance criteria

or

❌ NEEDS WORK - Missing criterion 2, please revise
```

---

## Step 10: Sprint Retrospective

### 10.1 Retrospective Meeting (Day 10, 1 hour)

**Agenda:**
1. What went well? (10 min)
2. What could improve? (10 min)
3. What will we commit to? (10 min)
4. Team feedback (10 min)
5. Closing remarks (10 min)

### 10.2 Record Outcomes
Create Issue: `Sprint 1 Retrospective - May 22 to June 5`

```markdown
## What Went Well ✅
- Good daily communication
- Effective code reviews
- Test-driven development approach
- Positive team morale

## What Could Improve 📝
- Database design finalization
- Estimation accuracy
- Code review turnaround time
- Environment setup documentation

## Action Items for Sprint 2 🎯
1. @scrum-master: Create database design checklist for backlog refinement
2. @team: Use velocity-based estimation (22 points)
3. @team: Max 6-hour PR review turnaround
4. @devops: Create environment setup automation script

## Team Velocity
- Sprint 1: 22 points ✓
- Sprint 2 Commitment: 24 points
- Trend: Upward ↗
```

---

## Step 11: GitHub Projects Tips & Tricks

### 11.1 Useful Commands

**View all sprint 1 issues:**
```
is:issue label:sprint-1 repo:qw123-h/CivicBirth_Cameroon
```

**Filter by assignee:**
```
assignee:@backend-dev label:sprint-1
```

**View by priority:**
```
is:issue label:high-priority sort:created-desc
```

### 11.2 GitHub CLI (gh) Commands

```bash
# Create issue
gh issue create --title "PB-001: Auth" --label sprint-1

# Add to project
gh issue edit 1 --project CivicBirth\ Sprint\ Board

# Assign issue
gh issue edit 1 --assignee backend-dev

# View issue
gh issue view 1
```

### 11.3 Notifications & Automation

**Watch issues:**
```
Settings → Notifications → Watching → Watch repository
```

**Auto-close issues:**
```
In Pull Request description:
Closes #1 (closes PB-001 when PR is merged)
```

---

## Step 12: Sprint Metrics Dashboard

### 12.1 Create Metrics Tracking

Create a Wiki page: `Sprint-Metrics`

```markdown
# Sprint Metrics

## Sprint 1 (May 22 - June 5)
- **Committed:** 22 points
- **Completed:** 22 points
- **Velocity:** 22 points ✓
- **Burn Rate:** 2.2 points/day
- **Test Coverage:** 75%

## Sprint 2 (June 5 - June 19)
- **Committed:** 24 points
- **Completed:** TBD
- **Velocity:** TBD
- **Test Coverage Target:** 80%

## Trend Analysis
- Velocity trending upward ↗
- Team confidence increasing
- Estimation accuracy improving
```

---

## Step 13: Continuous Improvement

### 13.1 Weekly Metrics Review
Every Friday 4 PM:
- Scrum Master reviews board state
- Identifies bottlenecks
- Updates velocity forecast
- Shares update with team

### 13.2 Monthly Retrospective Deep Dive
Every 4 sprints:
- Longer retrospective (2 hours)
- Review trends across sprints
- Team building discussion
- Process improvements

---

## TROUBLESHOOTING

### Issue: Cards not updating
**Solution:** Refresh page or hard refresh (Ctrl+Shift+R)

### Issue: Can't move card to column
**Solution:** Check issue is assigned and has story points

### Issue: Burndown not calculating
**Solution:** Ensure all items have story point estimate

### Issue: Team not updating status
**Solution:** Remind in standup + send daily Slack message

---

## SAMPLE GITHUB PROJECTS URL

After setup, your board will be at:
```
https://github.com/qw123-h/CivicBirth_Cameroon/projects/1
```

---

## NEXT STEPS

1. ✅ Create GitHub Project
2. ✅ Create all product backlog issues
3. ✅ Create Sprint 1 issues
4. ✅ Move to "Sprint Backlog" column
5. ✅ Assign to team members
6. ✅ Start daily standups
7. ✅ Track progress with board
8. ✅ Update burndown chart daily
9. ✅ Complete sprint review
10. ✅ Run retrospective
11. ✅ Plan Sprint 2

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-05  
**Instructions Created For:** CivicBirth Team
