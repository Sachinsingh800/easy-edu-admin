import React, { useEffect, useState } from "react";
import { Paper, Typography, Box, CircularProgress, Avatar } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import revenueImage from "../../Images/revenue.png"; // Replace with the correct path to your image
import { useNavigate } from "react-router-dom";

const Widget5 = () => {
  const [batchRevenue, setBatchRevenue] = useState(null); // State to store batch revenue data
  const [loading, setLoading] = useState(true); // Loading state for API call
  const [error, setError] = useState(null); // Error state for API call
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchBatchRevenue = async () => {
      try {
        const token = Cookies.get("token"); // Get the token from cookies
        const response = await axios.get(
          "https://lmsapp-plvj.onrender.com/admin/dashBoard/totalMaterialRevenue",
          {
            headers: {
              "Content-Type": "application/json",
              "x-admin-token": token, // Pass token in header
            },
          }
        );
        setBatchRevenue(response.data.data); // Set batch revenue
        setLoading(false); // Stop loading spinner
      } catch (error) {
        setError("Failed to fetch data"); // Set error message
        setLoading(false); // Stop loading spinner
      }
    };

    fetchBatchRevenue();
  }, []);

  return (
    <Paper
      elevation={16} // High elevation for a modern, sleek shadow effect
      sx={{
        padding: { xs: 3, sm: 4 }, // Responsive padding (smaller on mobile)
        backgroundImage: "linear-gradient(to top, #dfe9f3 0%, white 100%)", // Gradient background
        backdropFilter: "blur(12px)", // Blur effect for a modern look
        borderRadius: 3, // Rounded corners for a soft, premium design
        color: "#333", // Darker text for better contrast
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)", // Smooth, elegant shadow
        "&:hover": {
          boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover for depth
          transform: "scale(1.05)", // Slight scale-up effect on hover for interactivity
        },
        transition: "all 0.3s ease-in-out", // Smooth transition for hover effects
        maxWidth: { xs: "100%", sm: "480px" }, // Full width on mobile, 480px on larger screens
        margin: "0 auto", // Centering the widget horizontally
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
      }}
      // onClick={() => navigate("/dashboard/batch-revenue")} // Add the click handler to the card
    >
      {/* Revenue Image */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginBottom: 3,
        }}
      >
        <Avatar
          src={revenueImage}
          alt="Batch Revenue"
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "white",
          }}
        />
      </Box>

      {/* Loading, Error, or Data Display */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100px",
          }}
        >
          <CircularProgress
            color="primary"
            size={60}
            sx={{ animationDuration: "500ms" }}
          />
        </Box>
      ) : error ? (
        <Typography
          variant="body1"
          sx={{
            color: "red",
            fontSize: "16px",
            fontWeight: 500,
            textAlign: "center",
            padding: 1,
            borderRadius: 1,
            backgroundColor: "#fff0f0", // Soft background for error
            marginBottom: 2,
          }}
        >
          {error}
        </Typography>
      ) : (
        <Typography
          variant="h6"
          sx={{
            color: "#333", // Dark text color for contrast
            fontSize: { xs: "1.2rem", sm: "1.2rem" },
            fontWeight: 500,
            lineHeight: 1.6,
            display: "flex",
            flexDirection: "column",
            marginTop: 2,
          }}
        >
          <span style={{ color: "#1A237E", fontWeight: "bold" }}>
            ₹{batchRevenue !== null ? batchRevenue.toLocaleString() : 0}
          </span>{" "}
           Material Revenue
        </Typography>
      )}
    </Paper>
  );
};

export default Widget5;
