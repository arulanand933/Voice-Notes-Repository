import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ReminderUpload from './pages/ReminderUpload'
import ViewReminder from './pages/ViewReminder'

import BackGroundVideo from "./component/BackGroundVideo.jsx";
import "./component/BackGroundVideo.css";


function App() {
  return (
    <>
      <BackGroundVideo />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<ReminderUpload />} />
            <Route path='/view-reminders' element={<ViewReminder />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App;
