// src/components/StudentHierarchy/StudentHierarchy.jsx
import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Backdrop,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  styled,
} from "@mui/material";
import {
  Folder,
  Subject,
  ArrowBack,
  CalendarMonth,
  Search,
  Close,
  Person,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import {
  getClasses,
  getSubjects,
  getBatches,
  getStudents,
  getAnalytics,
  getAttendenceAnalytics,
  getCwAnalytics,
  getCwList,
  getHwAnalytics,
  getHwList,
  getTestAnalytics,
  getTestList,
  getPtmAnalytics,
  getPtmList,
  getFeedbackAnalytics,
  getFeedbackList
} from "./api";
import StudentAnalytics from "./StudentAnalytics";
import Cookies from "js-cookie";

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  cursor: "pointer",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}));

const StudentHierarchy = () => {
  const token = Cookies.get("token");
  const [currentLevel, setCurrentLevel] = useState("class");
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [attendanceList, setAttendanceList] = useState(null);
  const [cwAnalytics, setCwAnalytics] = useState(null);
  const [cwList, setCwList] = useState(null);
  const [hwAnalytics, setHwAnalytics] = useState(null);
  const [hwList, setHwList] = useState(null);
  const [testAnalytics, setTestAnalytics] = useState(null);
  const [testList, setTestList] = useState(null);
  const [ptmAnalytics, setPtmAnalytics] = useState(null);
  const [ptmList, setPtmList] = useState(null);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState(null);
  const [feedbackList, setFeedbackList] = useState(null);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const levelTitles = {
    class: "Classes",
    subject: "Subjects",
    batch: "Batches",
    student: "Students",
    analytics: "Attendance Analytics",
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await getClasses(token);
      setClasses(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm("");

  const filteredItems = () => {
    const items =
      {
        class: classes,
        subject: subjects,
        batch: batches,
        student: students,
      }[currentLevel] || [];

    return items.filter((item) => {
      const searchField =
        item.className ||
        item.subjectName ||
        item.batchYear ||
        item.studentName ||
        "";
      return searchField.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const handleCardClick = async (item) => {
    try {
      setLoading(true);
      setError(null);

      switch (currentLevel) {
        case "class":
          const subjectsRes = await getSubjects(item._id, token);
          setSubjects(subjectsRes.data?.data || []);
          setCurrentLevel("subject");
          setSelected({ class: item });
          break;
        case "subject":
          const batchesRes = await getBatches(item._id, token);
          setBatches(batchesRes.data?.data || []);
          setCurrentLevel("batch");
          setSelected((prev) => ({ ...prev, subject: item }));
          break;
        case "batch":
          const studentsRes = await getStudents(item._id, token);
          setStudents(studentsRes.data?.data || []);
          setCurrentLevel("student");
          setSelected((prev) => ({ ...prev, batch: item }));
          break;
        case "student":
          const [
            analyticsRes,
            analyticsList,
            analyticsCw,
            analyticsCwList,
            analyticsHw,
            analyticsHwList,
            analyticsTest,
            testListResponse, // ✅ Correct variable name
            analyticsPtm,
            analyticsPtmList,
            analyticsFeedback,
            analyticsFeedbackList
          ] = await Promise.all([
            getAnalytics(selected.batch._id, item._id, token),
            getAttendenceAnalytics(selected.batch._id, item._id, token),
            getCwAnalytics(selected.batch._id, item._id, token),
            getCwList(selected.batch._id, item._id, token),
            getHwAnalytics(selected.batch._id, item._id, token),
            getHwList(selected.batch._id, item._id, token),
            getTestAnalytics(selected.batch._id, item._id, token),
            getTestList(selected.batch._id, item._id, token), // API call remains the same
            getPtmAnalytics(selected.batch._id, item._id, token),
            getPtmList(selected.batch._id, item._id, token),
            getFeedbackAnalytics(selected.batch._id, item._id, token),
            getFeedbackList(selected.batch._id, item._id, token)
          ]);

          setAnalytics(analyticsRes.data?.data || null);
          setAttendanceList(analyticsList.data?.data || null);
          setCwAnalytics(analyticsCw.data?.data || null);
          setCwList(analyticsCwList.data?.data || null);
          setHwAnalytics(analyticsHw.data?.data || null);
          setHwList(analyticsHwList.data?.data || null);
          setTestAnalytics(analyticsTest.data?.data || null);
          setTestList(testListResponse.data?.data || null); // ✅ Correct reference
          setPtmAnalytics(analyticsPtm.data?.data || null); // ✅ Correct reference
          setPtmList(analyticsPtmList.data?.data || null); // ✅ Correct reference
          setFeedbackAnalytics(analyticsFeedback.data?.data || null); // ✅ Correct reference
          setFeedbackList(analyticsFeedbackList.data?.data || null); // ✅ Correct reference
          setCurrentLevel("analytics");
          setSelected((prev) => ({ ...prev, student: item }));
          break;
      }
    } catch (err) {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setSearchTerm("");
    }
  };

  const handleBack = () => {
    const levels = ["class", "subject", "batch", "student", "analytics"];
    const currentIndex = levels.indexOf(currentLevel);
    const newLevel = levels[Math.max(0, currentIndex - 1)];
    setCurrentLevel(newLevel);

    // Reset relevant state when going back
    if (newLevel === "class") {
      setSelected({});
      setSubjects([]);
      setBatches([]);
      setStudents([]);
    }
    setSearchTerm("");
  };

  const renderIcon = () => {
    const iconStyle = { fontSize: 40, color: "primary.main" };
    switch (currentLevel) {
      case "class":
        return <Folder sx={iconStyle} />;
      case "subject":
        return <Subject sx={iconStyle} />;
      case "batch":
        return <CalendarMonth sx={iconStyle} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Backdrop
        open={loading}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 4,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {currentLevel !== "class" && (
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Back
          </Button>
        )}
        <Typography
          variant="h5"
          component="h1"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {levelTitles[currentLevel]}
        </Typography>

        {currentLevel !== "analytics" && (
          <TextField
            variant="outlined"
            placeholder={`Search ${levelTitles[currentLevel]}...`}
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: { xs: "100%", sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <IconButton
                  onClick={clearSearch}
                  size="small"
                  title="Clear search"
                >
                  <Close fontSize="small" />
                </IconButton>
              ),
            }}
          />
        )}
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {currentLevel === "analytics" ? (
        <StudentAnalytics
          analyticsData={analytics}
          attendanceList={attendanceList}
          student={selected.student}
          cwAnalytics={cwAnalytics}
          cwList={cwList}
          hwAnalytics={hwAnalytics}
          hwList={hwList}
          testAnalytics={testAnalytics}
          testList={testList}
          ptmAnalytics={ptmAnalytics}
          ptmList={ptmList}
          feedbackAnalytics={feedbackAnalytics}
          feedbackList={feedbackList}
        />
      ) : (
        <Grid container spacing={2}>
          {filteredItems().map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
              <StyledCard onClick={() => handleCardClick(item)}>
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 2,
                    py: 4,
                  }}
                >
                  {currentLevel === "student" ? (
                    <Avatar
                      src={item.profilePic?.url}
                      sx={{
                        width: 80,
                        height: 80,
                        mb: 2,
                        bgcolor: "primary.main",
                      }}
                    >
                      {!item.profilePic?.url && <Person fontSize="large" />}
                    </Avatar>
                  ) : (
                    <Box sx={{ color: "primary.main" }}>{renderIcon()}</Box>
                  )}

                  <Typography
                    variant="subtitle1"
                    component="div"
                    sx={{
                      fontWeight: 600,
                      lineHeight: 1.2,
                      wordBreak: "break-word",
                    }}
                  >
                    {item.className ||
                      item.subjectName ||
                      item.batchYear ||
                      item.studentName}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StudentHierarchy;
