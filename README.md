# MandiSetu Users

Independent Next.js application. All components, styles, data, assets and configuration belong to this folder. No imports from another frontend.

```powershell
cd users
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:3000. Set the other frontend origins using `.env.local` (see `.env.example`) before building for deployment. This remains a design preview with local browser state; backend integration is pending. Different origins have separate preview state.
