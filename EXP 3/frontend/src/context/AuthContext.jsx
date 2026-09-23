import {
  createContext,
  useContext,
  useState,
} from "react";

import {
  decodeMockToken,
} from "../utils/mockJwt";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {

    const savedToken =
      localStorage.getItem("token");

    if (!savedToken) {
      return null;
    }

    return decodeMockToken(savedToken);
  });


  const login = (newToken) => {

    const decodedUser =
      decodeMockToken(newToken);

    localStorage.setItem(
      "token",
      newToken
    );

    setToken(newToken);
    setUser(decodedUser);
  };


  const logout = () => {

    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };


  const isAuthenticated =
    Boolean(token && user);


  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};