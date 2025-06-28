import { getCookie, setCookie } from "./cookie.js";

export function CurrentTheme() {
    if(getCookie("theme") === "light") {
        return "light";
    } else {
        setCookie("theme", "dark");
        return "dark";
    }
}