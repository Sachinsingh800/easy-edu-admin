import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumbs as MUIBreadcrumbs, Typography } from "@mui/material";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <MUIBreadcrumbs aria-label="breadcrumb">
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <Typography key={to} color="textPrimary">
            {decodeURIComponent(value.replace(/-/g, " "))}
          </Typography>
        ) : (
          <Link
            key={to}
            to={to}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {decodeURIComponent(value.replace(/-/g, " "))}
          </Link>
        );
      })}
    </MUIBreadcrumbs>
  );
};

export default Breadcrumbs;
