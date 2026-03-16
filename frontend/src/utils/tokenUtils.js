// Token expiration time in milliseconds (2 minutes - matching backend)
const TOKEN_EXPIRATION_TIME = 2 * 60 * 1000;

export const isTokenExpired = () => {
  const expirationTime = localStorage.getItem("TokenExpiration");
  
  if (!expirationTime) {
    return true; // No expiration time stored, consider it expired
  }
  
  const currentTime = new Date().getTime();
  return currentTime > parseInt(expirationTime);
};

export const saveTokenWithExpiration = (token, userId) => {
  const expirationTime = new Date().getTime() + TOKEN_EXPIRATION_TIME;
  localStorage.setItem("Token", token);
  localStorage.setItem("UserId", userId);
  localStorage.setItem("TokenExpiration", expirationTime.toString());
};

export const clearAuthData = () => {
  localStorage.removeItem("Token");
  localStorage.removeItem("UserId");
  localStorage.removeItem("TokenExpiration");
};

export const getAuthToken = () => {
  if (isTokenExpired()) {
    clearAuthData();
    return null;
  }
  return localStorage.getItem("Token");
};
