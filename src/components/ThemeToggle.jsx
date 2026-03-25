import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark =
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setDark(isDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !dark;

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setDark(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="
      flex items-center justify-center
      w-9 h-9
      rounded-[50%]
      bg-zinc-800
      dark:bg-zinc-200
      text-white
      dark:text-black
      hover:scale-105
      transition cursor-pointer
      ">
     {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

