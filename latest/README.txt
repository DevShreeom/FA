FACTORIAL ACADEMY — JEE MATHS TRACKER
=====================================

FACTORIAL ACADEMY TRACKER — version 4.1 (matte black theme, softer light theme, Inter typeface)

The headline change: lessons now play inside the tracker. You no longer
lose your place by jumping out to another tab, and the things that used
to need setting up — video lengths, resume points, ticking a lesson off
once you have actually watched it — now happen on their own.


WHAT'S IN THIS FOLDER
  index.html            The whole site. One file, no build step.
  manifest.webmanifest  App install details + home-screen shortcuts.
  sw.js                 Offline service worker.
  icons/                App icons.
  fonts/                Inter typeface (SIL OFL) and its licence. Keep with index.html.
  robots.txt            Search-engine rules.
  sitemap.xml           Sitemap template.
  humans.txt            The people behind it. Linked from the footer.
  CREDITS.md            Full credits and licences. Keep this with the code.
  og-image.png          The link-preview image. Keep it next to index.html.
  404.html              Shown by most static hosts for a missing address.
  offline.html          Shown when nothing has been saved for offline use yet.


HOW TO PUT IT ONLINE
  Upload every file, keeping the folder structure, to any static host:
  GitHub Pages, Netlify, Cloudflare Pages, Vercel or normal web hosting.
  It must be served over https:// for install, offline mode and
  notifications to work.

  After hosting:
   1. Open robots.txt and sitemap.xml and replace YOUR-DOMAIN with your
      real address. Uncomment the Sitemap line in robots.txt.
   2. Bump VERSION in sw.js (it is on v10 now) whenever you change
      index.html, so visitors get the new version instead of the
      cached one.

  IMPORTANT, AND NEW IN 4.0
  The built-in player needs a real web address. YouTube refuses to play
  inside a page opened straight from a folder (a file:// address), so if
  you double-click index.html on your own computer the player will say
  so and offer to open the lesson on YouTube instead. Everything else —
  ticks, notes, progress, reports — works fine that way. Put the site on
  a host, or run `python -m http.server` in this folder and visit
  http://localhost:8000, and the player works.


THE PLAYER  (new in 4.0)  <-- the main event
  Click any thumbnail or title and the lesson opens in the tracker, with
  the rest of the chapter queued beside it.

  Controls      Drag the bar to scrub, with the time under your cursor.
                Play, skip back and forward, volume, speed, subtitles,
                full screen, previous and next lesson.
  Mini player   Press i, or the shrink button, and the lesson carries on
                in the bottom corner while you browse the chapters.
                Closing the big player does this by default; turn that
                off in Settings if you would rather it stopped.
  Up next       The chapter's remaining lessons sit on the right. Tap any
                one to switch. "Only unwatched" hides the ones you have
                already done.
  Notes         Write while the lesson runs. Press "Insert timestamp" to
                drop the current time in. Any timestamp in a note becomes
                a button that jumps straight there.

  KEYS WHILE A LESSON IS PLAYING
    Space / k   play or pause          f   full screen
    j / l       back / forward 10s     m   mute
    ← / →       back / forward 5s      c   subtitles
    ↑ / ↓       volume                 w   tick this lesson off
    0–9         jump to that tenth     i   mini player
    n / p       next / previous        , / .   slower / faster
    Esc         close, or shrink if it is still playing


WHAT HAPPENS BY ITSELF NOW
  Lengths           Every lesson you open records its own length. The
                    "time left" and "finish by" figures fill themselves
                    in as you work through the course. The old yt-dlp
                    script still exists under Settings → Video lengths if
                    you would rather do the lot in one go, but you no
                    longer need it.
  Resume            Stop part-way and it picks up there next time, with
                    a "Start over" option in the message. The thumbnail
                    shows a yellow line for how far you got.
  Ticking off       A lesson marks itself watched at 92% — early enough
                    that the outro doesn't matter. Change the threshold,
                    or switch it off, in Settings → Player.
  The next lesson   Plays automatically after a short countdown you can
                    cancel. It can carry on into the next chapter too.
  Finished chapters Fold themselves away, if you turn that on.
  Backups           A reminder on the schedule you choose, since progress
                    lives in this browser only.
  New uploads       The watcher from 3.2 is unchanged and still running.


TWO THEMES, DARK FIRST
  There are now two themes rather than four: dark and light. Dark is what
  you get on a first visit, and the choice is remembered. Press d to
  switch, or use Settings → Look. The old "auto" and "black" options are
  gone — auto made the site look different depending on a setting most
  people never think about, and black was a near-duplicate of dark.


SETTINGS WORTH KNOWING
  Look        Theme, calmer motion, progress on thumbnails, accent
              colour, density, text size, hide watched.
  Player      Where lessons play, speed, auto-tick threshold, resume,
              autoplay and its countdown, carry on into the next chapter,
              keep playing in the corner, pause on tab switch, subtitles,
              player size, learn lengths, privacy-friendly embeds
              (youtube-nocookie.com), clear resume points.
  Behaviour   Fold away finished chapters, backup reminders.
  Plus the study goals, revision gaps, YouTube sync, sharing and data
  sections from 3.2, unchanged.


ADDING YOUR SOCIAL LINKS
  All social links live in ONE place. Open index.html, search for:

        const SITE=Object.freeze({

  Paste a full link between the quotes and that brand card appears
  instantly, with its real logo and brand colour, in three places: the
  Connect section, the Get in touch box, and the footer. Leave a link
  empty ('') and that card simply stays hidden.

        whatsapp:'https://chat.whatsapp.com/XXXXXXXXXXXX',
        instagram:'https://instagram.com/factorialacademy',
        x:'https://x.com/factorialacad',
        facebook:'https://facebook.com/factorialacademy',


COMMAND PALETTE
  Press Ctrl+K (Cmd+K on Mac), or click "Jump to" in the top bar. Type a
  chapter name, part of a video title, or an action like "focus",
  "backup", "mini" or "dark". The search is fuzzy, so "pnc" finds
  Permutation & Combination. New in 4.0: "Play where I left off" and
  "Mini player".


THE WATCHER  (unchanged from 3.2)
  Settings → Sync with YouTube. Once a key is in, the tracker checks the
  channel on open, when you come back to the tab, when the connection
  returns, and on a timer you choose. New videos are filed into their
  suggested chapter and marked New; Shorts and live streams are kept out
  unless you want them. Free quota is 10,000 units a day and a check
  costs about 3.

  A web page can only look while it is open. Nothing is fetched when the
  tab is closed.


PROGRESS REPORT AND SHARE CARDS
  Open it from Report in the header, the sidebar, the footer, or press p.
  Four share-card shapes (wide, square, story, poster) and a printable
  one-page report, both carrying your name if you put it in the box.


REPORTING A BUG
  Footer → Report a bug, or press Ctrl+K and type "bug". It goes to the
  developer, suryanshgnc@gmail.com, not the academy address. Leave
  "Attach technical details" ticked and it includes the version, browser,
  screen size, display settings and the last few watcher checks. It never
  attaches your progress, notes, name or API key.


UPGRADING FROM 3.2
  Nothing to do. Progress, notes, stars, custom chapters and sync
  settings all carry over untouched. Two things change on first open:
  the theme becomes dark (light is one press of d away), and lessons
  start playing in the page rather than on YouTube. If you preferred the
  old behaviour, Settings → Player → Where lessons play → On YouTube.


CREDITS
  Lessons and teaching        Factorial Academy
  Design and engineering      suryansh1807
  Typefaces                   Inter (self-hosted in fonts/)
                              (SIL Open Font Licence 1.1)
  Brand marks                 Simple Icons (CC0 1.0); the marks stay
                              trademarks of their owners
  Video hosting and playback  YouTube / Google LLC, YouTube Data API v3
                              and the YouTube IFrame Player API

  The full version lives in CREDITS.md, in the Credits & licences
  section of the site, and in humans.txt. If you pass this on, keep all
  three intact and don't present it as an official Factorial Academy
  product.

  Not affiliated with, endorsed by or operated by Google LLC, YouTube,
  Telegram, Meta or X Corp.


Built with care for JEE aspirants.
