import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";
import api from "../api/auth";
import gmailApi from "../api/gmail";

export default function ConnectGmailButton() {
  const { user, refreshUser } = useAuth();

  const handleClick = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    try {
      toast.info("Connecting to Gmail...");
      
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Make an authenticated request to get the Google OAuth URL
      const response = await gmailApi.get("/auth");

      // Redirect to Google OAuth
      if (response.data && response.data.authUrl) {
        window.location.href = response.data.authUrl;
      } else {
        toast.error("Failed to get Gmail authorization URL");
      }
    } catch (error) {
      console.error("Gmail auth error:", error);
      
      // Check if it's a 500 error (likely missing Google credentials)
      if (error.response?.status === 500) {
        toast.error("Gmail integration not configured. Please set up Google OAuth credentials in the backend .env file.");
        console.log("To set up Google OAuth:");
        console.log("1. Go to https://console.cloud.google.com/");
        console.log("2. Create a project and enable Gmail API");
        console.log("3. Create OAuth 2.0 credentials");
        console.log("4. Add the credentials to your backend/.env file");
      } else if (error.response?.status === 401) {
        toast.error("Please login again");
      } else {
        toast.error("Failed to connect to Gmail");
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.delete("/gmail-disconnect");
      toast.success("Gmail account disconnected. Auto import disabled.");
      await refreshUser();
    } catch (error) {
      toast.error("Failed to disconnect Gmail");
      console.error("Gmail disconnect error:", error);
    }
  };

  if (user?.gmailRefreshToken) {
    return (
      <Button onClick={handleDisconnect} variant="destructive" className="w-auto text-[10px] px-3 py-2 sm:text-base sm:px-5 sm:py-2.5 font-medium">
        Disconnect Gmail
      </Button>
    );
  }

  return (
    <Button onClick={handleClick}>
      Import Subscriptions from Gmail
    </Button>
  );
}
