# SpaceMatch Frontend – Project Structure

This project uses [Vite ](https://vitejs.dev/) and [React](https://react.dev/) as part of a MERN stack. The folder structure is designed for modular and scalable development.

## Structure Overview

```
src/
  assets/        # Static assets (images, SVGs, etc.)
  components/    # Reusable UI components (buttons, inputs, etc.)
  features/      # Feature-based modules (each with its own components, hooks, services)
  hooks/         # Custom React hooks shared across features
  utils/         # Utility/helper functions
  App.jsx        # Main React component
  App.css        # App-specific styles
  main.jsx       # Entry point for React
  index.css      # Global styles
public/          # Static public files (served as-is)
```

### Feature Folders

Each feature in `src/features/` can have its own subfolders:
- `components/` – Feature-specific components
- `hooks/` – Feature-specific hooks
- `services/` – API calls or business logic for the feature
- `index.js` – Entry point for the feature

Example:
```
src/features/user/
  components/
    UserProfile.jsx
  hooks/
    useUser.js
  services/
    userService.js
  index.js
```

### Where to Add Code

- **Reusable UI:** Place in `src/components/`
- **Feature logic/UI:** Place in `src/features/[feature]/`
- **Custom hooks:** Place in `src/hooks/`
- **Helpers:** Place in `src/utils/`

## Scripts

See [`package.json`](Frontend/SpaceMatch/package.json) for available scripts:
- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run preview` – Preview production build
- `npm run lint` – Lint code

---

For more details, see the comments in each folder or file.

--- 

#GIT Workflow

# 1. Create and switch to a new branch
git checkout -b feature/space-form-component

# 2. Pull latest changes from remote main into your new branch
git pull origin main

# 3. Make your changes (edit files, add new components, etc.)
# ... work on your SpaceForm component ...

# 4. Stage your changes
git add .

# 5. Commit your changes
git commit -m "Add SpaceForm component with CRUD functionality"

# 6. Switch back to main branch
git checkout main

# 7. Pull latest changes from remote main (to make sure you're up to date)
git pull origin main

# 8. Switch back to your feature branch
git checkout feature/space-form-component

# 9. Merge main into your feature branch (to integrate any new changes)
git merge main

# 10. Push your updated feature branch to remote
git push origin feature/space-form-component

# 11. (Optional) Create a Pull Request on your Git platform
# Then after PR approval, merge to main via the platform