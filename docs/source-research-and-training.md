# Cancha discovery and training research — October 12, 2026

Goal: useful Florida soccer discovery for players, families, clubs and people seeking work, plus online learning. Public job boards may supply leads; only exact source-checked opportunities enter automatic Active publication. An HTTP 200 or directory membership does not establish availability, dates, eligibility or image rights. Search-result totals are not verified listing counts.

## Where to find listings

| Source | Best use | Finding and next check |
| --- | --- | --- |
| [FYSA club finder](https://www.fysa.com/play/) | Local youth and recreational clubs | Official finder supports searching by city. Follow the club's own current registration page; membership is not a roster-space guarantee. |
| [UPSL team directory](https://premier.upsl.com/teams/) | Smaller clubs and adult pathways | Public directory includes Florida locations such as Fort Lauderdale, Miramar, Boynton Beach, Tampa and Largo. Follow exact club tryout/evaluation announcements; never assume every team is recruiting. |
| [Soccer Shots Miami](https://www.soccershots.com/miami/) | Beginner and young-child programs | Official page advertised Winter 2027 registration and age-based program families. Check the exact session, venue, dates, cost and available places before creating a listing. Local age ranges can differ from national ranges. |
| [YMCA South Florida sports](https://ymcasouthflorida.org/sports/) | Accessible local programs | Official sports directory includes soccer. Confirm the selected family center, season, eligibility, fees and registration details. |
| [TeamWork soccer jobs](https://www.teamworkonline.com/soccer-jobs) | Club, league and soccer-organization employment | Existing automatic adapters cover three employers. Extend exact employer adapters with structured vacancy data, current application checks and permitted imagery. The broader board is not automatically approved. |
| [LinkedIn Florida soccer search](https://www.linkedin.com/jobs/search/?keywords=soccer&location=Florida) | Discover clubs, schools and employers | Public results loaded. Results also contained unrelated roles and older posts. Added a discovery-only search, with job-ID canonicalization and relevance filtering. Login-only results and inaccessible pages remain blocked. |
| [Indeed Florida soccer search](https://www.indeed.com/jobs?q=soccer&l=Florida) | Coaches, academy, operations and local roles | Public results loaded and contained repeated titles. Added discovery-only exact viewjob IDs. Follow an employer-owned vacancy/application page and deduplicate title, employer and job identity across boards. |
| [IMG Academy careers](https://www.imgacademy.com/about-img-academy/careers) | Academy, coaching and support roles | Official employer entry point loaded. Match a board lead to the exact current vacancy before publication. |
| [Orlando City careers](https://www.orlandocitysc.com/club/careers) / [Inter Miami careers](https://www.intermiamicf.com/club/careers) | Professional club roles | Official careers pages loaded. Search for Florida roles, internships and support jobs; source-check individual openings. |
| [United Soccer Coaches careers](https://unitedsoccercoaches.org/jobs/) | Coaching and school/college pathways | Official career center entry point loaded. National coverage needs a Florida/online relevance filter and an exact job check. |
| [Diocese of Saint Petersburg employment](https://www.dosp.org/humanresources/employment-opportunities/) | School/employer verification | Official employer directory loaded; useful for cross-checking school coaching leads. Eligibility and safeguarding requirements are employer-specific. |
| [GovernmentJobs search](https://www.governmentjobs.com/jobs?keyword=soccer&location=Florida) | Municipal recreation and sports roles | Public search loaded. Prefer the employing city's official vacancy/application route and assess permitted feed/API access before unattended reuse. |
| [JobsInSports](https://www.jobsinsports.com/) | Additional career leads | Public landing page loaded. Some services are membership-based; do not claim full accessible current vacancies from the landing page. |
| [Broward parks](https://www.broward.org/Parks) | Community and recreation discovery | The old sports URL redirected to a broad parks landing page. Follow a specific soccer program or municipal registration route. |

Blocked/incorrect entry points: USL League Two team directory returned a Cloudflare 403; FYSA `/club-directory/` returned 404, so use `/play/`; the U.S. Soccer Learning Center `/coach` returned 404 in this HTTP check, so the learning section uses the verified official coaching guidance page. Hudl Academy returned a JavaScript loading shell; it was not treated as a reviewed learning offering. No access restrictions were bypassed.

The source portfolio expands daily discovery from 16 configured URLs to 26, plus existing record-specific rechecks. New search leads are Pending review, not Active records. Current unattended publication still requires a supported organizer adapter. This research creates no promise of 50 new verified opportunities every day.

## Training & Learning section

Created `/training` with seven directly linked official resources: FIFA Training Centre, U.S. Soccer coaching guidance, United Soccer Coaches education, three Hudl Statsbomb courses (video analysis, introductory analytics, and scouting/recruitment), and NSCA strength-and-conditioning education. These are learning resources outside the Opportunities count. A catalog or resource page is not presented as an independently verified local enrollment opportunity.

Visitors can filter Player development, Coaching, Video & data analysis and Physical preparation, search, and reset an empty search. They follow official provider links for current pricing, requirements, access and full details. No copied course material, invented credentials, discounts, partnerships, or guaranteed outcomes. Cancha's colors and typography are preserved. Desktop uses two resource columns; mobile uses one for title readability.

Seven resource URLs passed live HTTP and title/domain identity checks. The weekly `learning-link-check.yml` workflow repeats those checks and fails when a link needs review. It does not verify course availability or automatically replace resources. Provider content and prices still need periodic editorial review.

## Next priorities

1. Review exact youth/recreational sessions from Soccer Shots, YMCA and city programs; add source-specific enrollment checks before expanding unattended publication.
2. Use FYSA and UPSL to find smaller local clubs, then capture their own current tryout/program evidence. Keep club profiles and recruiting opportunities conceptually separate.
3. Build additional employer adapters from exact verified careers pages; use LinkedIn/Indeed for discovery rather than treating their entire result set as verified openings.
4. Invite a small, relevant group of providers after Cancha has a few genuine public posts and a working intake form. See the outreach draft; no messages have been sent.

## Implementation evidence

Training & Learning was published to production at `/training`. Live browser checks passed at 1440px and 390px: seven cards, three analysis-filter results, NSCA search, empty results/reset, correct outbound link behavior, and no horizontal overflow. Editor and live previews are saved in `previews/training/`. All seven official learning URLs passed HTTP/title/domain identity checks; these are link checks, not enrollment checks.

Discovery-only parsing of the inspected public search pages found 16 distinct relevant LinkedIn URLs and one Indeed viewjob URL. These 17 leads are not verified vacancies, and duplicate roles can still exist across platforms. New sources are configured for future daily runs; no new board vacancy was automatically published in this research task. All 58 repository tests passed, including exact job-ID/tracking handling and exclusion of unrelated or cross-domain board links.
