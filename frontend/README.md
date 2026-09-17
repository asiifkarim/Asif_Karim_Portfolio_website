# Portfolio Frontend

This folder contains the static portfolio site. The deployable files are in `src/`.

## Local Preview

```bash
cd src
python -m http.server 3000
```

Open <http://localhost:3000>.

## Vercel

Import the repository into Vercel, set the root directory to `frontend/src`, choose the `Other` framework preset, and use no build command. There are no environment variables or backend services.

Before deployment, replace the Formspree placeholder in `src/contact.html` with your Formspree form endpoint. Projects load directly from GitHub and skills are stored in `src/js/skills.js`.
