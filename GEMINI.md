# Project Instructions: susu

## Architecture & Workflows

### Deployment & Hosting
- This project is hosted inside **neeshsamsi.com** at `/experiments/susu`.
- We use an **iframe-based integration** to keep the codebases separate.
- **Workflow:** To update the hosted version, use the deployment script:
  ```bash
  pnpm run deploy:nextjs
  ```
- Detailed documentation is available in [DEPLOYMENT.md](./DEPLOYMENT.md).

### Tech Stack
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS (v4)
- **Animations:** GSAP
- **Icons:** Lucide React
