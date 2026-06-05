# CivicBirth Scrum Documentation

## Course: SEN3244 - Software Architecture
**Project:** CivicBirth - Civil Birth Registration System  
**Team Size:** 4 members  
**Sprint Duration:** 2 weeks  
**Start Date:** 2026-05-22  
**Documentation Date:** 2026-06-05

---

## 1. SCRUM TEAM ROLES & RESPONSIBILITIES

### 1.1 Product Owner
**Name:** Hosanne (Team Lead)  
**Responsibilities:**
- Define and maintain product backlog
- Prioritize features based on business value
- Accept or reject completed work
- Communicate with stakeholders
- Clarify requirements during sprint planning
- Update backlog regularly

**Contact:** hosanne@civicbirth.cm

### 1.2 Scrum Master
**Name:** [Tech Lead / Project Coordinator]  
**Responsibilities:**
- Facilitate all Scrum ceremonies (daily standup, sprint planning, review, retrospective)
- Remove blockers and impediments
- Protect team from external distractions
- Ensure Scrum practices are followed
- Coach team on Agile principles
- Maintain burndown charts and metrics

**Contact:** scrum@civicbirth.cm

### 1.3 Development Team
**Team Members:**
1. **Backend Developer** - Node.js/TypeScript API development
2. **Frontend Developer** - React UI implementation
3. **DevOps Engineer** - Infrastructure, CI/CD, deployment
4. **QA/Testing Engineer** - Testing, quality assurance, documentation

**Team Velocity:** 20-25 story points per sprint (2-week sprint)

---

## 2. SCRUM CEREMONIES & SCHEDULE

### 2.1 Daily Standup
- **Time:** 09:00 AM daily (15 minutes)
- **Where:** Video call (Zoom/Google Meet)
- **Format:**
  - What did I complete yesterday?
  - What will I complete today?
  - What blockers am I facing?
- **Attendees:** Entire team + Scrum Master

### 2.2 Sprint Planning
- **Time:** Start of sprint (Typically Monday)
- **Duration:** 2-3 hours
- **Agenda:**
  1. Review product backlog (30 min)
  2. Team estimates user stories (45 min)
  3. Commit to sprint goals (30 min)
  4. Break down stories into tasks (30 min)
- **Output:** Sprint backlog with committed stories

### 2.3 Sprint Review (Demo)
- **Time:** End of sprint (Typically Friday)
- **Duration:** 1-2 hours
- **Agenda:**
  1. Demonstrate completed features to stakeholders
  2. Collect feedback
  3. Update product backlog
- **Attendees:** Team + Product Owner + Stakeholders

### 2.4 Sprint Retrospective
- **Time:** End of sprint (Typically Friday after review)
- **Duration:** 1 hour
- **Agenda:**
  1. What went well?
  2. What could be improved?
  3. What will we commit to improving next sprint?
- **Output:** Action items for next sprint

### 2.5 Backlog Refinement (Grooming)
- **Time:** Mid-sprint (Wednesday)
- **Duration:** 1 hour
- **Agenda:**
  - Clarify upcoming backlog items
  - Estimate new stories
  - Identify dependencies

---

## 3. SCRUM ARTIFACTS

### 3.1 Product Backlog
The complete list of features, enhancements, and fixes for CivicBirth, prioritized by business value and stakeholder needs.

**Backlog Categories:**
1. **Core Features** - Essential functionality
2. **Enhancement** - Improvements to existing features
3. **Bug Fixes** - Issues to resolve
4. **Technical Debt** - Infrastructure improvements
5. **Documentation** - User guides, API docs

### 3.2 Sprint Backlog
Items selected from product backlog for current sprint, broken down into tasks.

**Current Sprint:** Sprint 1 (2 weeks)

**Items in Current Sprint:**
- 5-8 user stories
- 20-25 story points
- All tasks estimated in hours (4-8 hours per task)

### 3.3 Burndown Chart
Visual representation of sprint progress showing:
- X-axis: Days in sprint (1-10 for 2-week sprint)
- Y-axis: Story points remaining
- **Ideal line:** Linear decline from total to 0
- **Actual line:** Real progress of team

---

## 4. ESTIMATION & VELOCITY

### 4.1 Story Point Scale
Uses Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21

| Points | Complexity | Example |
|--------|-----------|---------|
| 1 | Trivial | Fix typo, update constant |
| 2 | Very Easy | Simple bug fix, minor UI change |
| 3 | Easy | Single page, basic CRUD operation |
| 5 | Medium | New API endpoint, feature with multiple screens |
| 8 | Hard | Complex feature, integration with external service |
| 13 | Very Hard | Major feature, significant refactoring |
| 21 | Epic | Break into smaller stories |

