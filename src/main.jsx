import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import CreateRoom from "./component/pages/CreateRoom.jsx";
import Game from "./component/gamePage/game.jsx";
import Room from "./component/pages/Room.jsx";

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
     <Routes>
      <Route path="/" element={<App />} />
      <Route path="/create-room" element={<CreateRoom />} />
       <Route path="/game" element={<Game />} />
       <Route path="/Room" element={<Room />} />
    </Routes>
  </BrowserRouter>
)
