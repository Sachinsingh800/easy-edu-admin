// src/services/api.js
import axios from "axios";

const API_BASE = "https://lmsapp-plvj.onrender.com/admin/offline";

export const getClasses = (token) =>
  axios.get(`${API_BASE}/class-subject-year-student/class/getAll`, {
    headers: { "x-admin-token": token },
  });

export const getSubjects = (classId, token) =>
  axios.get(
    `${API_BASE}/class-subject-year-student/subject/getAll/${classId}`,
    {
      headers: { "x-admin-token": token },
    }
  );

export const getBatches = (subjectId, token) =>
  axios.get(
    `${API_BASE}/class-subject-year-student/batchYear/getAll/${subjectId}`,
    {
      headers: { "x-admin-token": token },
    }
  );

export const getStudents = (batchId, token) =>
  axios.get(
    `${API_BASE}/class-subject-year-student/enrollStudent/getAll/${batchId}`,
    {
      headers: { "x-admin-token": token },
    }
  );

export const getAnalytics = (batchId, studentId, token) =>
  axios.get(`${API_BASE}/student/attendance/anlytics/${batchId}/${studentId}`, {
    headers: { "x-admin-token": token },
  });
export const getAttendenceAnalytics = (batchId, studentId, token) =>
  axios.get(`${API_BASE}/student/attendance/list/${batchId}/${studentId}`, {
    headers: { "x-admin-token": token },
  });
export const getCwAnalytics = (batchId, studentId, token) =>
  axios.get(`${API_BASE}/student/cw/anlytics/${batchId}/${studentId}`, {
    headers: { "x-admin-token": token },
  });
export const getHwAnalytics = (batchId, studentId, token) =>
  axios.get(`${API_BASE}/student/hw/anlytics/${batchId}/${studentId}`, {
    headers: { "x-admin-token": token },
  });
export const getCwList = (batchId, studentId, token) =>
  axios.get(`${API_BASE}/student/cw/list/${batchId}/${studentId}`, {
    headers: { "x-admin-token": token },
  });
export const getHwList = (batchId, studentId, token) =>
  axios.get(`${API_BASE}/student/hw/list/${batchId}/${studentId}`, {
    headers: { "x-admin-token": token },
  });
export const getTestAnalytics = (batchId, studentId, token) =>
  axios.get(
    `${API_BASE}/student/testResults/anlytics/${batchId}/${studentId}`,
    {
      headers: { "x-admin-token": token },
    }
  );
export const getTestList = (batchId, studentId, token) =>
  axios.get(`${API_BASE}/student/testResults/list/${batchId}/${studentId}`, {
    headers: { "x-admin-token": token },
  });
export const getPtmAnalytics = (batchId, studentId, token) =>
  axios.get(`${API_BASE}/student/ptm/anlytics/${batchId}/${studentId}`, {
    headers: { "x-admin-token": token },
  });
export const getPtmList = (batchId, studentId, token) =>
  axios.get(`${API_BASE}/student/ptm/list/${batchId}/${studentId}`, {
    headers: { "x-admin-token": token },
  });
export const getFeedbackAnalytics = (batchId, studentId, token) =>
  axios.get(`${API_BASE}/student/feedBack/anlytics/${batchId}/${studentId}`, {
    headers: { "x-admin-token": token },
  });
export const getFeedbackList = (batchId, studentId, token) =>
  axios.get(`${API_BASE}/student/feedBack/list/${batchId}/${studentId}`, {
    headers: { "x-admin-token": token },
  });