### 4.2 Team Velocity

**Sprint 1 Velocity:** 22 story points  
**Sprint 2 Velocity:** 24 story points  
**Average Velocity:** 23 story points

This velocity is used to forecast:
- Capacity for future sprints
- Release timelines
- Sprint planning goals

### 4.3 Definition of Done (DoD)

A task is considered "Done" when:
- [ ] Code written and reviewed
- [ ] Unit tests written (80%+ coverage)
- [ ] All tests passing
- [ ] Code merged to main branch
- [ ] Documented (code comments + user docs)
- [ ] Demonstrated to Product Owner
- [ ] Product Owner acceptance

---

## 5. PRODUCT BACKLOG

### Total Backlog Size: 180 story points (8-10 sprints of work)

#### High Priority (Implement in Sprints 1-2)
| ID | Story | Points | Description |
|----|----|--------|-------------|
| PB-001 | User Authentication | 5 | Implement login/logout with JWT |
| PB-002 | Role-Based Access Control | 8 | RBAC for 6 different user roles |
| PB-003 | Birth Registration Form | 8 | Web form for registering births |
| PB-004 | Registration Management | 5 | View, edit, delete registrations |
| PB-005 | Certificate Generation | 8 | Generate and export birth certificates |
| PB-006 | Analytics Dashboard | 5 | Display statistics and metrics |
| PB-007 | Field Agent Workspace | 5 | Mobile-friendly workspace for agents |
| PB-008 | Agent Management | 3 | CRUD operations for agents |
| PB-009 | Export Functionality | 3 | Export data to CSV/PDF |
| PB-010 | Audit Trail | 5 | Log all changes and access |

#### Medium Priority (Sprints 3-4)
| ID | Story | Points | Description |
|----|----|--------|-------------|
| PB-011 | Multi-language Support | 5 | English/French translations |
| PB-012 | Email Notifications | 5 | Send alerts and confirmations |
| PB-013 | Advanced Filtering | 3 | Filter registrations by criteria |
| PB-014 | User Profile Management | 3 | Update user information |
| PB-015 | Batch Import | 8 | Import registrations from CSV |

#### Lower Priority (Sprints 5+)
| ID | Story | Points | Description |
|----|----|--------|-------------|
| PB-016 | Mobile App (Native) | 21 | Native iOS/Android app |
| PB-017 | Payment Integration | 5 | Online payment processing |
| PB-018 | SMS Notifications | 3 | Send SMS alerts |
| PB-019 | Advanced Search | 5 | Full-text search across records |
| PB-020 | API Rate Limiting | 3 | Protect API from abuse |

#### Technical Debt / Infrastructure
| ID | Story | Points | Description |
|----|----|--------|-------------|
| TB-001 | Test Coverage | 8 | Achieve 80%+ code coverage |
| TB-002 | Kubernetes Deployment | 13 | Containerize and deploy to K8s |
| TB-003 | CI/CD Pipeline | 8 | Setup automated testing & deployment |
| TB-004 | Monitoring & Logging | 5 | Prometheus/Grafana setup |
| TB-005 | Database Optimization | 5 | Index optimization, query tuning |
| TB-006 | Security Audit | 5 | Penetration testing, vulnerability scan |

---

## 6. SPRINT 1 DETAILS (May 22 - June 5, 2026)

### 6.1 Sprint Goal
**"Deliver core authentication, registration, and certificate generation with 80%+ test coverage"**

### 6.2 Sprint Backlog

| ID | Story | Points | Tasks | Status |
|----|----|--------|-------|--------|
| PB-001 | User Authentication | 5 | Backend auth + Frontend login | COMPLETED |
| PB-002 | RBAC System | 8 | 6 roles + middleware + tests | COMPLETED |
| PB-003 | Birth Registration Form | 8 | Form UI + validation + API | COMPLETED |
| PB-004 | Registration Management | 5 | CRUD endpoints + UI | COMPLETED |
| PB-005 | Certificate Generation | 8 | Template + export + storage | IN PROGRESS |
| PB-008 | Agent Management | 3 | API endpoints + basic UI | COMPLETED |
| TB-001 | Test Coverage | 8 | Unit + integration tests | IN PROGRESS |

**Total Sprint 1: 45 points (Team committed: 22 points, stretch: 45)**

### 6.3 Sprint 1 Tasks Breakdown

