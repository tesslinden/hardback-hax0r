import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import config from "../config";

const LoginStatus: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const navigate = useNavigate();

  async function handleGoogleLoginSuccess(credentialResponse: any) {
    try {
      const response = await fetch(`${config.apiUrl}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (!response.ok) {
        throw new Error("Authentication failed: " + response.statusText);
      }

      const userData = await response.json();
      login(userData);
    } catch (error) {
      console.error("Login error:", error);
    }
  }

  const userFirstName = user?.name.split(" ")[0];

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <div className="login-status">Welcome, {userFirstName}</div>
          <button onClick={logout} className="logout-button">
            Log out
          </button>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={() => console.log("Login Failed")}
          size="small"
        />
      )}
    </div>
  );
};

export default LoginStatus;
