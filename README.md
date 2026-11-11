# Published TripFit UI kit

This branch contains only verified static site outputs. Edit the reusable kit on `high`, not these generated HTML files. Original `main` and `web/` are unchanged.

- Gallery: https://ray-math.github.io/tripfit/
- Examples: https://ray-math.github.io/tripfit/apps.html
- Cafe: https://ray-math.github.io/tripfit/cafe.html
- Event timetable: https://ray-math.github.io/tripfit/event.html
- Lesson: https://ray-math.github.io/tripfit/lesson.html

`deployment.json` identifies the verified source commit. Each `*-manifest.json` records its exact build inputs and output SHA-256. The live-site workflow checks HTML bytes, all route aliases, shared modules and provenance after deployment.
