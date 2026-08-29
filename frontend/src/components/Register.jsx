import { useState } from "react";

function Register({ onRegister, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    setMessage("Creating your account...");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Registration failed"
        );
        return;
      }

      setMessage("Registration successful! 🎉");

      setTimeout(() => {
        onRegister();
      }, 1000);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setMessage(
        "Cannot connect to server"
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          🛒 ShopSmart
        </div>

        <p className="small-label">
          GET STARTED ✨
        </p>

        <h1>
          Create your account.
        </h1>

        <p className="login-description">
          Start creating smarter shopping lists today.
        </p>

        <form onSubmit={handleRegister}>

          <label>Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          <button
            type="submit"
            className="login-submit"
          >
            Create Account →
          </button>

        </form>

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to Home
        </button>

      </div>

    </div>
  );
}

export default Register;