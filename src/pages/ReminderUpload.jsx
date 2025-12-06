import React, { useState } from "react";
import { Box, Button, TextField, Typography, Stack } from "@mui/material";
import axios from "axios";
import BackGroundVideo from '../component/BackGroundVideo.jsx';

export default function RemainderUpload() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dateTime: "",
    voiceNote: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleReset = () => {
    setFormData({
      title: "",
      description: "",
      dateTime: "",
      voiceNote: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("dateTime", formData.dateTime);  // already ISO from datetime-local

    if (formData.voiceNote) {
      data.append("voiceNote", formData.voiceNote);
    }

    try {
      await axios.post(
        "http://localhost:8080/api/reminder/add",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Reminder created successfully!");
      handleReset();
    } catch (err) {
      console.log(err);
      alert("Failed: " + (err.response?.data || err.message));
    }
  };

  return (
    <>
      <h1
        style={{
          textAlign: "center",
          color: "white",
          marginTop: "20px",
          textShadow: "1px 1px 5px white",
          fontFamily: "sans-serif"
        }}
      >
        Voice Notes Reminder
      </h1>

      <Box
        sx={{
          display: "flex",
          gap: 4,
          // flexWrap: "wrap",
          justifyContent: "center",
          fontFamily: 'sans-serif',
          fontSize: '16px'
        }}
      >
        {/* LEFT BOX */}
        <div className="glass-box">
          <Typography variant="h5" mb={3} sx={{ fontSize: '23px', fontWeight: 700 ,textAlign:"center"}}>Create Reminder</Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                fullWidth
                sx={{
                  '& .MuiInputBase-input': { color: 'white', fontFamily: 'sans-serif',fontSize: '16px' },
                  '& .MuiInputLabel-root': { color: 'white', fontFamily: 'sans-serif' ,fontSize: '16px'},
                  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
                }}
              />

              <TextField
                label="Description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                fullWidth
                sx={{
                  '& .MuiInputBase-input': { color: 'white', fontFamily: 'sans-serif',fontSize: '16px' },
                  '& .MuiInputLabel-root': { color: 'white', fontFamily: 'sans-serif' ,fontSize: '16px'},
                  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
                }}
              />

              <TextField
                type="datetime-local"
                label="Date & Time"
                name="dateTime"
                required
                value={formData.dateTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                  '& .MuiInputBase-input': { color: 'white', fontFamily: 'sans-serif',fontSize: '16px' },
                  '& .MuiInputLabel-root': { color: 'white', fontFamily: 'sans-serif' ,fontSize: '16px'},
                  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
                }}
              />
            </Stack>
          </form>
        </div>

        {/* RIGHT BOX */}
        <div className="glass-box">
          <Typography variant="h5" mb={3} sx={{ fontSize: '23px', fontWeight: 700 ,textAlign:"center"}}>Voice Note</Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontFamily: 'sans-serif',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                Upload Voice Note 🎙️
                <input
                  type="file"
                  name="voiceNote"
                  hidden
                  accept="audio/*"
                  onChange={handleChange}
                />
              </Button>

              {formData.voiceNote && (
                <Typography variant="body2" color="white">
                  Selected: {formData.voiceNote.name}
                </Typography>
              )}

              <Stack direction="row" spacing={2}>
                <Button type="submit" variant="contained" fullWidth>
                  Submit
                </Button>

                <Button
                  onClick={handleReset}
                  variant="contained"
                  color="error"
                  fullWidth
                >
                  Reset
                </Button>
              </Stack>

              <Button
                variant="text"
                href="/view-reminders"
                fullWidth
                sx={{
                  
                  color: 'white',
                  fontWeight: 700,
                  fontFamily: 'sans-serif',
                  border: '1px solid rgba(255, 255, 255, 0.69)',
                  backgroundColor: 'rgba(232, 232, 232, 0.4)',
                }}
              >
                View Reminders
              </Button>
            </Stack>
          </form>
        </div>
      </Box>
    </>
  );
}
