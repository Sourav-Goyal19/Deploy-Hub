import { clsx, type ClassValue } from "clsx";
import { CookieValueTypes, deleteCookie, setCookie } from "cookies-next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setCookies(
  access: string | CookieValueTypes,
  refresh: string | CookieValueTypes
) {
  setCookie("access_token", access);
  setCookie("refresh_token", refresh);
  setCookie("system-login", false);
}

export function deleteCookies() {
  deleteCookie("access_token");
  deleteCookie("refresh_token");
  deleteCookie("system-login");
}
