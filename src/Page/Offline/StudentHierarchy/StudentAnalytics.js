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
  Grow,
  Skeleton,
  Chip,
  Fade,
  Slide,
} from "@mui/material";
import {
  CheckCircle,
  Check,
  Close,
  Assignment,
  Book,
  Grading,
  EmojiEvents,
  SentimentDissatisfied,
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
  isLoading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Data preparation with fallbacks
  const ptmData = [
    {
      name: "Present",
      value: ptmAnalytics?.attendedPTMs || 0,
      color: theme.palette.success.main,
    },
    {
      name: "Absent",
      value: ptmAnalytics?.absentPTMs || 0,
      color: theme.palette.error.main,
    },
  ];

  const classworkData = [
    {
      name: "Completed",
      value: cwAnalytics?.completedClassworks || 0,
      color: theme.palette.success.main,
    },
    {
      name: "Incomplete",
      value: cwAnalytics?.incompletedClasswork || 0,
      color: theme.palette.error.main,
    },
  ];

  const homeworkData = [
    {
      name: "Completed",
      value: hwAnalytics?.submittedHomeworks || 0,
      color: theme.palette.success.main,
    },
    {
      name: "Incomplete",
      value: hwAnalytics?.notSubmittedHomework || 0,
      color: theme.palette.error.main,
    },
  ];

  const testResultsData = [
    {
      name: "Attended",
      value: testAnalytics?.attendedTests || 0,
      color: theme.palette.success.main,
    },
    {
      name: "Absent",
      value: testAnalytics?.absentTests || 0,
      color: theme.palette.error.main,
    },
  ];

  const attendanceData = [
    {
      name: "Present",
      value: analyticsData?.attendedClasses || 0,
      color: theme.palette.success.main,
    },
    {
      name: "Absent",
      value: analyticsData?.absentClasses || 0,
      color: theme.palette.error.main,
    },
  ];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontWeight: 600, fontSize: 14 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Slide in={loaded} direction="up" timeout={300}>
      <Card
        className={styles.analyticsCard}
        sx={{
          borderRadius: 4,
          boxShadow: 3,
          background: `linear-gradient(145deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <CardContent>
          {/* Header Section */}
          <Box sx={{ mb: 4, textAlign: "center", position: "relative" }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 800,
                color: "primary.main",
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              {student?.studentName}'s Academic Dashboard
            </Typography>
            <Divider
              sx={{
                my: 2,
                background: `linear-gradient(to right, ${theme.palette.primary.main} 30%, transparent 100%)`,
                height: 2,
              }}
            />
            {/* <Chip
              label={`Grade: ${student?.grade || 'N/A'}`}
              sx={{
                position: "absolute",
                right: 16,
                top: 16,
                bgcolor: "primary.light",
                color: "primary.contrastText",
                fontWeight: 600,
              }}
            /> */}
          </Box>

          {/* Main Analytics Sections */}
          <Box sx={{ mb: 8 }}>
            {[
              {
                title: "Attendance Overview",
                data: attendanceData,
                stats: [
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
                ],
                chartLabel: `${analyticsData?.attendancePercent}%`,
                chartSubLabel: "Overall Attendance",
              },
              {
                title: "Classwork Performance",
                data: classworkData,
                stats: [
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
                ],
                chartLabel: `${cwAnalytics?.completionPercent}%`,
                chartSubLabel: "Overall Completion",
              },
              {
                title: "Homework Performance",
                data: homeworkData,
                stats: [
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
                ],
                chartLabel: `${hwAnalytics?.completionPercent}%`,
                chartSubLabel: "Overall Completion",
              },
              {
                title: "Test Results",
                data: testResultsData,
                stats: [
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
                ],
                chartLabel: `${testAnalytics?.totalPresentTestPercent}%`,
                chartSubLabel: "Test Attendance",
              },
              {
                title: "PTM Attendance",
                data: ptmData,
                stats: [
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
                ],
                chartLabel: `${ptmAnalytics?.attendancePercent}%`,
                chartSubLabel: "PTM Attendance",
              },
              {
                title: "Feedback Analytics",
                data: [
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
                ],
                stats: [
                  {
                    title: "Total Feedback",
                    value: feedbackAnalytics?.totalFeedback || 0,
                    icon: <Assignment />,
                  },
                  {
                    progress: true,
                    title: "Feedback Provided",
                    value: parseFloat(feedbackAnalytics?.feedbackProvidedPercent) || 0,
                  },
                  {
                    progress: true,
                    title: "Improved",
                    value: parseFloat(feedbackAnalytics?.improvedPercent) || 0,
                  },
                ],
                chartLabel: `${feedbackAnalytics?.feedbackProvidedPercent}%`,
                chartSubLabel: "Feedback Provided",
              },
            ].map((section, index) => (
              <Fade in={loaded} timeout={index * 200} key={section.title}>
                <div>
                  <AnalyticsSection
                    {...section}
                    renderLabel={renderCustomizedLabel}
                  />
                  {index % 2 === 0 && (
                    <Divider sx={{ my: 4, opacity: 0.5 }} variant="middle" />
                  )}
                </div>
              </Fade>
            ))}
          </Box>

          {/* Activity History Section */}
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 4,
                pl: 2,
                borderLeft: `4px solid ${theme.palette.secondary.main}`,
                background: `linear-gradient(90deg, ${theme.palette.secondary.light}20 0%, transparent 100%)`,
              }}
            >
              Activity Timeline
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
                  icon: <Assignment fontSize="small" />,
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
                  icon: <Book fontSize="small" />,
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
                  icon: <CheckCircle fontSize="small" />,
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
                    `Score: ${item.obtainedMarks}/${item.totalMarks}`,
                  status: (item) => item.present,
                  icon: <Grading fontSize="small" />,
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
                  secondary: (item) => item.topicOfDiscussion,
                  status: (item) => item.present,
                  icon: <EmojiEvents fontSize="small" />,
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
                  icon: <SentimentDissatisfied fontSize="small" />,
                },
              ].map((section, index) => (
                <Grid item xs={12} md={6} lg={4} key={section.title}>
                  <Grow in={loaded} timeout={index * 200}>
                    <div>
                      <HistorySection {...section} />
                    </div>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Slide>
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: "text.secondary",
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 32,
            bgcolor: "primary.main",
            borderRadius: 1,
          }}
        />
        {title}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {stats.map((stat, index) =>
              stat.progress ? (
                <ProgressCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  color={data[0].color}
                />
              ) : (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={theme.palette.info.main}
                />
              )
            )}
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
                  innerRadius={isMobile ? 60 : 80}
                  outerRadius={isMobile ? 90 : 110}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={renderLabel}
                  animationDuration={500}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={theme.palette.background.paper}
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => (
                    <CustomTooltip payload={payload} theme={theme} />
                  )}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ bottom: -20 }}
                  formatter={(value) => (
                    <span style={{ color: theme.palette.text.primary }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <ChartCenterLabel
              label={chartLabel}
              subLabel={chartSubLabel}
              theme={theme}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const HistorySection = ({
  title,
  items,
  primary,
  secondary,
  status,
  icon,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {icon}
        {title}
      </Typography>
      <List
        sx={{
          bgcolor: "background.paper",
          borderRadius: 4,
          boxShadow: 1,
          p: 1,
        }}
      >
        {items?.length > 0 ? (
          items.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                py: 2,
                borderRadius: 3,
                mb: 1,
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "action.hover",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon>
                <Avatar
                  sx={{
                    bgcolor: status(item)
                      ? theme.palette.success.light
                      : theme.palette.error.light,
                    color: status(item)
                      ? theme.palette.success.contrastText
                      : theme.palette.error.contrastText,
                    boxShadow: theme.shadows[2],
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
          ))
        ) : (
          <ListItem
            sx={{
              display: "flex",
              flexDirection: "column",
              py: 4,
              textAlign: "center",
            }}
          >
            <SentimentDissatisfied
              sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="body1" color="text.secondary">
              No {title.toLowerCase()} records found
            </Typography>
          </ListItem>
        )}
      </List>
    </Box>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <Card
    sx={{
      p: 2,
      borderRadius: 3,
      bgcolor: "background.paper",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "all 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar
        sx={{
          bgcolor: `${color}20`,
          color: color,
          width: 48,
          height: 48,
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {value ?? "-"}
        </Typography>
      </Box>
    </Box>
  </Card>
);

const ProgressCard = ({ title, value, color }) => (
  <Card
    sx={{
      p: 2,
      borderRadius: 3,
      bgcolor: "background.paper",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "all 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      },
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
          bgcolor: `${color}20`,
          "& .MuiLinearProgress-bar": {
            bgcolor: color,
            borderRadius: 5,
            backgroundImage: `linear-gradient(45deg, ${color} 30%, ${color}99 90%)`,
          },
        }}
      />
      <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 60 }}>
        {value ?? 0}%
      </Typography>
    </Box>
  </Card>
);

const CustomTooltip = ({ payload, theme }) => {
  if (!payload || payload.length === 0) return null;
  
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: theme.shadows[3],
        p: 1.5,
      }}
    >
      <Typography variant="body2" fontWeight={600}>
        {payload[0].name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Value: {payload[0].value}
      </Typography>
      <Box
        sx={{
          mt: 1,
          height: 2,
          width: "100%",
          bgcolor: payload[0].payload.fill,
        }}
      />
    </Box>
  );
};

const ChartCenterLabel = ({ label, subLabel, theme }) => (
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
      variant="h4"
      sx={{
        fontWeight: 800,
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {label}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {subLabel}
    </Typography>
  </Box>
);

const LoadingSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="rounded" height={400} sx={{ mb: 3 }} />
    <Grid container spacing={3}>
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} md={4} key={item}>
          <Skeleton variant="rounded" height={200} />
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default StudentAnalytics;