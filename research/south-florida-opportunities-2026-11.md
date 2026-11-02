# South Florida opportunities: verified leads (checked Nov 2, 2026)

All three were checked on the organizer's own page. Re-check on the day they're applied; reviewed batches require same-day review.

| Opportunity | Where | Dates / times | Ages | Cost | Source |
|---|---|---|---|---|---|
| Twelfth Miami Thanksgiving Camp (shooting and finishing) | Indoors at Next Level Facility, 13450 SW 129th St, Miami (Kendall) 33186 | Mon–Wed Nov 23–25, 9 AM–3 PM | Coed, 3–13 | Organizer listed $199 early-bird until Oct 31; current price: confirm with organizer | https://www.twelfthmiami.com/campsclinics |
| Twelfth Miami Indoor Winter Soccer Camp | Same venue (Kendall) | Mon–Thu Dec 28–31, 9 AM–3 PM | Coed, 3–13 | Confirm with organizer | https://www.twelfthmiami.com/campsclinics |
| Next Level Thanksgiving Soccer & Speed Clinic | Next Level, 13450 SW 129th St, Miami (Kendall) | Nov 23–27; 5–9 at 9 AM, 10–12 at 12 PM, 13–17 at 3 PM | Boys and girls, 5–17 | Not listed; confirm with organizer | https://nextlevelfacility.com/ |

## Leads not used yet (not verifiable today)
- SoccerDays Thanksgiving Camp, Nov 23–25 (ages 4–12, $240 full / $90 selected days) at "Wilder Field 4". The site doesn't say which city, so the location must be confirmed first. https://soccerdays.com/
- Futbol Fever Thanksgiving Futbol Camp 2026 (Kendall indoor). The page blocks automated checks; verify in a browser. https://www.futbolfevermiami.com/thanksgiving-futbol-camp-2026
- Soccer 5 Academy Winter Camp (Dec–Jan, ages 7–15; Tropical Park, Kendall Soccer Park, Amelia Earhart Park). No 2026 dates listed yet. https://www.soccer5academy.com/
- Doral West Winter Camp. Mentioned on the site, but no dates are listed. https://doralwest.org/camps

## Next step
Generalize `scripts/apply-florida-reviewed-batch.mjs` (currently hard-wired to the Oct 19 batch) into a reusable reviewed-batch applier run from `site-update.yml`, with a self code review, since it writes to the CMS. Then apply these records.