#### PB-001: User Authentication (5 points)
```
Task 1.1: Implement JWT token generation (BE) - 4 hours
Task 1.2: Create login endpoint (BE) - 4 hours
Task 1.3: Create logout endpoint (BE) - 2 hours
Task 1.4: Build login page (FE) - 6 hours
Task 1.5: Add auth guard to routes (FE) - 4 hours
Task 1.6: Write tests for auth (QA) - 6 hours
```
**Total: 26 hours (~1.3 weeks for 1 developer)**

#### PB-002: RBAC System (8 points)
```
Task 2.1: Define 6 roles in database (BE) - 2 hours
Task 2.2: Create RBAC middleware (BE) - 6 hours
Task 2.3: Implement role checks (BE) - 4 hours
Task 2.4: Role-based UI rendering (FE) - 6 hours
Task 2.5: Authorization tests (QA) - 8 hours
```
**Total: 26 hours**

#### PB-003: Birth Registration Form (8 points)
```
Task 3.1: Design database schema (BE) - 3 hours
Task 3.2: Create API endpoints (BE) - 8 hours
Task 3.3: Form validation (BE) - 4 hours
Task 3.4: Build registration form (FE) - 10 hours
Task 3.5: Form validation (FE) - 4 hours
Task 3.6: Integration tests (QA) - 8 hours
```
**Total: 37 hours**

#### Additional Tasks
```
Task 4.1: Database migrations (DevOps) - 2 hours
Task 4.2: Environment setup (DevOps) - 3 hours
Task 4.3: Documentation (QA) - 4 hours
Task 4.4: Code review & merge (All) - 5 hours
```

### 6.4 Sprint 1 Burndown Chart

```
Story Points Remaining vs Time

45 |████████████████████████████████████
40 |                    ╲
35 |                     ╲
30 |                      ╲
25 |                       ╲
20 |                        ╲
15 |                         ╲
10 |                          ╲
 5 |                           ╲
 0 |────────────────────────────╲___
   +──────────────────────────────────
   1  2  3  4  5  6  7  8  9  10 Days

   ─── Ideal Line (dotted)
   ─── Actual Line (solid)
```

**Daily Breakdown:**
| Day | Ideal | Actual | Notes |
|-----|-------|--------|-------|
| Day 1 | 40.5 | 43 | Sprint planning, setup |
| Day 2 | 36 | 35 | Auth implementation started |
| Day 3 | 31.5 | 28 | Good progress on auth & RBAC |
| Day 4 | 27 | 27 | On track |
| Day 5 | 22.5 | 20 | Form endpoints done |
| Day 6 | 18 | 16 | Frontend work progressing |
| Day 7 | 13.5 | 14 | Testing begins |
| Day 8 | 9 | 9 | Most tests passing |
| Day 9 | 4.5 | 5 | Final cleanup |
| Day 10 | 0 | 0 | Sprint complete ✓ |

### 6.5 Sprint 1 Results

**Completed: 22 story points**
- PB-001: User Authentication ✅
- PB-002: RBAC System ✅
- PB-003: Birth Registration Form ✅
- PB-004: Registration Management ✅
- PB-008: Agent Management ✅
- Partial: PB-005 (80% complete)
- Partial: TB-001 (Test coverage 75%)

**Velocity: 22 points** ✓

**Burn Rate: 2.2 points/day**

### 6.6 Sprint 1 Retrospective

#### What Went Well ✅
1. **Good communication** - Daily standups were effective
2. **Clear requirements** - Product Owner clarified scope well
3. **Fast prototyping** - Ability to test features daily
4. **Team collaboration** - Good pair programming sessions
5. **Testing mindset** - Team writing tests proactively

#### What Could Be Better 📝
1. **Better estimation** - Certificate generation took longer than expected
2. **Database design** - Schema changes mid-sprint
3. **Environment setup** - Initial setup took 1 day
4. **Code review** - Some reviews took > 24 hours
5. **External dependencies** - Supabase integration delays

#### Action Items for Sprint 2 🎯
1. **Improve database design** - Finalize schema in backlog refinement
2. **Code review process** - Max 6-hour turnaround for reviews
3. **Environment documentation** - Create setup guide
4. **Pre-sprint testing** - Test external service connections
5. **Estimation** - Use velocity to plan more accurately

#### Team Feedback
- **Backend Dev:** "Need more time for cert generation logic, Supabase integration was tricky"
- **Frontend Dev:** "Form is great, liked the component-based approach"
- **DevOps:** "Database setup took time, automate with scripts"
- **QA:** "More integration tests needed, manual testing was heavy"

#### Velocity for Next Sprint
**Based on Sprint 1: Commit to 24 points in Sprint 2**

---

## 7. SPRINT 2 DETAILS (June 5 - June 19, 2026)

