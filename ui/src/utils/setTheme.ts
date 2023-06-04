import THEMES from "constants/THEMES";
import Cookies from "js-cookie";

export const setTheme = (mode: string) => {
  Cookies.set("lightMode", mode);
  window.location.reload();
};
export const getTheme = () => Cookies.get("lightMode") || "light";

export const applyTheme = () => {
  let mode = getTheme();
  let theme: any = (THEMES() as any)[mode];
  if (!theme || typeof theme !== "object") return;
  Object.keys(theme).forEach((key) => {
    const cssKey = `--${key}`;
    const cssValue = theme[key];
    document.body.style.setProperty(cssKey, cssValue);
  });
};
