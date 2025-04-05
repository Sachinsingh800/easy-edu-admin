// UpdateParentAccessModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Stack,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { Close, Subject, Schedule, Delete } from "@mui/icons-material";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateParentAccessModal = ({
  open,
  onClose,
  classId,
  parentId,
  className,
  batchdata,
}) => {
  const [remainingExistingEnrollments, setRemainingExistingEnrollments] =
    useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState({
    existing: true,
    subjects: false,
    batches: false,
    students: false,
    updating: false,
  });

  const token = Cookies.get("token");
  useEffect(() => {
    if (open) {
      fetchExistingAccess();
      fetchSubjects();
      // Reset selection when modal opens
      setSelectedSubject("");
      setSelectedBatch("");
      setSelectedStudents([]);
    }
  }, [open]);

  const fetchExistingAccess = async () => {
    try {
      const response = await axios.get(
        "https://lmsapp-plvj.onrender.com/admin/offline/parent/access/getAll",
        {
          params: { className },
          headers: { "x-admin-token": token },
        }
      );
      const parentAccess = response.data.data.find(
        (access) => access.parentId._id === parentId
      );
      setRemainingExistingEnrollments(
        parentAccess?.studentBatchEnrollment || []
      );
    } catch (error) {
      console.error("Failed to fetch existing access:", error);
    } finally {
      setLoading((prev) => ({ ...prev, existing: false }));
    }
  };

  const fetchSubjects = async () => {
    setLoading((prev) => ({ ...prev, subjects: true }));
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/subject/getAll/${classId}`,
        { headers: { "x-admin-token": token } }
      );
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    } finally {
      setLoading((prev) => ({ ...prev, subjects: false }));
    }
  };

  const fetchBatches = async (subjectId) => {
    setLoading((prev) => ({ ...prev, batches: true }));
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/batchYear/getAll/${subjectId}`,
        { headers: { "x-admin-token": token } }
      );
      setBatches(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    } finally {
      setLoading((prev) => ({ ...prev, batches: false }));
    }
  };

  const fetchStudents = async (batchId) => {
    setLoading((prev) => ({ ...prev, students: true }));
    try {
      const response = await axios.get(
        `https://lmsapp-plvj.onrender.com/admin/offline/class-subject-year-student/enrollStudent/getAll/${batchId}`,
        { headers: { "x-admin-token": token } }
      );
      // Filter out already enrolled students
      const filteredStudents = response.data.data.filter(
        (student) =>
          !remainingExistingEnrollments.some((e) => e._id === student._id)
      );
      setStudents(filteredStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading((prev) => ({ ...prev, students: false }));
    }
  };

  const handleRemoveExisting = (enrollmentId) => {
    setRemainingExistingEnrollments((prev) =>
      prev.filter((e) => e._id !== enrollmentId)
    );
  };

  const handleUpdateAccess = async () => {
    setLoading((prev) => ({ ...prev, updating: true }));
    try {
      await axios.put(
        `https://lmsapp-plvj.onrender.com/admin/offline/parent/access/update/${parentId}`,
        {
          studentBatchEnrollment: [
            ...remainingExistingEnrollments.map((e) => e._id),
            ...selectedStudents,
          ],
        },
        { headers: { "x-admin-token": token } }
      );
      onClose(true);
    } catch (error) {
      console.error("Failed to update access:", error);
    } finally {
      setLoading((prev) => ({ ...prev, updating: false }));
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        Update Parent Access
        <IconButton
          onClick={() => onClose(false)}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Current Enrollments Section */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Current Enrollments
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {remainingExistingEnrollments.map((enrollment) => (
              <Chip
                key={enrollment._id}
                label={enrollment.studentName}
                onDelete={() => handleRemoveExisting(enrollment._id)}
                deleteIcon={<Delete />}
                variant="outlined"
                sx={{ mb: 1 }}
              />
            ))}
            {remainingExistingEnrollments.length === 0 && (
              <Typography variant="body2" color="textSecondary">
                No existing enrollments
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Add New Enrollments Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add New Enrollments
          </Typography>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  fetchBatches(e.target.value);
                }}
                label="Subject"
                startAdornment={
                  <Subject sx={{ color: "action.active", mr: 1 }} />
                }
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.subjectName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Batch</InputLabel>
              <Select
                value={selectedBatch}
                onChange={(e) => {
                  setSelectedBatch(e.target.value);
                  fetchStudents(e.target.value);
                }}
                label="Batch"
                disabled={!selectedSubject}
                startAdornment={
                  <Schedule sx={{ color: "action.active", mr: 1 }} />
                }
              >
                {batches.map((batch) => (
                  <MenuItem key={batch._id} value={batch._id}>
                    {batch.batchYear}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Students</InputLabel>
              <Select
                multiple
                value={selectedStudents}
                onChange={(e) => setSelectedStudents(e.target.value)}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {selected.map((studentId) => {
                      const student = students.find((s) => s._id === studentId);
                      return (
                        <Chip
                          key={studentId}
                          label={student?.studentName || "Unknown Student"}
                          variant="outlined"
                        />
                      );
                    })}
                  </Stack>
                )}
              >
                {students.map((student) => (
                  <MenuItem key={student._id} value={student._id}>
                    <Checkbox
                      checked={selectedStudents.includes(student._id)}
                    />
                    <ListItemText primary={student.studentName} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button
          onClick={handleUpdateAccess}
          variant="contained"
          disabled={loading.updating}
        >
          {loading.updating ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateParentAccessModal;
