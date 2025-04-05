import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Divider,
  ListItemIcon,
  Box,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from '@mui/icons-material/School';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PersonIcon from '@mui/icons-material/Person';
import Face3Icon from '@mui/icons-material/Face3';
import ApartmentIcon from '@mui/icons-material/Apartment';
import Person4Icon from '@mui/icons-material/Person4';
import PagesIcon from '@mui/icons-material/Pages';
import Groups2Icon from '@mui/icons-material/Groups2';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      text: "Class List",
      icon: <SchoolIcon />,
      path: "/dashboard/class-list",
    },
    {
      text: "Subjects List",
      icon: <FormatListBulletedIcon />,
      path: "/dashboard/subjects-list",
    },
    {
      text: "Teachers List",
      icon: <PersonIcon />,
      path: "/dashboard/teachers-list",
    },
    {
      text: "Student Data",
      icon: <Face3Icon />,
      path: "/dashboard/student-data",
    },
    {
      text: "Tuition Dashboard",
      icon: <ApartmentIcon />,
      path: "/dashboard/tuition-dashboard",
    },
    {
      text: "Toppers List",
      icon: <Person4Icon />,
      path: "/dashboard/toppers-list",
    },
    {
      text: "Blog",
      icon: <PagesIcon />,
      path: "/dashboard/category-management",
    },
    {
      text: "Offline Class",
      icon: <SchoolIcon />,
      path: "/dashboard/class-admin",
    },
    {
      text: "Teacher Management",
      icon: <Groups2Icon />,
      path: "/dashboard/teacher-management",
    },
    {
      text: "Parents Management",
      icon: <Groups2Icon />,
      path: "/dashboard/parents-table",
    },
    // {
    //   text: "Student Analytics",
    //   icon: <Groups2Icon />,
    //   path: "/dashboard/student-hierarchy",
    // },
  ];

  // Inline styles for sidebar
  const sidebarStyles = {
    width: "260px",
    height: "100vh",
    background: "#fd0000", // Professional blue gradient
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)", // Subtle shadow for depth
    padding: "20px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    overflowY: "auto", // Enables vertical scroll only when needed
    overflowX: "hidden", // Hides horizontal scrollbar
    scrollBehavior: "smooth", // Smooth scroll behavior
    msOverflowStyle: "none", // Disables scrollbars for IE
  };

  // Styles for List
  const listStyles = {
    width: "100%",
    padding: 0,
    marginTop: "0px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  // Styles for each menu item
  const menuItemStyles = {
    padding: "12px 20px",
    borderRadius: "8px",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    cursor: "pointer",
  };

  // Hover styles
  const menuItemHoverStyles = {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Subtle hover effect
    transform: "translateX(5px)", // Slide effect
  };

  // Active styles
  const menuItemSelectedStyles = {
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Active background color
    color: "#ffffff", // Text color for active item
  };

  const menuItemTextStyles = {
    color: "#ffffff", // Default white text color
    fontWeight: "600", // Bold text for emphasis
    fontSize: "16px",
  };

  const menuItemIconStyles = {
    color: "#ffffff", // Default icon color
    fontSize: "20px",
    transition: "color 0.2s ease", // Smooth color transition on hover
  };

  const menuItemSelectedIconStyles = {
    color: "#FFEB3B", // Golden color for selected icon
  };

  return (
    <Box sx={sidebarStyles}>
      <Toolbar />
      <Divider sx={{ backgroundColor: "#B0BEC5", margin: "10px 0" }} />
      <List sx={listStyles}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              ...menuItemStyles,
              ...(location.pathname === item.path
                ? menuItemSelectedStyles
                : {}),
              "&:hover": menuItemHoverStyles, // Apply hover styles dynamically
            }}
          >
            <ListItemIcon
              sx={{
                ...menuItemIconStyles,
                ...(location.pathname === item.path
                  ? menuItemSelectedIconStyles
                  : {}),
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={menuItemTextStyles} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;

// Custom scrollbar styles
const customScrollbarStyles = `
  /* Custom scrollbar for Chrome, Safari and Edge */
  ::-webkit-scrollbar {
    width: 8px; /* Width of the scrollbar */
    height: 0px; /* Hides horizontal scrollbar */
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3); /* Light gray thumb */
    border-radius: 10px; /* Rounded corners for the thumb */
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.5); /* Darker thumb on hover */
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1); /* Track color */
    border-radius: 10px;
  }

  /* Custom scrollbar for Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.1); /* Thumb and track color */
`;

const globalStyles = document.createElement("style");
globalStyles.innerHTML = customScrollbarStyles;
document.head.appendChild(globalStyles);
