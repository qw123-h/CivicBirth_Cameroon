# Sprint Retrospective Templates

## Sprint 1 Retrospective (Completed)
**Date:** June 5, 2026  
**Duration:** 1 hour  
**Attendees:** Entire team + Scrum Master

---

## SPRINT 1 RETROSPECTIVE OUTCOME

### ✅ WHAT WENT WELL (Positive Highlights)

#### 1. Team Communication & Collaboration
- Daily standups were well-attended and productive
- Team members helped each other proactively
- Good pairing sessions between backend and frontend devs
- Responsive Slack communication (avg response: 45 min)

#### 2. Product Owner Clarity
- Requirements were clear and well-documented
- Product Owner available for clarifications
- Acceptance criteria well-defined upfront
- No mid-sprint scope changes (good discipline)

#### 3. Development Velocity
- Fast turnaround on code reviews (avg: 8 hours)
- Good test coverage (75% achieved, target 80%)
- CI/CD pipeline helping catch issues early
- Features deployed to staging within 48 hours of completion

#### 4. Problem Solving
- Team creatively solved Supabase integration challenges
- Database design adjusted smoothly mid-sprint
- Environment setup issues resolved quickly
- Good knowledge sharing during blocker resolution

#### 5. Sprint Commitment
- Team completed 100% of committed items (22 points)
- No items rolled over to Sprint 2
- Stretch goals partially achieved
- Team confidence high going into Sprint 2

---

### 📝 WHAT COULD BE BETTER (Improvement Areas)

#### 1. Estimation Accuracy ⚠️
**Issue:** PB-005 (Certificate Generation) estimated at 8 pts, took 10 pts
- PDF generation was more complex than expected
- QR code embedding required external library
- Initial estimation didn't account for Supabase integration time

**Impact:** Medium - Affected sprint capacity slightly

#### 2. Database Design Finalization
**Issue:** Database schema changed on Day 3 of sprint
- New field requirements discovered during form development
- Caused 1-day delay in backend API development
- Team had to redo migrations

**Impact:** Medium - Delayed frontend development start

**Root Cause:** Insufficient backlog refinement before sprint planning

#### 3. Environment Setup Time
**Issue:** Initial setup took longer than expected
- Docker configuration issues (M1 Mac compatibility)
- Database seed script took 2 hours to run
- Environment variables documentation unclear

**Impact:** Low - Only affected Day 1, but could have been smoother

#### 4. Code Review Turnaround
**Issue:** Some PRs waited 16+ hours for review
- Async review process works, but not optimal
- One reviewer was unavailable on Friday
- Could have set up PR review automation

**Impact:** Low - But affected daily workflow

#### 5. Testing Framework Learning Curve
**Issue:** QA engineer needed time to learn Jest testing
- Initial test cases took longer to write
- Test structure could be more standardized
- No pre-sprint testing tutorial

**Impact:** Low - Caught up after Day 2, but slowed initial progress

---

### 🎯 ACTION ITEMS FOR SPRINT 2

| Item | Owner | Priority | Target Date |
|------|-------|----------|------------|
| Create database design finalization checklist | @Product-Owner | High | Before S2 Planning |
| Document estimation bias (add 20% buffer for new tech) | @Scrum-Master | Medium | Before S2 Refinement |
| Create environment setup automation script | @DevOps | High | June 8 |
| Establish PR review SLA (max 6 hours) | @Scrum-Master | Medium | June 5 |
| Create Jest testing guide/template | @QA | Low | June 10 |
| Setup Docker M1 Mac compatibility fixes | @DevOps | Medium | June 8 |

---

### 💡 TEAM FEEDBACK (Individual Comments)

#### Backend Developer
> "Great sprint overall. JWT implementation was straightforward. The certificate generation taught me a lot about PDF libraries. Would like more time for exploring Supabase options next time before sprint starts. Happy with code review feedback!"

**Suggestion:** Pre-spike new technologies in sprint planning

#### Frontend Developer
> "Loved the component-based approach. Form development was smooth once API was ready. Would prefer to have backend API contracts documented earlier. Looking forward to building the analytics dashboard next sprint!"

**Suggestion:** Document API contracts during backlog refinement

#### DevOps Engineer
> "Environment setup was the hardest part. Docker took time to debug. Database migrations could be automated better. Liked being able to parallelize work while team was developing features."

**Suggestion:** Invest in infrastructure automation (for project coursework points!)

#### QA Engineer
> "Good opportunity to write comprehensive tests. Jest is powerful once you understand it. Manual testing took more time than expected. Would like to set up automated integration tests for API endpoints."

**Suggestion:** Create testing automation scripts earlier

---

## SPRINT 2 RETROSPECTIVE TEMPLATE (For Use June 19, 2026)

**Date:** June 19, 2026  
**Duration:** 1 hour  
**Attendees:** [Fill in after sprint]

### ✅ WHAT WENT WELL?

**Instructions:** Each team member shares 2-3 things that went well.

1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________
4. ___________________________________________________________
5. ___________________________________________________________

**Common Categories to Consider:**
- Team collaboration & communication
- Feature completion & quality
- Testing coverage
- Code reviews
- Problem-solving
- Customer satisfaction
- Process improvements from S1

---

### 📝 WHAT COULD BE IMPROVED?

**Instructions:** Discuss challenges faced and improvement opportunities.

1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________
4. ___________________________________________________________
5. ___________________________________________________________

