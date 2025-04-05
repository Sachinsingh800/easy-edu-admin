

import React from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  useMediaQuery,
  Divider,
  Fade,
  Slide,
  Grow,
  alpha,
} from "@mui/material";
import {
  CheckCircle,
  Check,
  Close,
  Assignment,
  Book,
  Grading,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import styles from "./StudentHierarchy.module.css";

const StudentAnalytics = ({
  analyticsData,
  attendanceList,
  student,
  cwAnalytics,
  cwList,
  hwAnalytics,
  hwList,
  testAnalytics,
  testList,
  ptmAnalytics,
  ptmList,
  feedbackAnalytics,
  feedbackList,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Data preparation functions
  const prepareData = (present, absent, presentColor, absentColor) => [
    { name: "Present", value: present, color: presentColor },
    { name: "Absent", value: absent, color: absentColor },
  ];

  // Chart data using theme colors
  const attendanceData = prepareData(
    analyticsData?.attendedClasses,
    analyticsData?.absentClasses,
    theme.palette.success.main,
    theme.palette.error.main
  );

  const classworkData = prepareData(
    cwAnalytics?.completedClassworks,
    cwAnalytics?.incompletedClasswork,
    theme.palette.success.main,
    theme.palette.error.main
  );

  const homeworkData = prepareData(
    hwAnalytics?.submittedHomeworks,
    hwAnalytics?.notSubmittedHomework,
    theme.palette.success.main,
    theme.palette.error.main
  );

  const testResultsData = prepareData(
    testAnalytics?.attendedTests,
    testAnalytics?.absentTests,
    theme.palette.success.main,
    theme.palette.error.main
  );

  const ptmData = prepareData(
    ptmAnalytics?.attendedPTMs,
    ptmAnalytics?.absentPTMs,
    theme.palette.success.main,
    theme.palette.error.main
  );

  const feedbackData = prepareData(
    feedbackAnalytics?.providedFeedback,
    feedbackAnalytics?.defaultFeedbackCount,
    theme.palette.success.main,
    theme.palette.error.main
  );

  const renderChartLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill={theme.palette.text.primary}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontWeight: 700,
          fontSize: "0.875rem",
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Fade in timeout={500}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 16px 32px -12px rgba(0,0,0,0.2)",
          overflow: "visible",
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Header Section */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Slide in direction="down" timeout={300}>
              <Typography
                variant="h3"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  color: "primary.main",
                  fontSize: { xs: "2rem", sm: "2.5rem" },
                }}
              >
                {student?.studentName}'s Academic Dashboard
              </Typography>
            </Slide>
            <Divider
              sx={{
                my: 3,
                mx: "auto",
                width: "60%",
                height: 4,
                borderRadius: 2,
                bgcolor: "primary.main",
                opacity: 0.2,
              }}
            />
          </Box>

          {/* Main Analytics Sections */}
          <Grid container spacing={4}>
            <AnalyticsSection
              title="Attendance Overview"
              data={attendanceData}
              stats={[
                {
                  title: "Total Classes",
                  value: analyticsData?.totalConductedClasses,
                  icon: <CheckCircle />,
                },
                {
                  title: "Attended",
                  value: analyticsData?.attendedClasses,
                  icon: <Check />,
                },
                {
                  title: "Absent",
                  value: analyticsData?.absentClasses,
                  icon: <Close />,
                },
              ]}
              chartLabel={`${analyticsData?.attendancePercent}%`}
              chartSubLabel="Attendance Rate"
              renderLabel={renderChartLabel}
            />

            <AnalyticsSection
              title="Classwork Performance"
              data={classworkData}
              stats={[
                {
                  title: "Total Classworks",
                  value: cwAnalytics?.totalClassworks,
                  icon: <Assignment />,
                },
                {
                  progress: true,
                  title: "Completion Rate",
                  value: cwAnalytics?.completionPercent,
                },
              ]}
              chartLabel={`${cwAnalytics?.completionPercent}%`}
              chartSubLabel="Completion Rate"
              renderLabel={renderChartLabel}
            />

            {/* Other sections follow same pattern */}

            {/* Homework Section */}
            <AnalyticsSection
              title="Homework Performance"
              data={homeworkData}
              stats={[
                {
                  title: "Total Homeworks",
                  value: hwAnalytics?.totalHomeworks,
                  icon: <Book />,
                },
                {
                  progress: true,
                  title: "Completion Rate",
                  value: hwAnalytics?.completionPercent,
                },
              ]}
              chartLabel={`${hwAnalytics?.completionPercent}%`}
              chartSubLabel="Overall Completion Percent"
              renderLabel={renderChartLabel}
            />

            {/* Test Results Section */}
            <AnalyticsSection
              title="Test Results"
              data={testResultsData}
              stats={[
                {
                  title: "Total Tests",
                  value: testAnalytics?.totalTests,
                  icon: <Grading />,
                },
                {
                  title: "Attended Tests",
                  value: testAnalytics?.attendedTests,
                  icon: <Check />,
                },
                {
                  progress: true,
                  title: "Average Score",
                  value: testAnalytics?.averageTestScorePercent,
                },
              ]}
              chartLabel={`${testAnalytics?.totalPresentTestPercent}%`}
              chartSubLabel="Test Attendance"
              renderLabel={renderChartLabel}
            />
            {/* PTM Attendance Section */}
            <AnalyticsSection
              title="PTM Attendance"
              data={ptmData}
              stats={[
                {
                  title: "Total PTMs",
                  value: ptmAnalytics?.totalPTMs,
                  icon: <CheckCircle />,
                },
                {
                  title: "Attended",
                  value: ptmAnalytics?.attendedPTMs,
                  icon: <Check />,
                },
                {
                  title: "Absent",
                  value: ptmAnalytics?.absentPTMs,
                  icon: <Close />,
                },
              ]}
              chartLabel={`${ptmAnalytics?.attendancePercent}%`}
              chartSubLabel="PTM Attendance Rate"
              renderLabel={renderChartLabel}
            />

            <AnalyticsSection
              title="Feedback Analytics"
              data={[
                {
                  name: "Provided",
                  value: feedbackAnalytics?.providedFeedback || 0,
                  color: theme.palette.success.main,
                },
                {
                  name: "Default",
                  value: feedbackAnalytics?.defaultFeedbackCount || 0,
                  color: theme.palette.error.main,
                },
              ]}
              stats={[
                {
                  title: "Total Feedback",
                  value: feedbackAnalytics?.totalFeedback || 0,
                  icon: <Assignment />,
                },
                {
                  progress: true,
                  title: "Feedback Provided",
                  value:
                    parseFloat(feedbackAnalytics?.feedbackProvidedPercent) || 0,
                },
                {
                  progress: true,
                  title: "Improved",
                  value: parseFloat(feedbackAnalytics?.improvedPercent) || 0,
                },
              ]}
              chartLabel={`${feedbackAnalytics?.feedbackProvidedPercent}%`}
              chartSubLabel="Feedback Provided"
              renderLabel={renderChartLabel}
            />
          </Grid>

          {/* History Sections */}
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 4,
                pl: 2,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
              }}
            >
              Activity History
            </Typography>
            <Grid container spacing={3}>
              {[
                {
                  title: "Classwork History",
                  items: cwList,
                  primary: (item) =>
                    new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  secondary: (item) => `Slot: ${item.slot}`,
                  status: (item) => item.completed,
                },
                {
                  title: "Homework History",
                  items: hwList,
                  primary: (item) =>
                    new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  secondary: (item) => `Slot: ${item.slot}`,
                  status: (item) => item.submitted,
                },
                {
                  title: "Attendance History",
                  items: attendanceList,
                  primary: (item) =>
                    new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  secondary: (item) => `Slot: ${item.slot}`,
                  status: (item) => item.present,
                },
                {
                  title: "Test History",
                  items: testList,
                  primary: (item) =>
                    new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  secondary: (item) =>
                    `Slot: ${item.slot} | Marks: ${item.obtainedMarks}/${item.totalMarks}`,
                  status: (item) => item.present,
                },
                {
                  title: "PTM History",
                  items: ptmList,
                  primary: (item) =>
                    new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  secondary: (item) =>
                    `Slot: ${item.slot} | Topic: ${item.topicOfDiscussion}`,
                  status: (item) => item.present,
                },
                {
                  title: "Feedback History",
                  items: feedbackList,
                  primary: (item) =>
                    new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  secondary: (item) => item.feedBack,
                  status: (item) => item.improved,
                },

                // Add other history sections here
              ].map((section, index) => (
                <Grow in timeout={(index + 1) * 200} key={section.title}>
                  <Grid item xs={12} md={6} lg={4}>
                    <HistorySection {...section} />
                  </Grid>
                </Grow>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

const AnalyticsSection = ({
  title,
  data,
  stats,
  chartLabel,
  chartSubLabel,
  renderLabel,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Grid item xs={12} sx={{ mb: 6 }}>
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.background.default, 0.4),
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 16px -6px rgba(0,0,0,0.05)",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            component="span"
            sx={{
              width: 8,
              height: 32,
              bgcolor: "primary.main",
              borderRadius: 1,
            }}
          />
          {title}
        </Typography>

        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {stats.map((stat, index) => (
                <Grow in timeout={index * 100 + 300} key={stat.title}>
                  <div>
                    {stat.progress ? (
                      <ProgressCard
                        title={stat.title}
                        value={stat.value}
                        color={data[0].color}
                      />
                    ) : (
                      <StatCard
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={theme.palette.primary.main}
                      />
                    )}
                  </div>
                </Grow>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ position: "relative", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 50 : 70}
                    outerRadius={isMobile ? 80 : 100}
                    paddingAngle={1}
                    dataKey="value"
                    labelLine={false}
                    label={renderLabel}
                    animationDuration={600}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={theme.palette.background.paper}
                        strokeWidth={4}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ payload }) => (
                      <Box
                        sx={{
                          bgcolor: "background.paper",
                          p: 1.5,
                          borderRadius: 2,
                          boxShadow: 2,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {payload?.[0]?.name}: {payload?.[0]?.value}
                        </Typography>
                      </Box>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>

              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h2"
                  sx={{ fontWeight: 800, lineHeight: 1 }}
                >
                  {chartLabel}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.5 }}
                >
                  {chartSubLabel}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
};

// Enhanced HistorySection component with animations
const HistorySection = ({ title, items, primary, secondary, status }) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: 600, color: "text.secondary", ml: 1 }}
      >
        {title}
      </Typography>
      <List
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        {items?.length > 0 ? (
          items.map((item, index) => (
            <Grow in timeout={index * 50} key={index}>
              <ListItem
                sx={{
                  py: 2,
                  px: 3,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateX(4px)",
                    bgcolor: "action.hover",
                  },
                  "& + &": {
                    borderTop: `1px solid ${theme.palette.divider}`,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <Avatar
                    sx={{
                      bgcolor: status(item)
                        ? alpha(theme.palette.success.main, 0.1)
                        : alpha(theme.palette.error.main, 0.1),
                      color: status(item)
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                      width: 36,
                      height: 36,
                    }}
                  >
                    {status(item) ? <Check /> : <Close />}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={primary(item)}
                  secondary={secondary(item)}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    color: "text.primary",
                  }}
                  secondaryTypographyProps={{
                    variant: "body2",
                    color: "text.secondary",
                  }}
                />
              </ListItem>
            </Grow>
          ))
        ) : (
          <ListItem>
            <ListItemText
              primary="No records found"
              primaryTypographyProps={{
                color: "text.secondary",
                fontStyle: "italic",
              }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

// Refined StatCard component
const StatCard = ({ title, value, icon, color }) => (
  <Box
    sx={{
      p: 2.5,
      borderRadius: 2,
      bgcolor: alpha(color, 0.08),
      border: `1px solid ${alpha(color, 0.2)}`,
      transition: "all 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: `0 4px 12px ${alpha(color, 0.1)}`,
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
      <Avatar
        sx={{
          bgcolor: alpha(color, 0.1),
          color: color,
          width: 44,
          height: 44,
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  </Box>
);

// Enhanced ProgressCard component
const ProgressCard = ({ title, value, color }) => (
  <Box
    sx={{
      p: 2.5,
      borderRadius: 2,
      bgcolor: alpha(color, 0.08),
      border: `1px solid ${alpha(color, 0.2)}`,
    }}
  >
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          flexGrow: 1,
          height: 10,
          borderRadius: 5,
          bgcolor: alpha(color, 0.15),
          "& .MuiLinearProgress-bar": {
            bgcolor: color,
            borderRadius: 5,
          },
        }}
      />
      <Typography
        variant="body1"
        sx={{ fontWeight: 700, color: "text.primary" }}
      >
        {value}%
      </Typography>
    </Box>
  </Box>
);

export default StudentAnalytics;
