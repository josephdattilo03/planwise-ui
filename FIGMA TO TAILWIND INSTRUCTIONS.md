> **How to use our design variables in the code**
>
> **1. Typography variables**
> In `globals.css` we’ve defined custom font-family, size, weight and letter-spacing variables, and also created utility classes like `.text-body`, `.text-page-title`, `.note-title`, etc.
> So when translating from Figma into code you can do:
>
> ```jsx
> <p className="text-body">
>   This is body text using the correct style.
> </p>
> <h1 className="text-page-title">
>   Page Title
> </h1>
> <a className="note-link">A link with note-style</a>
> ```
>
> You still add Tailwind utilities for spacing, colour, layout, like `mb-4`, `px-6`, `md:mt-8`, etc.
>
> **2. Colour & theme variables**
> Colours are defined as CSS variables in `globals.css`, e.g. `--Green-1`, `--task-status-to-do-button`, `--foreground`.
> To expose a colour as a Tailwind utility, we add it via `@theme inline` like this:
>
> ```css
> @theme inline {
>   --color-green-1: var(--Green-1);
> }
> ```
>
> After this you can use `bg-green-1`, `text-green-1`, `border-green-1` etc in your code. Bascially reference the color by the text after `--color` namespace.

> Example:
>
> ```jsx
> <div className="bg-green-1 text-foreground p-6">Primary coloured section</div>
> ```
>
> **3. React + Tailwind context**
> In our `layout.tsx` we register the Geist fonts:
>
> ```tsx
> <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
>   … your app …
> </body>
> ```
>
> Because of that, the typography classes like `.text-body`, `.note-title` etc already pull from the correct fonts (`Geist Sans` and `Geist Mono`).
>
> **4. Quick checklist when translating Figma → Code**
>
> - Check the Figma text style in the Typography section (e.g. “Text/Small Header”) → use `className="text-small-header"`.
> - For links or notes: use classes like `note-link`, `note-title`, `note-date`.
> - For colours: find the token in Figma (e.g. “Green-1”, “Background”) → match the CSS variable (e.g. `--color-green-1`, `--color-background`) → use the Tailwind utility (e.g. `bg-green-1`, `text-background`).
> - Add spacing, layout & responsive classes as usual (e.g. `mt-8`, `px-4`, `lg:flex`, etc). You can find this information using the dev mode in Figma to inspect any element.
>
> If you need a style that doesn’t already have a class, you can define new ones in `globals.css` by adding it to `:root`, then `@theme inline`. Just follow the existing format.

> Use the typography classes for consistency, use the colour utilities for theme colours, and mix in Tailwind spacing/layout utilities as you design the component.
>
> If you’re unsure which text-class or colour-class to use → check the Figma spec and ask.

> **5. Internationalization (i18n) – Adding Text to the Codebase**
>
> We use Next.js internationalization with JSON message files. All user-facing text should be externalized for translation support.
>
> **Step-by-step procedure:**
>
> **a) Add your text key to the messages file**
>
> - Navigate to `messages/en.json`
> - Add a new key-value pair with a descriptive key:
>
> ```json
> {
>   "homePage": {
>     "title": "Welcome to PlanWise",
>     "subtitle": "Organize your academic life"
>   },
>   "buttons": {
>     "save": "Save",
>     "cancel": "Cancel"
>   }
> }
> ```
>
> **b) Use the translation in your component**
>
> - Import the translation hook (exact import depends on your i18n setup):
>
> ```tsx
> import { useTranslations } from "next-intl";
>
> export default function HomePage() {
>   const t = useTranslations("homePage");
>
>   return (
>     <div>
>       <h1 className="text-page-title">{t("title")}</h1>
>       <p className="text-body">{t("subtitle")}</p>
>     </div>
>   );
> }
> ```
>
> **c) Naming conventions**
>
> - Use camelCase for keys
> - Group related strings under namespaces (e.g., `homePage`, `buttons`, `errors`)
> - Be descriptive: prefer `taskList.emptyState` over `text1`
>
> **d) For new locales**
>
> - Create a new file in `messages/` (e.g., `es.json` for Spanish)
> - Copy the structure from `en.json` and translate values
>
> **Never hardcode user-facing strings directly in components.** Always use the i18n system, even if you're only supporting English initially – it makes future translations much easier.
