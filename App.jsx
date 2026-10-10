
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/auth";

function App() {
  const [page, setPage] = useState("signup");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);

  // Restore the user's session after refreshing the page.
  useEffect(() => {
    const savedToken = localStorage.getItem("task4_token");

    if (!savedToken) return;

    async function restoreProfile() {
      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Please sign in again.");
        }

        setUser(data.user);
        setPage("profile");
      } catch {
        localStorage.removeItem("task4_token");
        setPage("login");
      }
    }

    restoreProfile();
  }, []);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const isSignup = page === "signup";

    try {
      const response = await fetch(
        `${API_URL}/${isSignup ? "signup" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isSignup
              ? formData
              : {
                  email: formData.email,
                  password: formData.password,
                }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      // Successful signup: move to the login page.
      if (isSignup) {
        setMessage(data.message || "Signup successful!");
        setMessageType("success");
        setFormData((previous) => ({
          ...previous,
          password: "",
        }));
        setPage("login");
        return;
      }

      // Save the JWT returned by the login API.
      if (!data.token) {
        throw new Error("Login response did not contain a token.");
      }

      localStorage.setItem("task4_token", data.token);

      // Use the token to request the protected profile.
      const profileResponse = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        localStorage.removeItem("task4_token");
        throw new Error(
          profileData.message || "Could not load your profile."
        );
      }

      setUser(profileData.user);
      setPage("profile");
      setMessage(profileData.message || "Login successful!");
      setMessageType("success");

      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setMessage(
        error.message ||
          "Could not connect to the server. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function switchPage(nextPage) {
    setPage(nextPage);
    setMessage("");
    setFormData((previous) => ({
      ...previous,
      password: "",
    }));
  }

  function handleLogout() {
    localStorage.removeItem("task4_token");
    setUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
    });
    setMessage("You have been signed out.");
    setMessageType("success");
    setPage("login");
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <span className="brand-icon">✦</span>
          AuthFlow
        </div>

        <span className="nav-label">MERN Authentication</span>
      </nav>

      <main className="main">
        <section className="welcome">
          <span className="eyebrow">
            SECURE · SIMPLE · RELIABLE
          </span>

          <h1>
            Your account,
            <br />
            your <span>space.</span>
          </h1>

          <p>
            A secure authentication experience built with React,
            Express, MongoDB and JSON Web Tokens.
          </p>

          <div className="feature">
            <span>✓</span>
            <div>
              <strong>Secure authentication</strong>
              <p>Protected access using JWT tokens.</p>
            </div>
          </div>

          <div className="feature">
            <span>✓</span>
            <div>
              <strong>Your data, organized</strong>
              <p>User details stored in MongoDB.</p>
            </div>
          </div>

          <div className="tech">
            REACT · NODE.JS · EXPRESS · MONGODB
          </div>
        </section>

        <section className="auth-card">
          <div className="card-symbol">✧</div>

          <h2>
            {page === "signup"
              ? "Create your account"
              : page === "login"
                ? "Welcome back"
                : "Your profile"}
          </h2>

          <p className="subtitle">
            {page === "signup"
              ? "Join us by creating a new account."
              : page === "login"
                ? "Enter your details to sign in."
                : "Your authenticated account information."}
          </p>

          {message && (
            <div
              className={`message ${messageType}`}
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          {page === "profile" ? (
            <div className="profile-preview">
              <div className="avatar">
                {user?.name?.trim()?.charAt(0).toUpperCase() || "U"}
              </div>

              <h3>{user?.name || "User"}</h3>
              <p>{user?.email || "No email available"}</p>

              <div className="profile-info">
                <span>Account status</span>
                <strong>Authenticated</strong>
              </div>

              <button
                className="primary"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {page === "signup" && (
                <label>
                  Full name
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                  autoComplete={
                    page === "signup"
                      ? "new-password"
                      : "current-password"
                  }
                />
              </label>

              <button
                className="primary"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : page === "signup"
                    ? "Create account →"
                    : "Sign in →"}
              </button>
            </form>
          )}

          {page !== "profile" && (
            <p className="switch">
              {page === "signup"
                ? "Already have an account?"
                : "Don't have an account?"}
              {" "}
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  switchPage(
                    page === "signup" ? "login" : "signup"
                  )
                }
              >
                {page === "signup" ? "Sign in" : "Sign up"}
              </button>
            </p>
          )}

          <div className="card-footer">
            Protected by JWT authentication
          </div>
        </section>
      </main>

      <footer>
        © 2026 AuthFlow · MERN Stack Internship Task 4
      </footer>
    </div>
  );
}

export default App;