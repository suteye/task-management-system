task-manager-full/
├── 📄 package.json
├── ⚙️ next.config.mjs
├── 🎨 tailwind.config.js
├── 🛠️ postcss.config.js
├── 🔧 tsconfig.json
├── 🌐 .env.local.template
├── 📁 app/
│   ├── 📄 layout.tsx
│   ├── 📄 page.tsx
│   ├── 🎨 globals.css
│   ├── 📁 signin/
│   │   └── 📄 page.tsx
│   ├── 📁 dashboard/
│   │   └── 📄 page.tsx
│   └── 📁 api/
│       ├── 📁 auth/
│       │   └── 📁 [...nextauth]/
│       │       └── 📄 route.ts
│       ├── 📁 tasks/
│       │   └── 📄 route.ts
│       └── 📁 task-steps/
│           └── 📄 route.ts
├── 📁 components/
│   ├── 📁 providers/
│   │   └── 📄 SessionProvider.tsx
│   ├── 📁 task/
│   │   ├── 📄 TaskCard.tsx
│   │   ├── 📄 TaskList.tsx
│   │   ├── 📄 TaskBoard.tsx
│   │   ├── 📄 StepTimeline.tsx
│   │   └── 📄 Dashboard.tsx
│   └── 📁 ui/
│       ├── 📄 button.tsx
│       └── 📄 card.tsx
├── 📁 lib/
│   ├── 📄 utils.ts
│   ├── 📄 supabase.ts
│   └── 📄 auth.ts
├── 📁 stores/
│   └── 📄 taskStore.ts
├── 📁 types/
│   └── 📄 index.ts
├── 📁 constants/
│   └── 📄 workflow.ts
├── 📁 docs/
│   └── 📄 ERD.md
├── 📁 db/
│   └── 📄 rls.sql
└── 📄 README.md