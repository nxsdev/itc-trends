import { withTV } from "tailwind-variants/transformer"
import type { Config } from "tailwindcss"
import defaultTheme, { fontFamily } from "tailwindcss/defaultTheme"

const config = {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    data: {
      mobile: 'mobile~="true"',
    },
    screens: {
      xs: "475px",
      ...defaultTheme.screens,
    },
    extend: {
      fontFamily: {
        sans: [
          "Helvetica Neue",
          "Arial",
          "Hiragino Kaku Gothic ProN",
          "Hiragino Sans",
          // "Yu Gothic UI",
          "BIZ UDPGothic",
          "Meiryo",
          ...fontFamily.sans,
        ],
      },
      colors: {
        border: {
          DEFAULT: "hsl(var(--border-default))",
          stronger: "hsl(var(--border-stronger))",
          strong: "hsl(var(--border-strong))",
          alternative: "hsl(var(--border-alternative))",
          control: "hsl(var(--border-control))",
          overlay: "hsl(var(--border-overlay))",
          secondary: "hsl(var(--border-secondary))",
          muted: "hsl(var(--border-muted))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background-default))",
          200: "hsl(var(--background-200))",
          control: "hsl(var(--background-control))",
          selection: "hsl(var(--background-selection))",
          alternative: "hsl(var(--background-alternative-default))",
          dialog: "hsl(var(--background-dialog-default))",
          muted: "hsl(var(--background-muted))",
          dash: {
            canvas: "hsl(var(--background-dash-canvas))",
            sidebar: "hsl(var(--background-dash-sidebar))",
          },
        },
        overlay: {
          DEFAULT: "hsl(var(--background-overlay-default))",
          hover: "hsl(var(--background-overlay-hover))",
        },
        surface: {
          DEFAULT: "hsl(var(--background-surface-default))",
          400: "hsl(var(--background-surface-400))",
          300: "hsl(var(--background-surface-300))",
          200: "hsl(var(--background-surface-200))",
          100: "hsl(var(--background-surface-100))",
          75: "hsl(var(--background-surface-75))",
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground-default))",
          contrast: "hsl(var(--foreground-contrast))",
          muted: "hsl(var(--foreground-muted))",
          lighter: "hsl(var(--foreground-lighter))",
          light: "hsl(var(--foreground-light))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand-default))",
          foreground: "hsl(var(--foreground-default))",
          600: "hsl(var(--brand-600))",
          500: "hsl(var(--brand-500))",
          400: "hsl(var(--brand-400))",
          300: "hsl(var(--brand-300))",
          200: "hsl(var(--brand-200))",
          link: "hsl(var(--brand-link))",
          button: "hsl(var(--brand-button))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary-default))",
          foreground: "hsl(var(--foreground-default))",
          400: "hsl(var(--secondary-400))",
          200: "hsl(var(--secondary-200))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive-default))",
          foreground: "hsl(var(--foreground-default))",
          200: "hsl(var(--destructive-200))",
          300: "hsl(var(--destructive-300))",
          400: "hsl(var(--destructive-400))",
          500: "hsl(var(--destructive-500))",
          600: "hsl(var(--destructive-600))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning-default))",
          600: "hsl(var(--warning-600))",
          500: "hsl(var(--warning-500))",
          400: "hsl(var(--warning-400))",
          300: "hsl(var(--warning-300))",
          200: "hsl(var(--warning-200))",
        },
      },
      typography: ({ theme }) => ({
        // Removal of backticks in code blocks for tailwind v3.0
        // https://github.com/tailwindlabs/tailwindcss-typography/issues/135
        DEFAULT: {
          css: {
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            "--tw-prose-body": "hsl(var(--foreground-light))",
            "--tw-prose-headings": "hsl(var(--foreground-default))",
            "--tw-prose-lead": "hsl(var(--foreground-light))",
            "--tw-prose-links": "hsl(var(--foreground-light))",
            "--tw-prose-bold": "hsl(var(--foreground-light))",
            "--tw-prose-counters": "hsl(var(--foreground-light))",
            "--tw-prose-bullets": "hsl(var(--foreground-muted))",
            "--tw-prose-hr": "hsl(var(--background-surface-300))",
            "--tw-prose-quotes": "hsl(var(--foreground-light))",
            "--tw-prose-quote-borders": "hsl(var(--background-surface-300))",
            "--tw-prose-captions": "hsl(var(--border-strong))",
            "--tw-prose-code": "hsl(var(--foreground-default))",
            "--tw-prose-pre-code": "hsl(var(--foreground-muted))",
            "--tw-prose-pre-bg": "hsl(var(--background-surface-200))",
            "--tw-prose-th-borders": "hsl(var(--background-surface-300))",
            "--tw-prose-td-borders": "hsl(var(--background-default))",
            "--tw-prose-invert-body": "hsl(var(--background-default))",
            "--tw-prose-invert-headings": theme("colors.white"),
            "--tw-prose-invert-lead": "hsl(var(--background-surface-300))",
            "--tw-prose-invert-links": theme("colors.white"),
            "--tw-prose-invert-bold": theme("colors.white"),
            "--tw-prose-invert-counters": "hsl(var(--background-surface-200))",
            "--tw-prose-invert-bullets": "hsl(var(--background-selection))",
            "--tw-prose-invert-hr": "hsl(var(--border-strong))",
            "--tw-prose-invert-quotes": "hsl(var(--background-alternative-default))",
            "--tw-prose-invert-quote-borders": "hsl(var(--border-strong))",
            "--tw-prose-invert-captions": "hsl(var(--background-surface-200))",
            // the following are typography overrides
            // examples can be seen here —> https://github.com/tailwindlabs/tailwindcss-typography/blob/master/src/styles.js
            // reset all header font weights
            h4: {
              // override font size
              fontSize: "1.15em",
            },
            h5: {
              // h5 not included in --tw-prose-headings
              color: theme("colors.scale[1200]"),
            },
            "h1, h2, h3, h4, h5, h6": {
              fontWeight: "400",
            },
            "article h2, article h3, article h4, article h5, article h6": {
              marginTop: "2em",
              marginBottom: "1em",
            },
            p: {
              fontWeight: "400",
            },
            pre: {
              background: "none",
              padding: 0,
              marginBottom: "32px",
            },
            ul: {
              listStyleType: "none",
              paddingLeft: "1rem",
            },
            "ul li": {
              position: "relative",
            },
            "ul li::before": {
              position: "absolute",
              top: "0.75rem",
              left: "-1rem",
              height: "0.125rem",
              width: "0.5rem",
              borderRadius: "0.25rem",
              backgroundColor: "hsl(var(--border-strong))",
              content: '""',
            },
            ol: {
              paddingLeft: "1rem",
              counterReset: "item",
              listStyleType: "none",
              marginBottom: "3rem",
            },
            "ol>li": {
              display: "block",
              position: "relative",
              paddingLeft: "1rem",
            },
            "ol>li::before": {
              position: "absolute",
              top: "0.25rem",
              left: "-1rem",
              height: "1.2rem",
              width: "1.2rem",
              borderRadius: "0.25rem",
              backgroundColor: "hsl(var(--background-surface-100))",
              border: "1px solid hsl(var(--border-default))",
              content: 'counter(item) "  "',
              counterIncrement: "item",
              fontSize: "12px",
              color: "hsl(var(--foreground-muted))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },

            "p img": {
              border: "1px solid hsl(var(--border-muted))",
              borderRadius: "4px",
              overflow: "hidden",
            },
            iframe: {
              border: "1px solid " + theme("borderColor.DEFAULT"),
              borderRadius: theme("borderRadius.lg"),
            },
            td: {
              borderBottom: "1px solid " + "hsl(var(--background-surface-200))",
            },
            code: {
              fontWeight: "400",
              padding: "0.2rem 0.4rem",
              backgroundColor: "hsl(var(--background-surface-200))",
              border: "1px solid " + "hsl(var(--background-surface-300))",
              borderRadius: theme("borderRadius.lg"),
              // wordBreak: 'break-all',
            },
            a: {
              position: "relative",
              transition: "all 0.18s ease",
              paddingBottom: "2px",
              fontWeight: "400",
              opacity: 1,
              color: "hsl(var(--foreground-default))",
              textDecorationLine: "underline",
              textDecorationColor: "hsl(var(--foreground-muted))",
              textDecorationThickness: "1px",
              textUnderlineOffset: "2px",
            },
            "a:hover": {
              textDecorationColor: "hsl(var(--foreground-default))",
            },
            figcaption: {
              color: "hsl(var(--foreground-muted))",
              fontFamily: "Office Code Pro, monospace",
            },
            "figure.quote-figure p:first-child": {
              marginTop: "0 !important",
            },
            "figure.quote-figure p:last-child": {
              marginBottom: "0 !important",
            },
            figure: {
              margin: "3rem 0",
            },
            "figure img": {
              margin: "0 !important",
            },
          },
        },

        toc: {
          css: {
            ul: {
              "list-style-type": "none",
              "padding-left": 0,
              margin: 0,
              li: {
                "padding-left": 0,
              },
              a: {
                display: "block",
                marginBottom: "0.4rem",
                "text-decoration": "none",
                fontSize: "0.8rem",
                fontWeight: "200",
                color: "hsl(var(--foreground-light))",
                "&:hover": {
                  color: "hsl(var(--foreground-default))",
                },
                "font-weight": "400",
              },
              // margin: 0,
              ul: {
                "list-style-type": "none",
                li: {
                  marginTop: "0.2rem",
                  marginBottom: "0.2rem",
                  "padding-left": "0 !important",
                  "margin-left": "0.5rem",
                },
                a: {
                  fontWeight: "200",
                  color: "hsl(var(--foreground-lighter))",
                  "&:hover": {
                    color: "hsl(var(--foreground-default))",
                  },
                },
              },
            },
          },
        },
        // used in auto docs
        docs: {
          css: {
            "--tw-prose-body": "hsl(var(--foreground-light))",
            "--tw-prose-headings": "hsl(var(--foreground-default))",
            "--tw-prose-lead": "hsl(var(--foreground-light))",
            "--tw-prose-links": "hsl(var(--brand-500))",
            "--tw-prose-bold": "hsl(var(--foreground-light))",
            "--tw-prose-counters": "hsl(var(--foreground-light))",
            "--tw-prose-bullets": "hsl(var(--foreground-muted))",
            "--tw-prose-hr": "hsl(var(--background-surface-300))",
            "--tw-prose-quotes": "hsl(var(--foreground-light))",
            "--tw-prose-quote-borders": "hsl(var(--background-surface-300))",
            "--tw-prose-captions": "hsl(var(--border-strong))",
            "--tw-prose-code": "hsl(var(--foreground-default))",
            "--tw-prose-pre-code": "hsl(var(--foreground-muted))",
            "--tw-prose-pre-bg": "hsl(var(--background-surface-200))",
            "--tw-prose-th-borders": "hsl(var(--background-surface-300))",
            "--tw-prose-td-borders": "hsl(var(--background-default))",
            "--tw-prose-invert-body": "hsl(var(--background-default))",
            "--tw-prose-invert-headings": theme("colors.white"),
            "--tw-prose-invert-lead": "hsl(var(--background-surface-300))",
            "--tw-prose-invert-links": theme("colors.white"),
            "--tw-prose-invert-bold": theme("colors.white"),
            "--tw-prose-invert-counters": "hsl(var(--background-surface-200))",
            "--tw-prose-invert-bullets": "hsl(var(--background-selection))",
            "--tw-prose-invert-hr": "hsl(var(--border-strong))",
            "--tw-prose-invert-quotes": "hsl(var(--background-alternative-default))",
            "--tw-prose-invert-quote-borders": "hsl(var(--border-strong))",
            "--tw-prose-invert-captions": "hsl(var(--background-surface-200))",
            // the following are typography overrides
            // examples can be seen here —> https://github.com/tailwindlabs/tailwindcss-typography/blob/master/src/styles.js
            // reset all header font weights
            "h1, h2, h3, h4, h5": {
              fontWeight: "400",
            },
          },
        },
      }),
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwindcss-react-aria-components"),
    require("@tailwindcss/typography"),
  ],
  safelist: [
    {
      pattern: /(bg|text|border)-(up|down|flat|mint|rose)-(100|200|300|400|500|600|700|800|900)/,
    },
  ],
} satisfies Config

export default withTV(config)
