import { 
    Box, Button, Paper, Typography, Dialog, DialogTitle, 
    DialogContent, DialogActions, Pagination, FormControl, InputLabel, Select, MenuItem,
    TextField, InputAdornment, IconButton
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

import axios from "axios";
import { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";

export default function ViewReminder() {

    const [reminders, setReminders] = useState([]);
    const [openPopup, setOpenPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("");
    const [popupAudioPath, setPopupAudioPath] = useState("");
    const triggered = useRef(new Set());
    const audioRef = useRef(null);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPlayingId, setCurrentPlayingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/reminder/get");
            setReminders(res.data);
        } catch (e) {
            console.log("Load error:", e);
        }
    };

    // ⏰ Popup trigger
    useEffect(() => {

        if (reminders.length === 0) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();

            reminders.forEach(r => {
                if (!r.dateTime) return;

                const reminderTime = new Date(r.dateTime).getTime();

                if (triggered.current.has(r.id)) return;

                if (now >= reminderTime && now - reminderTime < 3000) {

                    triggered.current.add(r.id);

                    // set popup values
                    setPopupTitle(r.title);
                    setPopupAudioPath(r.voicePath);
                    setOpenPopup(true);

                    // auto-play audio
                    autoPlayAudio(r.voicePath);
                }
            });

        }, 1000);

        return () => clearInterval(timer);

    }, [reminders]);

    // filtered reminders based on search
    const filteredReminders = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return reminders;
        return reminders.filter(r => {
            const title = (r.title || "").toString().toLowerCase();
            const desc = (r.description || "").toString().toLowerCase();
            const id = (r.id || "").toString();
            const dt = (r.dateTime ? new Date(r.dateTime).toLocaleString() : "").toLowerCase();
            return title.includes(q) || desc.includes(q) || id.includes(q) || dt.includes(q);
        });
    }, [reminders, searchQuery]);

    // keep current page valid when filtered reminders or rowsPerPage change
    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredReminders.length / rowsPerPage));
        if (page > totalPages) setPage(totalPages);
    }, [filteredReminders, rowsPerPage]);


    // 🔥 AUDIO PLAYER (correct path)
    // `id` is optional; when provided we'll mark that id as playing
    const autoPlayAudio = (voicePath, id = null) => {
        if (!voicePath) return;

        const finalUrl = `http://localhost:8080/api/reminder/uploads/${voicePath}`;
        console.log("PLAYING (audio tag):", finalUrl);

        // ensure audio element exists
        const a = audioRef.current;
        if (!a) {
            console.warn('Audio element not mounted yet');
            return;
        }

        // pause current playback if any
        try {
            if (!a.paused) {
                a.pause();
                a.currentTime = 0;
            }
        } catch (e) {}

        a.src = finalUrl;
        a.load();

        a.play().catch(err => {
            console.log("Autoplay blocked → waiting for user click (audio tag)");

            const unlock = () => {
                a.play().catch(() => {});
                document.body.removeEventListener("click", unlock);
            };

            document.body.addEventListener("click", unlock, { once: true });
        });

        // mark playing id (or 'popup' when no id provided)
        setCurrentPlayingId(id || 'popup');
    };

    // Toggle play/pause for a row (single click behavior)
    const togglePlay = (voicePath, id) => {
        if (!voicePath) return;
        const a = audioRef.current;
        if (!a) return;

        const finalUrl = `http://localhost:8080/api/reminder/uploads/${voicePath}`;

        // if same file is currently playing -> pause it
        const isSameSourcePlaying = a.src && a.src.includes(voicePath) && !a.paused;
        if (isSameSourcePlaying) {
            try { a.pause(); a.currentTime = 0; } catch (e) {}
            setCurrentPlayingId(null);
            return;
        }

        // otherwise stop any existing audio and start this one
        try { if (!a.paused) { a.pause(); a.currentTime = 0; } } catch (e) {}

        a.src = finalUrl;
        a.load();
        a.play().then(() => setCurrentPlayingId(id)).catch(() => {
            // if autoplay blocked, attach one-time click unlock
            const unlock = () => { a.play().catch(() => {}); document.body.removeEventListener('click', unlock); };
            document.body.addEventListener('click', unlock, { once: true });
            setCurrentPlayingId(id);
        });
    };

    // Top control handlers (visible controls at page top)
    const topPlay = () => {
        const a = audioRef.current;
        if (!a) return;

        // resume if there's a source and it's paused
        if (a.src && a.paused) {
            a.play().catch(() => {});
            return;
        }

        // otherwise start first available voice from filteredReminders
        const first = filteredReminders.find(r => r.voicePath);
        if (!first || !first.voicePath) return;
        const finalUrl = `http://localhost:8080/api/reminder/uploads/${first.voicePath}`;
        try { if (!a.paused) { a.pause(); a.currentTime = 0; } } catch (e) {}
        a.src = finalUrl;
        a.load();
        a.play().then(() => setCurrentPlayingId(first.id)).catch(() => {
            const unlock = () => { a.play().catch(() => {}); document.body.removeEventListener('click', unlock); };
            document.body.addEventListener('click', unlock, { once: true });
            setCurrentPlayingId(first.id);
        });
    };

    const topPause = () => {
        const a = audioRef.current;
        if (!a) return;
        try { a.pause(); } catch (e) {}
    };

    const topStop = () => {
        const a = audioRef.current;
        if (!a) return;
        try { a.pause(); a.currentTime = 0; a.src = ''; } catch (e) {}
        setCurrentPlayingId(null);
    };


    // OK button → guaranteed play
    const handlePopupOk = () => {
        setOpenPopup(false);
        autoPlayAudio(popupAudioPath);
    };

    const deleteReminder = async (id) => {
        await axios.delete(`http://localhost:8080/api/reminder/delete/${id}`);
        loadData();
    };

    return (

        
        
        <Box sx={{ p: 3, width: "100%", display: "flex", flexDirection: "column", alignItems: "center",marginLeft :"30px" }}>
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: "center",
                        color: "white",
                        marginTop: "10px",
                        textShadow: "1px 1px 5px white",
                        fontFamily: "sans-serif",
                        fontWeight: "700"
                    }}
                >
                    Reminder List
                </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "85vw", mb: 2 }}>
                <Link to="/" style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>
                    Create New Reminder ⏪
                </Link>
                <TextField
                    size="small"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                    sx={{
                        mt:"20px",
                          ml:"-90px", 
                        width: 400,
                        '& .MuiOutlinedInput-root': { color: 'white', background: 'rgba(255,255,255,0.04)', borderRadius: '24px' },
                        '& .MuiInputBase-input': { color: 'white' },
                        '& .MuiInputBase-input::placeholder': { opacity: 0 }
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton size="small" sx={{ color: 'white', border: 'none', '&:hover': { background: 'transparent' } }}>
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
                <Button variant="contained" onClick={loadData}>Refresh</Button>
            </Box>

            <Paper sx={{ marginTop: "28px", width: "85vw", backgroundColor: 'transparent', boxShadow: 'none', overflow: 'hidden' }}>
                <table
                    width="100%"
                    style={{
                        borderCollapse: "collapse",
                        backgroundColor: 'transparent',
                        color: 'white',
                        fontFamily: 'sans-serif',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ color: 'white', fontSize: '18px', fontWeight: 700, padding: '12px', textAlign: 'center',backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>S.No</th>
                            <th style={{ color: 'white', fontSize: '18px', fontWeight: 700, padding: '12px', textAlign: 'center',backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>ID</th>
                            <th style={{ color: 'white', fontSize: '18px', fontWeight: 700, padding: '12px', textAlign: 'center',backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>Title</th>
                            <th style={{ color: 'white', fontSize: '18px', fontWeight: 700, padding: '12px', textAlign: 'center',backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>Description</th>
                            <th style={{ color: 'white', fontSize: '18px', fontWeight: 700, padding: '12px', textAlign: 'center',backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>Date & Time</th>
                            <th style={{ color: 'white', fontSize: '18px', fontWeight: 700, padding: '12px', textAlign: 'center',backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/** Paginate the reminders list */}
                        {filteredReminders
                            .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                            .map((r, i) => (
                            <tr key={r.id}>
                                <td style={{ color: 'white', fontSize: '16px', padding: '12px', textAlign: 'center' }}>{(page - 1) * rowsPerPage + i + 1}</td>
                                <td style={{ color: 'white', fontSize: '16px', padding: '12px', textAlign: 'center' }}>{r.id}</td>
                                <td style={{ color: 'white', fontSize: '16px', padding: '12px', textAlign: 'center' }}>{r.title}</td>
                                <td style={{ color: 'white', fontSize: '16px', padding: '12px', textAlign: 'center' }}>{r.description}</td>
                                <td style={{ color: 'white', fontSize: '16px', padding: '12px', textAlign: 'center' }}>{new Date(r.dateTime).toLocaleString()}</td>
                                <td style={{ padding: '12px' }}>
                                    <Button 
                                        sx={{ mr: 4 }}
                                        color="error" 
                                        variant="contained"
                                        onClick={() => deleteReminder(r.id)}
                                    >
                                        Delete 🗑️
                                    </Button>

                                    {r.voicePath && (
                                        <Button sx={{ ml: 3, color: 'white' , background: 'rgb(32,32,32)',borderRadius:"50px",fontWeight: "bold" }} onClick={() => togglePlay(r.voicePath, r.id)}>
                                            {currentPlayingId === r.id ? 'Pause' : 'Play'} 
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* pagination controls */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, p: 1 }}>
                    {/* <FormControl sx={{ minWidth: 120 }} size="small">
                        <InputLabel sx={{ color: 'white' }}>Rows</InputLabel>
                        <Select
                            value={rowsPerPage}
                            label="Rows"
                            onChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(1); }}
                            sx={{ color: 'white' }}
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                        </Select>
                    </FormControl> */}

                    <Pagination
                        count={Math.max(1, Math.ceil(filteredReminders.length / rowsPerPage))}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                        sx={{ '& .MuiPaginationItem-root': { color: 'white' } }}
                    />
                </Box>
            </Paper>

            {/* hidden audio element used for playback so we can pause via tag */}
            <audio ref={audioRef} style={{ display: 'visible' }} onEnded={() => setCurrentPlayingId(null)} />

            {/* POPUP */}
            <Dialog open={openPopup}>
                <DialogTitle>Reminder</DialogTitle>

                <DialogContent>
                    <Typography variant="h6">{popupTitle}</Typography>
                </DialogContent>

                <DialogActions>
                    <Button variant="contained" onClick={handlePopupOk}>OK</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