**Common Categories to Consider:**
- Estimation accuracy
- Communication breakdowns
- Technical challenges
- Process inefficiencies
- Tool issues
- Knowledge gaps
- Testing delays

---

### 🎯 WHAT WILL WE COMMIT TO FOR SPRINT 3?

**Action Item 1:**
- **What:** _________________________________________________________
- **Owner:** _________________________________________________________
- **Target Date:** _________________________________________________________

**Action Item 2:**
- **What:** _________________________________________________________
- **Owner:** _________________________________________________________
- **Target Date:** _________________________________________________________

**Action Item 3:**
- **What:** _________________________________________________________
- **Owner:** _________________________________________________________
- **Target Date:** _________________________________________________________

---

### 📊 SPRINT 2 METRICS

**Committed Story Points:** ________  
**Completed Story Points:** ________  
**Team Velocity:** ________ points  
**Test Coverage:** ________%  
**Code Review Avg Time:** ________ hours  

**Trend Analysis:**
- Velocity vs Sprint 1: ________________
- Team Confidence: ________________
- Quality Metrics: ________________

---

### 💬 TEAM FEEDBACK

**Backend Developer:**
___________________________________________________________________________

**Frontend Developer:**
___________________________________________________________________________

**DevOps Engineer:**
___________________________________________________________________________

**QA Engineer:**
___________________________________________________________________________

---

### 🔄 SPRINT 3 PLANNING NOTES

**Recommendations for Sprint 3:**
- Commit to: ________ story points (based on velocity)
- Focus on: ________________
- Reduce: ________________
- Improve: ________________

**Risks to Monitor:**
1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

---

## RETROSPECTIVE MEETING FACILITATION GUIDE

### Pre-Meeting (1 day before)

1. **Send calendar invite:**
   - Time: 2 hours after sprint ends (allow time for demo)
   - Duration: 1 hour
   - Attendees: Entire team + Scrum Master

2. **Prepare workspace:**
   - Google Meet link ready
   - Whiteboard tool open (Miro/Mural)
   - Timer set for time boxes
   - Template ready

3. **Share agenda:**
   ```
   Sprint X Retrospective - [Date]
   
   1. Opening & Context (5 min)
   2. What Went Well (15 min)
   3. What Could Improve (15 min)
   4. Action Items (20 min)
   5. Closing (5 min)
   ```

### During Meeting

**Opening (5 min)**
> "Thanks everyone for a great sprint! Let's reflect on what we learned 
> and how we can improve. This is a safe space - no blame, just learning."

**What Went Well (15 min)**
1. Set timer for 10 min of individual thinking
2. Round-robin: Each person shares one thing
3. Cluster similar items
4. Celebrate wins! 🎉

**What Could Improve (15 min)**
1. Set timer for 10 min of discussion
2. List all improvement areas
3. Don't dismiss or defend - just listen
4. Ask: "Why did this happen?"

**Action Items (20 min)**
1. Pick top 3 improvement areas
2. For each: Assign owner + target date
3. Make specific and measurable
4. Add to project backlog or wiki

**Closing (5 min)**
> "Great reflection team. Let's try these improvements next sprint. 
> Looking forward to working with you all!"

### Post-Meeting

1. **Document outcomes:**
   - Create issue with retrospective summary
   - Assign action items
   - Share with team

2. **Follow up:**
   - Add action items to Sprint 2 backlog
   - Track progress in daily standups
   - Review completion in Sprint 2 retro

3. **Archive retrospective:**
   - Link from sprint plan
   - Reference in historical data

---

## COMMON RETROSPECTIVE QUESTIONS

### For Individuals
- What was your biggest blocker this sprint?
- What did you learn?
- What would help you be more productive?
- How can the team support you better?

### For the Team
- Did we accomplish our sprint goal?
- What surprised us (good or bad)?
- What process changes helped?
- What slowed us down?

### For the Process
- Was the sprint pace sustainable?
- Was our Definition of Done clear?
- Were our estimates accurate?
- Should we change our standup format?

---

## SAMPLE RETROSPECTIVE OUTPUTS

### Good Retrospective
✅ Clear, specific action items  
✅ Ownership assigned  
✅ Realistic timeline  
✅ Focused on improvement  
✅ Team engaged and positive  
✅ Documented for reference  

### Poor Retrospective
❌ Vague complaints without solutions  
❌ Blame-focused rather than learning  
❌ No concrete action items  
❌ Same issues every sprint  
❌ Low attendance/engagement  
❌ Outcomes not documented  

---

## CONTINUOUS IMPROVEMENT METRICS

Track these across sprints:

**Velocity Trend:**
```
Sprint 1: 22 points ✓
Sprint 2: 24 points → 9% improvement
Sprint 3: 25 points → continues upward
```

**Test Coverage:**
```
Sprint 1: 75%
Sprint 2: 80% ✓ (goal achieved!)
Sprint 3: 82% (maintaining high standard)
```

**Code Review Time:**
```
Sprint 1: avg 8 hours
Sprint 2: avg 5 hours ✓ (improved!)
Sprint 3: avg 4 hours (meeting SLA)
```

**Sprint Goal Completion:**
```
Sprint 1: 100% ✓
Sprint 2: 100% ✓ (if maintained)
Sprint 3: Target: 100%
```

---

**Template Version:** 1.0  
**Last Updated:** 2026-06-05  
**For Use By:** CivicBirth Scrum Team
