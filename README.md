# Kenneth Sánchez — Engineering portfolio

Live website: https://kensave.github.io/

`portfolio-site.zip` contains the complete static portfolio source and assets: homepage, résumé and PDF, playable career world, and experimental MuJoCo biped lab. Extract it into a directory and serve over HTTP; no build step is required. Vendored libraries and human-motion references retain their licenses inside the archive.

The GitHub Pages workflow extracts this exact package, uploads it as the Pages artifact, and deploys it. Updating the archive on main publishes the next version. The career-world controller uses responsive game animation; the separate experimental biped playground uses real MuJoCo dynamics.
