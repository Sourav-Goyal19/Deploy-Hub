import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setCookies(access: string, refresh: string) {
  Cookies.set("access_token", access);
  Cookies.set("refresh_token", refresh);
  Cookies.set("system-login", "false");
}

export function deleteCookies() {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  Cookies.remove("system-login");
}
