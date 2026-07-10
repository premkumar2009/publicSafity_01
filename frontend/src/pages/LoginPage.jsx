import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup } from "../utils/api";
import { saveAuth } from "../utils/auth";

const initialSignupState = {
  name: "",
  email: "",
  phone: "",
  badgeNumber: "",
  password: "",
  accessCode: ""
};

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [loginState, setLoginState] = useState({ email: "", password: "" });
  const [signupState, setSignupState] = useState(initialSignupState);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await login(loginState);
      saveAuth(response);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await signup(signupState);
      alert("Police officer account created. Please login.");
      setMode("login");
      setSignupState(initialSignupState);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page centered-page">
      <div className="hero-card auth-card">
        <div className="hero-copy">
          <span className="eyebrow">Police only access</span>
          <h1>Public Safety Alert System</h1>
          <p>
            Officers can create image-based alerts with a fixed notification radius.
            Citizens do not log in and no public personal details are stored.
          </p>
          <a className="secondary-button inline-link" href="/public">Open public alerts</a>
          <div className="demo-box">
            <strong>Default officer login</strong>
            <span>Email: officer@police.local</span>
            <span>Password: Police@123</span>
          </div>
        </div>

        <div className="panel auth-panel">
          <div className="tab-switcher">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
            >
              Police Signup
            </button>
          </div>

          {mode === "login" ? (
            <form className="form-grid" onSubmit={handleLogin}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={loginState.email}
                  onChange={(event) => setLoginState({ ...loginState, email: event.target.value })}
                  required
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={loginState.password}
                  onChange={(event) => setLoginState({ ...loginState, password: event.target.value })}
                  required
                />
              </label>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Signing in..." : "Login as police officer"}
              </button>
            </form>
          ) : (
            <form className="form-grid" onSubmit={handleSignup}>
              <label><span>Name</span><input value={signupState.name} onChange={(event) => setSignupState({ ...signupState, name: event.target.value })} required /></label>
              <label><span>Email</span><input type="email" value={signupState.email} onChange={(event) => setSignupState({ ...signupState, email: event.target.value })} required /></label>
              <label><span>Phone</span><input inputMode="numeric" maxLength={15} value={signupState.phone} onChange={(event) => setSignupState({ ...signupState, phone: event.target.value.replace(/\D/g, "") })} required /></label>
              <label><span>Badge number</span><input value={signupState.badgeNumber} onChange={(event) => setSignupState({ ...signupState, badgeNumber: event.target.value })} required /></label>
              <label><span>Password</span><input type="password" value={signupState.password} onChange={(event) => setSignupState({ ...signupState, password: event.target.value })} required /></label>
              <label><span>Police access code</span><input value={signupState.accessCode} onChange={(event) => setSignupState({ ...signupState, accessCode: event.target.value })} required /></label>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Creating account..." : "Create officer account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
