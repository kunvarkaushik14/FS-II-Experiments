import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { mockUsers } from "../data/mockData";
import { createMockToken } from "../utils/mockJwt";

function Login() {

  const navigate = useNavigate();

  const { login } = useAuth();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    setError("");

    const user = mockUsers.find(
      (item) =>
        item.username === username &&
        item.password === password
    );


    if (!user) {

      setError(
        "Invalid username or password."
      );

      return;
    }


    const token =
      createMockToken(user);


    login(token);

    navigate("/dashboard");
  };


  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          🔐
        </div>

        <div className="section-label">
          SECURE LOGIN
        </div>

        <h1>
          Welcome Back
        </h1>

        <p>
          Login to access SocialHub.
        </p>


        <form
          onSubmit={handleSubmit}
          className="login-form"
        >

          <div className="form-group">

            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              placeholder="Enter username"
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              placeholder="Enter password"
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>


          {error && (
            <div className="form-error">
              ⚠️ {error}
            </div>
          )}


          <button
            type="submit"
            className="publish-button"
          >
            Login →
          </button>

        </form>


        <div className="demo-accounts">

          <strong>
            Demo Accounts
          </strong>

          <p>
            Admin: admin / admin123
          </p>

          <p>
            Editor: editor / editor123
          </p>

          <p>
            Viewer: viewer / viewer123
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;