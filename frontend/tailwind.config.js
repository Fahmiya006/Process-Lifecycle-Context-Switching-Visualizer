/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        state: {
          new: "#94a3b8",
          ready: "#38bdf8",
          running: "#22c55e",
          waiting: "#f59e0b",
          terminated: "#64748b",
        },
      },
    },
  },
  plugins: [],
};
