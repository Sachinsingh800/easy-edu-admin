import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  List,
  ListItem,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Cookies from "js-cookie";
import axios from "axios";

const UpdateBatchDescription = ({ open, handleClose, batchDetails,clsId }) => {
  const [formData, setFormData] = useState({
    batchIncludes: [],
    courseDuration: { startDate: "", endDate: "" },
    validity: "",
    knowYourTeachers: [], // Default teachers
    schedule: [],
    otherDetails: [],
    faq: [],
    subjects: "",
  });

  const [subjectsList, setSubjectsList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState(
    formData.knowYourTeachers
  );
  const [error, setError] = useState(""); // State to store the error messa

  useEffect(() => {
    if (batchDetails) {
      // Ensure the batchDetails contains the teacher objects and map correctly
      const teacherIds = batchDetails.knowYourTeachers?.map(
        (teacher) => teacher.teacherId
      );
      setSelectedTeachers(teacherIds)
      setFormData({
        batchIncludes: batchDetails.batchIncludes,
        courseDuration: batchDetails.courseDuration,
        validity: batchDetails.validity,
        knowYourTeachers: teacherIds, // This should now be just an array of teacher IDs
        schedule: batchDetails.schedule.map((scheduleItem) => ({
          subject: scheduleItem.subjectId,
        })),
        otherDetails: batchDetails.otherDetails,
        faq: batchDetails.faq.map((faqItem) => ({
          que: faqItem.question,
          ans: faqItem.answer,
        })),
        subjects: batchDetails.subjects.join(", "),
      });
    }
}, [batchDetails]);


  const handleInputChange = (key, value) => {
    setInputValue(value);
  };

  const handleAddItem = () => {
    if (!inputValue.trim()) return; // Prevent empty input

    const newItems = inputValue.split(",").map((item) => item.trim()); // Split and trim input items
    setFormData((prev) => ({
      ...prev,
      batchIncludes: [...newItems, ...prev.batchIncludes], // Add new items at the top
    }));

    setInputValue(""); // Clear the input field after adding
  };

  const handleRemoveItem = (index) => {
    const updatedBatchIncludes = [...formData.batchIncludes];
    updatedBatchIncludes.splice(index, 1);
    setFormData({ ...formData, batchIncludes: updatedBatchIncludes });
  };

  useEffect(() => {
    const token = Cookies.get("token");
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          `https://lmsapp-plvj.onrender.com/admin/subjects/getAll?clsId=${clsId}`,
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        setSubjectsList(response.data.data || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          "https://lmsapp-plvj.onrender.com/admin/teachers/getAll",
          {
            headers: {
              "x-admin-token": token,
            },
          }
        );
        setTeachersList(response.data.data || []);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };

    fetchTeachers();
  }, []);
  const handleSubmit = async () => {
    const token = Cookies.get("token");
    const url = `https://lmsapp-plvj.onrender.com/admin/batches/discription/update/${batchDetails._id}`;

    try {
      // Create a new FormData object
      const formDataToSend = new FormData();

      // Prepare the schedule array
      const scheduleData = formData.schedule.map((item) => ({
        subject: item.subject, // Keep only the subject for JSON
      }));

      // Append the schedule array as JSON string
      formDataToSend.append("schedule", JSON.stringify(scheduleData));

      // Append each PDF file separately with indexed keys
      formData.schedule.forEach((item, index) => {
        if (item.pdf && item.pdf instanceof File) {
          formDataToSend.append(`schedule[${index}].pdf`, item.pdf); // Attach PDF file
        }
      });

      // Append other form data fields
      formDataToSend.append(
        "batchIncludes",
        JSON.stringify(formData.batchIncludes)
      );
      formDataToSend.append(
        "courseDuration",
        JSON.stringify(formData.courseDuration)
      );
      formDataToSend.append("validity", formData.validity);
      formDataToSend.append(
        "knowYourTeachers",
        JSON.stringify(formData.knowYourTeachers)
      );
      formDataToSend.append(
        "otherDetails",
        JSON.stringify(formData.otherDetails)
      );
      formDataToSend.append("faq", JSON.stringify(formData.faq));
      formDataToSend.append("subjects", formData.subjects);

      // Send the request
      const response = await axios.put(url, formDataToSend, {
        headers: {
          "x-admin-token": token,
          "Content-Type": "multipart/form-data", // Required for file uploads
        },
      });

      // Reset form data and close the modal
      setFormData({
        batchIncludes: [],
        courseDuration: { startDate: "", endDate: "" },
        validity: "",
        knowYourTeachers: [],
        schedule: [],
        otherDetails: [],
        faq: [],
        subjects: "",
      });
      setError(""); // Clear any previous error
      handleClose();
    } catch (error) {
      // Handle errors
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message); // Display the backend error message
      } else {
        setError("Something went wrong. Please try again."); // Default error message
      }
    }
  };

  const handleNestedChange = (section, index, field, value) => {
    const updatedSection = [...formData[section]];
    updatedSection[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      [section]: updatedSection,
    }));
  };

  const handleRemoveSchedule = (index) => {
    const newSchedule = formData.schedule.filter((_, i) => i !== index);
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleFileChange = (index, file) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index].pdf = file;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleAddSchedule = () => {
    const newSchedule = [...formData.schedule, { subject: "", pdf: null }];
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleTeacherChange = (e) => {
    const selectedTeacherId = e.target.value;
    if (!selectedTeachers.includes(selectedTeacherId)) {
      const newSelectedTeachers = [...selectedTeachers, selectedTeacherId];
      setSelectedTeachers(newSelectedTeachers);
      setFormData((prevData) => ({
        ...prevData,
        knowYourTeachers: newSelectedTeachers,
      }));
    }
  };

  const handleRemoveTeacher = (teacherId) => {
    const newSelectedTeachers = selectedTeachers.filter(
      (id) => id !== teacherId
    );
    setSelectedTeachers(newSelectedTeachers);
    setFormData((prevData) => ({
      ...prevData,
      knowYourTeachers: newSelectedTeachers,
    }));
  };

  // Handler for updating the `otherDetails` array
  const handleDetailChange = (index, value) => {
    const updatedDetails = [...formData.otherDetails];
    updatedDetails[index] = value;
    setFormData((prevData) => ({
      ...prevData,
      otherDetails: updatedDetails,
    }));
  };

  // Handler for adding a new detail
  const handleAddDetail = () => {
    setFormData((prevData) => ({
      ...prevData,
      otherDetails: [...prevData.otherDetails, ""],
    }));
  };

  // Handler for removing a detail
  const handleRemoveDetail = (index) => {
    const updatedDetails = formData.otherDetails.filter(
      (_, idx) => idx !== index
    );
    setFormData((prevData) => ({
      ...prevData,
      otherDetails: updatedDetails,
    }));
  };

  // Handler to update a specific field in an array (used for FAQ)
  const handleFaqNestedChange = (field, index, subfield, value) => {
    const updatedData = [...formData[field]];
    updatedData[index][subfield] = value;
    setFormData((prevData) => ({
      ...prevData,
      [field]: updatedData,
    }));
  };

  // Handler to add a new FAQ item
  const handleFaqAddItem = (field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: [...prevData[field], { que: "", ans: "" }],
    }));
  };

  // Handler to remove an FAQ item
  const handleFaqRemoveItem = (field, index) => {
    const updatedData = formData[field].filter((_, idx) => idx !== index);
    setFormData((prevData) => ({
      ...prevData,
      [field]: updatedData,
    }));
  };

  // Convert comma-separated subjects into an array for easier rendering
  const subjectList = formData.subjects
    .split(",")
    .map((subject) => subject.trim());
  // Handle the addition of a subject from the dropdown
  const handleAddSubject = (subjectId) => {
    const selectedSubject = subjectsList.find(
      (subject) => subject._id === subjectId
    );
    if (selectedSubject) {
      setFormData((prevData) => ({
        ...prevData,
        subjects: prevData.subjects
          ? `${prevData.subjects}, ${selectedSubject.subjectName}`
          : selectedSubject.subjectName, // If subjects are empty, just set the first subject
      }));
    }
  };

  // Function to remove a subject from the list
  const handleRemoveSubject = (subject) => {
    setFormData((prevData) => ({
      ...prevData,
      subjects: prevData.subjects
        .split(",")
        .filter((item) => item.trim() !== subject)
        .join(", "),
    }));
  };

  // Handle changes in form data
  const handleDateInputChange = (field, newValue) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: newValue,
    }));
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: 800,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflowY: "scroll",
          height: "95vh",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Update Batch Description
        </Typography>

        <Box
          sx={{
            margin: "auto",
            padding: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {/* Title */}
          <Typography variant="h5" gutterBottom>
            Batch Includes
          </Typography>
          {/* Input Field and Add Button */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mt: 2,
            }}
          >
            <TextField
              label="Enter items (comma-separated)"
              value={inputValue}
              onChange={(e) =>
                handleInputChange("batchIncludes", e.target.value)
              }
              fullWidth
              placeholder="e.g., Video Lectures, Assignments, Exams"
              variant="outlined"
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleAddItem}
              sx={{ fontWeight: "bold", px: 3 }}
            >
              Add
            </Button>
          </Box>

          {/* Batch Includes List */}
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "text.primary", fontWeight: "bold" }}
            >
              Added Items:
            </Typography>

            {formData.batchIncludes.length > 0 ? (
              <List sx={{ bgcolor: "background.default", borderRadius: 2 }}>
                {formData.batchIncludes.map((item, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #e0e0e0",
                      px: 2,
                      py: 1,
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {item}
                    </Typography>

                    {/* Remove Icon */}
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2, fontStyle: "italic" }}
              >
                No items added yet. Start by adding items above!
              </Typography>
            )}
          </Box>
        </Box>
        <br />
        <Box
          sx={{
            margin: "auto",
            padding: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {/* Course Duration Section */}
          <Typography variant="h5" gutterBottom>
            Course Duration
          </Typography>

          {/* Start Date and End Date Fields */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              label="Start Date"
              type="date"
              value={formData.courseDuration.startDate}
              onChange={(e) =>
                handleDateInputChange("courseDuration", {
                  ...formData.courseDuration,
                  startDate: e.target.value,
                })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: "background.default",
                borderRadius: 1,
              }}
            />
            <TextField
              label="End Date"
              type="date"
              value={formData.courseDuration.endDate}
              onChange={(e) =>
                handleDateInputChange("courseDuration", {
                  ...formData.courseDuration,
                  endDate: e.target.value,
                })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: "background.default",
                borderRadius: 1,
              }}
            />
          </Box>
        </Box>
        <br />
        <Box
          sx={{
            margin: "auto",
            padding: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {/* Title */}
          <Typography variant="h5" gutterBottom>
            Validity
          </Typography>

          <TextField
            label="Validity"
            type="date"
            value={formData.validity}
            onChange={(e) => handleDateInputChange("validity", e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <br />
        <Box
          sx={{
            margin: "auto",
            padding: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {/* Title */}
          <Typography variant="h5" gutterBottom>
            know Your Teachers
          </Typography>
          {/* Teacher Select */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="teacher-select-label">Select Teacher</InputLabel>
            <Select
              labelId="teacher-select-label"
              value=""
              onChange={handleTeacherChange}
              renderValue={() => ""}
            >
              {teachersList.map((teacher) => (
                <MenuItem key={teacher?._id} value={teacher?._id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <img
                      src={teacher?.pic?.url}
                      alt={teacher?.teacherName}
                      style={{ width: 32, height: 32, borderRadius: "50%" }}
                    />
                    <Box>
                      <Typography variant="body1">
                        {teacher?.teacherName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {teacher?.expertise}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Display Selected Teachers */}
          <Box sx={{ mt: 3 }}>
            {selectedTeachers.map((teacherId) => {
              const teacher = teachersList.find((t) => t._id === teacherId);
              return (
                <Box
                  key={teacher?._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                    padding: 2,
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                >
                  <img
                    src={teacher?.pic?.url}
                    alt={teacher?.teacherName}
                    style={{ width: 48, height: 48, borderRadius: "50%" }}
                  />
                  <Box>
                    <Typography variant="h6">{teacher?.teacherName}</Typography>
                    <Typography variant="body2">
                      Expertise: {teacher?.expertise}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Experience: {teacher?.yearOfEx} years
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveTeacher(teacher?._id)}
                  >
                    Remove
                  </Button>
                </Box>
              );
            })}
          </Box>
        </Box>
        <br />
        <Box
          sx={{
            margin: "auto",
            padding: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {/* Title */}
          <Typography variant="h5" gutterBottom>
            Schedule
          </Typography>
          {formData.schedule.map((item, index) => (
            <Box
              key={index}
              sx={{ mt: 2, border: "1px solid #ccc", p: 2, borderRadius: 2 }}
            >
              {/* Subject Selector */}
              <FormControl fullWidth margin="normal">
                <InputLabel id={`subject-select-label-${index}`}>
                  Select Subject
                </InputLabel>
                <Select
                  labelId={`subject-select-label-${index}`}
                  value={item.subject}
                  onChange={(e) =>
                    handleNestedChange(
                      "schedule",
                      index,
                      "subject",
                      e.target.value
                    )
                  }
                  renderValue={(selected) => {
                    const selectedSubject = subjectsList.find(
                      (sub) => sub._id === selected
                    );
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <img
                          src={selectedSubject?.icon?.url}
                          alt={selectedSubject?.subjectName}
                          style={{ width: 24, height: 24, borderRadius: "50%" }}
                        />
                        <span>{selectedSubject?.subjectName}</span>
                      </Box>
                    );
                  }}
                >
                  {subjectsList.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <img
                          src={subject.icon.url}
                          alt={subject.subjectName}
                          style={{ width: 24, height: 24, borderRadius: "50%" }}
                        />
                        <span>{subject.subjectName}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {/* PDF Upload */}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{ mt: 1 }}
                >
                  Upload PDF
                  <input
                    type="file"
                    hidden
                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                  />
                </Button>
                {item.pdf && (
                  <Typography variant="body2" color="textSecondary">
                    {item.pdf.name}
                  </Typography>
                )}

                {/* Remove Schedule Entry */}
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ mt: 2 }}
                  onClick={() => handleRemoveSchedule(index)}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ))}

          {/* Add Schedule Entry */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={handleAddSchedule}
          >
            Add Schedule
          </Button>
        </Box>
        <br />

        <Box
          sx={{
            margin: "auto",
            padding: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {/* Title */}
          <Typography variant="h5" gutterBottom>
            Other Details
          </Typography>
          <br />
          {formData.otherDetails.map((detail, index) => (
            <Box
              key={index}
              sx={{ mb: 2, display: "flex", alignItems: "center" }}
            >
              <TextField
                fullWidth
                value={detail}
                onChange={(e) => handleDetailChange(index, e.target.value)}
                label={`Detail ${index + 1}`}
                variant="outlined"
                multiline
                rows={3}
                sx={{ mr: 2 }}
              />
              {/* Remove button */}
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveDetail(index)}
              >
                Remove
              </Button>
            </Box>
          ))}

          {/* Button to add a new detail */}
          <Button variant="contained" onClick={handleAddDetail} sx={{ mt: 2 }}>
            Add Detail
          </Button>
        </Box>

        <br />
        <Box
          sx={{
            margin: "auto",
            padding: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {/* Title */}
          <Typography variant="h5" gutterBottom>
            Faq
          </Typography>
          {formData.faq.map((item, index) => (
            <Box
              key={index}
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <TextField
                label={`Question ${index + 1}`}
                value={item.que}
                onChange={(e) =>
                  handleFaqNestedChange("faq", index, "que", e.target.value)
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label={`Answer ${index + 1}`}
                value={item.ans}
                onChange={(e) =>
                  handleFaqNestedChange("faq", index, "ans", e.target.value)
                }
                fullWidth
                margin="normal"
              />
              {/* Remove button */}
              <IconButton
                variant="outlined"
                color="error"
                onClick={() => handleFaqRemoveItem("faq", index)}
                sx={{ alignSelf: "center" }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleFaqAddItem("faq")}
            >
              Add FAQ
            </Button>
          </Box>
        </Box>
        <br />
        <Box
          sx={{
            margin: "auto",
            padding: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Manage Subjects
          </Typography>

          {/* Subject select dropdown */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Select a Subject</Typography>
            <Select
              label="Select Subject"
              fullWidth
              onChange={(e) => handleAddSubject(e.target.value)} // Add subject on change
            >
              {subjectsList.map((subject) => (
                <MenuItem key={subject._id} value={subject._id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <img
                      src={subject.icon.url}
                      alt={subject.subjectName}
                      style={{ width: 24, height: 24, borderRadius: "50%" }}
                    />
                    <span>{subject.subjectName}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </Box>
          {!subjectList[0] == [""] && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Current Subjects:</Typography>
              <br />
              <ul>
                {subjectList.map((subject, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      margin: "5px",
                    }}
                  >
                    <span>{subject}</span>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleRemoveSubject(subject)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Box>
        <br />
        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </Box>
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </Box>
    </Modal>
  );
};

export default UpdateBatchDescription;
