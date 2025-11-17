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
> <div className="bg-green-1 text-white p-6">Primary coloured section</div>
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
