import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import Cookies from "js-cookie";
import BatchDetailsModal from "./BatchDetailsModal";

const StudentDataGrid = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ phone: "", gender: "", role: "" });
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 10, 
    totalPages: 1, 
    totalCount: 0 
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [batchData, setBatchData] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => { 
    fetchStudentData(); 
  }, [filters, pagination.page, pagination.limit]);

  const fetchStudentData = async () => {
    setLoading(true);
    const token = Cookies.get("token");
    try {
      const response = await axios.get(
        "https://lmsapp-plvj.onrender.com/admin/student/analytics/allStudentData",
        { 
          headers: { "x-admin-token": token }, 
          params: { 
            page: pagination.page,
            limit: pagination.limit,
            ...filters
          } 
        }
      );
      const { data: students, pagination: apiPagination } = response.data;
      setData(students);
      setPagination(prev => ({ 
        ...prev, 
        totalPages: apiPagination.totalPages, 
        totalCount: apiPagination.totalCount 
      }));
    } catch (error) { 
      console.error("Error fetching data:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleFilterChange = (event) => { 
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => { 
    setPagination(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({
      ...prev,
      limit: newPageSize,
      page: 1
    }));
  };

  const handleRowClick = async (row) => {
    setBatchLoading(true);
    setModalOpen(true);
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/student/analytics/purchased/batch/student/${row._id}`,
        { headers: { "x-admin-token": Cookies.get("token") } }
      );
      setBatchData(response.data);
    } catch (error) { 
      console.error("Error fetching batch details:", error); 
    } finally { 
      setBatchLoading(false); 
    }
  };

  const handleModalClose = () => { 
    setModalOpen(false); 
    setBatchData(null); 
  };

  const columns = [
    { field: "phone", headerName: "Phone", width: 150 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "role", headerName: "Role", width: 100 },
    { field: "createdAt", headerName: "Created At", width: 180 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Student Data</Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField 
          label="Search by Phone" 
          variant="outlined" 
          name="phone"
          value={filters.phone} 
          onChange={handleFilterChange} 
          sx={{ width: 250 }} 
        />
        <TextField 
          select 
          label="Gender" 
          name="gender" 
          variant="outlined" 
          value={filters.gender} 
          onChange={handleFilterChange} 
          sx={{ width: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
        </TextField>
        <TextField 
          select 
          label="Role" 
          name="role" 
          variant="outlined" 
          value={filters.role} 
          onChange={handleFilterChange} 
          sx={{ width: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </TextField>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={data}
          columns={columns}
          pageSize={pagination.limit}
          rowsPerPageOptions={[5, 10, 20]}
          rowCount={pagination.totalCount}
          paginationMode="server"
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          getRowId={(row) => row._id}
          onRowClick={(params) => handleRowClick(params.row)}
          autoHeight
          sx={{ border: "none" }}
        />
      )}
      <BatchDetailsModal 
        open={modalOpen} 
        handleClose={handleModalClose} 
        batchData={batchData} 
        loading={batchLoading} 
      />
    </Box>
  );
};

export default StudentDataGrid;