### 7.1 Sprint Goal
**"Enhance analytics, field agent features, and achieve infrastructure-ready deployment"**

### 7.2 Sprint Backlog

| ID | Story | Points | Tasks | Status |
|----|----|--------|-------|--------|
| PB-005 | Certificate Generation | 8 | Complete + testing | NOT STARTED |
| PB-006 | Analytics Dashboard | 5 | Charts + statistics | NOT STARTED |
| PB-007 | Field Agent Workspace | 5 | Mobile-first UI | NOT STARTED |
| PB-009 | Export Functionality | 3 | CSV + PDF export | NOT STARTED |
| PB-010 | Audit Trail | 5 | Logging + reports | NOT STARTED |
| TB-001 | Test Coverage | 8 | Complete 80% coverage | NOT STARTED |
| TB-003 | CI/CD Pipeline | 8 | Jenkins/GitHub Actions | NOT STARTED |

**Total Sprint 2: 42 points (Team committing: 24 points)**

### 7.3 Sprint 2 Tasks Breakdown

#### PB-005: Certificate Generation (Complete) (8 points)
```
Task 5.1: Finish cert template (BE) - 6 hours
Task 5.2: PDF generation (BE) - 8 hours
Task 5.3: QR code embedding (BE) - 4 hours
Task 5.4: Download functionality (FE) - 4 hours
Task 5.5: Verification endpoint (BE) - 4 hours
Task 5.6: Certificate tests (QA) - 8 hours
```

#### PB-006: Analytics Dashboard (5 points)
```
Task 6.1: Design dashboard (FE) - 4 hours
Task 6.2: Statistics endpoints (BE) - 6 hours
Task 6.3: Chart components (FE) - 6 hours
Task 6.4: Real-time updates (BE/FE) - 4 hours
Task 6.5: Dashboard tests (QA) - 6 hours
```

#### PB-007: Field Agent Workspace (5 points)
```
Task 7.1: Mobile-responsive design (FE) - 6 hours
Task 7.2: Task assignment API (BE) - 6 hours
Task 7.3: Offline functionality (FE) - 4 hours
Task 7.4: Sync mechanism (BE/FE) - 6 hours
Task 7.5: Workspace tests (QA) - 6 hours
```

#### TB-003: CI/CD Pipeline (8 points)
```
Task CI-1: Setup Jenkins/GitHub Actions - 8 hours
Task CI-2: Configure build pipeline - 6 hours
Task CI-3: Automated testing - 4 hours
Task CI-4: Deployment automation - 6 hours
Task CI-5: CI/CD documentation - 4 hours
```

### 7.4 Sprint 2 Burndown Chart

```
Story Points Remaining vs Time

42 |████████████████████████████████
36 |                   ╲
30 |                    ╲
24 |                     ╲  (Committed: 24 pts)
18 |                      ╲
12 |                       ╲
 6 |                        ╲
 0 |─────────────────────────╲___
   +────────────────────────────────
   1  2  3  4  5  6  7  8  9  10 Days
```

**Daily Targets (Committed 24 points):**
| Day | Ideal | Comment |
|-----|-------|---------|
| Day 1 | 21.6 | Sprint planning + cert finish |
| Day 2 | 19.2 | Analytics work begins |
| Day 3 | 16.8 | Field agent feature started |
| Day 4 | 14.4 | CI/CD setup initiated |
| Day 5 | 12 | Mid-sprint check |
| Day 6 | 9.6 | Testing phase |
| Day 7 | 7.2 | Integration testing |
| Day 8 | 4.8 | Demo preparation |
| Day 9 | 2.4 | Final fixes |
| Day 10 | 0 | Sprint review & demo |

---

## 8. KEY METRICS & VELOCITY TRACKING

### 8.1 Velocity Trend

```
Velocity (Story Points Completed)

25 |           ╔════╗
20 |  ╔════╗  ║ 24 ║ (Projected Sprint 2)
15 |  ║ 22 ║  ╚════╝
10 |  ║ S1 ║
 5 |  ╚════╝
 0 |________________
   Sprint 1  Sprint 2  Sprint 3

Average Velocity: 23 points
Trend: Upward ↗
```

### 8.2 Burndown Characteristics

**Sprint 1:**
- Linear burn (good) - Team delivered consistently
- No scope creep
- Minimal mid-sprint changes

**Sprint 2:**
- Committed to 24 points (slightly higher than S1)
- Based on demonstrated velocity
- With buffer for external dependencies

### 8.3 Coverage Metrics

| Sprint | Total Points | Completed | Velocity | %Complete |
|--------|-------------|-----------|----------|-----------|
| S1 | 22 committed | 22 | 22 | 100% ✓ |
| S2 | 24 committed | TBD | TBD | In Progress |
| S3-10 | 8 sprints | TBD | ~23 avg | Forecasted |

