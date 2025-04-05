import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Container,
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Link,
  Grid,
  TextField,
  styled,
} from "@mui/material";

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
}));

const LoadingWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "300px",
  padding: theme.spacing(4),
}));

const CustomTableHeader = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  "& .MuiTableCell-head": {
    color: theme.palette.common.white,
    fontWeight: "bold",
  },
}));

// Main Component
const TuitionDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const token = Cookies.get("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, studentsRes] = await Promise.all([
          axios.get(
            "https://lmsapp-plvj.onrender.com/admin/tutionForm/teacher/getAll",
            { headers: { "x-admin-token": token } }
          ),
          axios.get(
            "https://lmsapp-plvj.onrender.com/admin/tutionForm/student/getAll",
            { headers: { "x-admin-token": token } }
          ),
        ]);

        setTeachers(teachersRes.data.data);
        setStudents(studentsRes.data.data);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchTerm(""); // Reset search term when changing tabs
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filterTeachers = (teachers) => {
    const searchLower = searchTerm.toLowerCase();
    return teachers.filter((teacher) => {
      const fullName = teacher.basicInfo.fullName?.toLowerCase() || "";
      const qualification = teacher.basicInfo.qualification?.toLowerCase() || "";
      const expertise = teacher.basicInfo.subjectExpertise?.toLowerCase() || "";
      
      return (
        fullName.includes(searchLower) ||
        qualification.includes(searchLower) ||
        expertise.includes(searchLower)
      );
    });
  };

  const filterStudents = (students) => {
    const searchLower = searchTerm.toLowerCase();
    return students.filter((student) => {
      const fullName = student.basicInfo.fullName?.toLowerCase() || "";
      const studentClass = student.basicInfo.class?.toString().toLowerCase() || "";
      const subjects = student?.academicDetails?.subjectsEnrolled || [];

      return (
        fullName.includes(searchLower) ||
        studentClass.includes(searchLower) ||
        subjects.some((subj) => subj?.toLowerCase().includes(searchLower))
      );
    });
  };

  if (error) {
    return (
      <StyledContainer>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="lg">
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "primary.main" }}
      >
        Tuition Management Dashboard
      </Typography>

      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Teachers" />
          <Tab label="Students" />
        </Tabs>
      </Paper>

      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 3 }}
        placeholder={`Search ${tabValue === 0 ? 'teachers' : 'students'}...`}
      />

      {loading ? (
        <LoadingWrapper>
          <CircularProgress size={60} />
        </LoadingWrapper>
      ) : (
        <Box>
          {tabValue === 0 && <TeacherTable data={filterTeachers(teachers)} />}
          {tabValue === 1 && <StudentTable data={filterStudents(students)} />}
        </Box>
      )}
    </StyledContainer>
  );
};

// Teacher Table Component
const TeacherTable = ({ data }) => (
  <TableContainer component={Paper} elevation={4}>
    <Table aria-label="teacher table">
      <CustomTableHeader>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Qualification</TableCell>
          <TableCell>Expertise</TableCell>
          <TableCell>Experience</TableCell>
          <TableCell>Availability</TableCell>
          <TableCell>Expected Salary</TableCell>
          <TableCell>Resume</TableCell>
        </TableRow>
      </CustomTableHeader>
      <TableBody>
        {data.map((teacher, index) => (
          <TableRow key={index}>
            <TableCell>{teacher?.basicInfo?.fullName}</TableCell>
            <TableCell>{teacher?.basicInfo?.qualification}</TableCell>
            <TableCell>{teacher?.basicInfo?.subjectExpertise}</TableCell>
            <TableCell>
              {teacher?.professionalDetails?.yearsOfExperience} years
            </TableCell>
            <TableCell>
              {teacher?.professionalDetails?.availableTimeSlots}
            </TableCell>
            <TableCell>₹{teacher?.feeSalaryDetails?.expectedSalary}</TableCell>
            <TableCell>
              <Link href={teacher?.resume?.url} target="_blank" rel="noopener">
                View Resume
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Student Table Component
const StudentTable = ({ data }) => (
  <TableContainer component={Paper} elevation={4}>
    <Table aria-label="student table">
      <CustomTableHeader>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Class</TableCell>
          <TableCell>Contact</TableCell>
          <TableCell>Subjects</TableCell>
          <TableCell>Study Mode</TableCell>
          <TableCell>Timing Preference</TableCell>
        </TableRow>
      </CustomTableHeader>
      <TableBody>
        {data.map((student, index) => (
          <TableRow key={index}>
            <TableCell>{student?.basicInfo?.fullName}</TableCell>
            <TableCell>{student?.basicInfo?.class}</TableCell>
            <TableCell>
              <Grid container direction="column">
                <span>Primary: {student?.basicInfo?.contactNumber}</span>
                {student?.basicInfo?.alternateNumber && (
                  <span>Alt: {student?.basicInfo?.alternateNumber}</span>
                )}
              </Grid>
            </TableCell>
            <TableCell>
              {student?.academicDetails?.subjectsEnrolled.split(',').join(', ')}
            </TableCell>
            <TableCell>
              {student?.academicDetails?.preferredModeOfStudy}
            </TableCell>
            <TableCell>{student?.academicDetails?.timingPreference}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default TuitionDashboard;