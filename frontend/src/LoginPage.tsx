import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { User, useAuth } from "./AuthContext";
import { isValidUUID } from "./utils/validation";
import config from "./config";

export function LoginPage() {
  const { login } = useAuth();
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

      if (!isValidUUID(userData.guid)) {
        throw new Error("Invalid user UUID format received from server");
      }

      const user: User = {
        ...userData,
        createdAt: new Date(userData.createdAt).toISOString(),
        lastLogin: new Date(userData.lastLogin).toISOString(),
      };

      login(user);
      navigate("/main");
    } catch (error) {
      console.error("Login error:", error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl mb-8">Log in</h1>
      <GoogleLogin
        onSuccess={handleGoogleLoginSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
}

export default LoginPage;
