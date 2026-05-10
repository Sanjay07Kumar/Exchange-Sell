const TOKEN_STORAGE_KEY = "Token";
const USER_ID_KEY = "UserId";
const LEGACY_EXPIRATION_KEY = "TokenExpiration";

const addBase64Padding = (base64) => {
  const padLength = 4 - (base64.length % 4);
  return padLength === 4 ? base64 : base64 + "=".repeat(padLength);
};

const parseJwtPayload = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = addBase64Padding(base64Url.replace(/-/g, "+").replace(/_/g, "/"));
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const getTokenExpiration = (token) => {
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  let exp = payload.exp;
  if (typeof exp === "string" && /^\d+$/.test(exp)) {
    exp = parseInt(exp, 10);
  }

  if (typeof exp !== "number") return null;
  return exp * 1000;
};

export const isTokenExpired = () => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return true;

  const expirationTime = getTokenExpiration(token);
  if (expirationTime === null) return false;

  return Date.now() > expirationTime;
};

export const saveAuthToken = (token, userId) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.removeItem(LEGACY_EXPIRATION_KEY);
  if (userId !== undefined && userId !== null) {
    localStorage.setItem(USER_ID_KEY, userId);
  }
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(LEGACY_EXPIRATION_KEY);
};

export const getAuthToken = () => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) {
    return null;
  }

  const expirationTime = getTokenExpiration(token);
  if (expirationTime === null) {
    // If the JWT payload cannot be parsed, keep the token for now and rely on the backend to reject it if invalid.
    return token;
  }

  if (Date.now() > expirationTime) {
    clearAuthData();
    return null;
  }

  return token;
};
