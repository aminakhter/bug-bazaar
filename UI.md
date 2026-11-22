# UI & Styling Standards (Mandatory)

1. **Ant Design Only:** Use Ant Design (`antd`) components for all UI and layout. Do not use raw `div`, `span`, `button`, or `input` elements inside component `.tsx` files, and never use inline `style={{ ... }}` props.
2. **BEM SCSS Architecture:** Write styles using SCSS with BEM naming (`.block__element--modifier`). Avoid deep nesting (max 2 levels), duplicate properties, or overriding styles that Ant Design design tokens can express.
3. **Color Variables:** Never hardcode hex/rgb color values in component `.scss` or `.tsx` files. Define all colors in `src/styles/_variables.scss` (kept in sync with `src/theme/themeToken.ts`) and reference those variables.
4. **File Naming:** Every component with custom styles gets its own matching kebab-case SCSS file (e.g., `ProductCard.tsx` -> `product-card.scss`). Never use generic names like `style.scss`.
5. **Responsive Grid Only:** All page and section layouts must use Ant Design `<Row gutter={...}>` and `<Col>` exclusively. Every `<Col>` must specify `xs`, `sm`, `md`, `lg`, `xl`, and `xxl` props. Do not write custom media-query breakpoints unless a token or grid prop cannot achieve the layout.
6. **Theme Configuration:** Configure global and component tokens in `src/theme/themeToken.ts` and apply them via Ant Design `<ConfigProvider>` in `src/theme/themeConfig.ts` (wrapped in `src/main.tsx`).