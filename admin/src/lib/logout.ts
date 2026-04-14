import {jwtDecode} from "jwt-decode";

export function isTokenValid(token: string) {
  try {
    const decoded: any = jwtDecode(token);

    if (!decoded?.exp) return false;

    return Date.now() < decoded.exp * 1000;
  } catch {
    return false;
  }
}