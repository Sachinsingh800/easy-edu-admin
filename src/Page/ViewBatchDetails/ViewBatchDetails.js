import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import BatchDescription from "./BatchDescription";
import BatchClasses from "./BatchClasses";
import BatchTests from "./BatchTests";

// MUI Icons
import DescriptionIcon from "@mui/icons-material/Description";
import ClassIcon from "@mui/icons-material/Class";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CreateBatchDescription from "./CreateBatchDescription";

function ViewBatchDetails() {
  const {clsId, id } = useParams();
  const [value, setValue] = useState(0); // State to manage the selected tab

  // Handle tab change
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tabs Component */}
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="batch details tabs"
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab
          label="Description"
          icon={<DescriptionIcon />}
          iconPosition="start"
        />
        <Tab
          label="Classes"
          icon={<ClassIcon />}
          iconPosition="start"
        />
        <Tab
          label="Tests"
          icon={<AssignmentIcon />}
          iconPosition="start"
        />
      </Tabs>

      {/* Tab content based on the selected tab */}
      <Box sx={{ padding: 3 }}>
        {value === 0 && <BatchDescription clsId={clsId} id={id} />}
        {value === 1 && <BatchClasses clsId={clsId} id={id} />}
        {value === 2 && <BatchTests clsId={clsId} id={id} />}
      </Box>
    </Box>
  );
}

export default ViewBatchDetails;
