import React from "react";
import {
  Modal,
  Box,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";

const BatchDetailsModal = ({ open, handleClose, batchData, loading }) => {
  // Define columns for the DataGrid
  const columns = [
    { field: "_id", headerName: "ID", width: 200 },
    { field: "batchId", headerName: "Batch ID", width: 150 },
    { field: "paidAmount", headerName: "Paid Amount", width: 150 },
    { field: "paidAt", headerName: "Paid At", width: 200 },
  ];

  const rows = batchData?.data?.map((row) => ({ ...row, id: row._id })) || [];

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Batch Details</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <CircularProgress />
          </Box>
        ) : rows.length > 0 ? (
          <Box sx={{ height: 400, mt: 2 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
            />
          </Box>
        ) : (
          <Typography variant="body1" sx={{ mt: 3 }}>
            No batch data available.
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default BatchDetailsModal;