---

## 9. WORKFLOW & TOOLS

### 9.1 Recommended Tools

**Sprint Management:**
- ✅ GitHub Projects (Free, integrated with repo)
- Alternative: Jira (Professional), Trello (Simple)

**Communication:**
- Daily Standup: Google Meet / Zoom
- Chat: Slack or Discord
- Documentation: GitHub Wiki

**Version Control:**
- GitHub for code + issues
- Branches per feature (git-flow)
- Pull requests for code review

### 9.2 GitHub Projects Setup

**Project Columns:**
1. **Backlog** - All items in product backlog
2. **Sprint Backlog** - Items committed for sprint
3. **In Progress** - Actively being worked on
4. **In Review** - Awaiting code review
5. **Testing** - In QA/testing phase
6. **Done** - Completed and accepted

**Card Details:**
- Title: User story
- Description: Acceptance criteria
- Assignee: Developer(s)
- Labels: Sprint, Priority, Type
- Estimate: Story points

### 9.3 Kanban Board Example

```
┌────────────────┬──────────────┬─────────────┬──────────┬────────┐
│   BACKLOG      │ SPRINT READY │ IN PROGRESS │ REVIEW   │  DONE  │
├────────────────┼──────────────┼─────────────┼──────────┼────────┤
│ PB-011: Multi- │ PB-005: Cert │ PB-006:     │ PB-004:  │PB-001: │
│ language (5pt) │ Gen (8pt)    │ Analytics   │ Reg Mgmt │ Auth   │
│                │              │ (5pt)       │ (5pt)    │ (5pt)  │
│ PB-012: Email  │ PB-007: Agent│ PB-009:     │          │PB-002: │
│ (5pt)          │ Workspace    │ Export      │          │ RBAC   │
│                │ (5pt)        │ (3pt)       │          │ (8pt)  │
│ PB-015: Batch  │              │ PB-010:     │          │PB-003: │
│ Import (8pt)   │              │ Audit       │          │ Form   │
│                │              │ (5pt)       │          │ (8pt)  │
└────────────────┴──────────────┴─────────────┴──────────┴────────┘

Totals:   18pts        18pts          13pts        5pts      21pts
```

---

## 10. TEAM WORKING AGREEMENTS

### 10.1 Time Commitment
- **Full-time:** 40 hours/week during active sprints
- **Meeting time:** 5-6 hours/week in ceremonies
- **Coding time:** 30-35 hours/week

### 10.2 Communication Guidelines
- **Daily Standup:** 09:00 AM sharp (no exceptions)
- **Response time:** Max 2 hours for team questions
- **PR reviews:** Max 6 hours turnaround
- **Slack:** Check Slack twice daily minimum

### 10.3 Code Quality Standards
- **Test coverage:** 80% minimum
- **Code review:** 2 approvals before merge
- **Linting:** All code must pass ESLint
- **Commits:** Meaningful commit messages

### 10.4 Sprint Rules
- **No scope change after Day 3** without discussion
- **Backlog refinement:** Mandatory on Day 4
- **Demo:** All work must be demonstrated
- **Retrospective:** All team must attend

---

## 11. SUCCESS CRITERIA

### Sprint Success Definition
✅ **A sprint is successful if:**
1. Team completes ≥80% of committed story points
2. All completed items meet Definition of Done
3. Test coverage ≥80%
4. All blockers resolved within 24 hours
5. Demo shows working features (not just partial)

### Project Success Criteria
✅ **Project succeeds if:**
1. All high-priority features delivered
2. ≥80% test coverage maintained
3. System deployed to production
4. User adoption rate ≥80%
5. Performance SLAs met (response time <500ms)

---

## 12. RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| External API failures | High | Medium | Mock APIs, plan offline mode |
| Resource shortage | High | Low | Cross-training, buffer time |
| Scope creep | Medium | High | Strict backlog management |
| Testing delays | Medium | Medium | Test early, automate tests |
| DevOps challenges | High | Medium | Early infrastructure setup |

---

## APPENDIX: DEFINITIONS

### Acceptance Criteria
Specific, measurable conditions that must be met for a story to be accepted.

### Story Point
Relative measure of effort (not time) using Fibonacci scale.

### Burndown
Chart showing remaining work vs time - should trend toward zero.

### Velocity
Number of story points completed per sprint - used for forecasting.

### Definition of Done
Checklist of quality criteria all completed work must meet.

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-05  
**Next Review:** After Sprint 2 (2026-06-19)
