import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Room = () => {
  const [value, setValue] = useState({
    hostName: "",
    yourName: "",
    password: "",
    RoomId: ""
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handelChange = (e) => {
    const { name, value: val } = e.target;
    setValue((prev) => ({
      ...prev,
      [name]: val
    }));
  };

  // read participants from localStorage for given room
  const getParticipants = (roomId) => {
    try {
      return JSON.parse(localStorage.getItem(`room_${roomId}_participants`)) || [];
    } catch {
      return [];
    }
  };

  const handelSubmit = (e) => {
    e.preventDefault();

    const currentPlayers = getParticipants(value.RoomId);
    const maxPlayers = 4; // only allow 4

    if (currentPlayers.length >= maxPlayers) {
      alert("🚫 Room is full. You can't enter.");
      return;
    }

    // allow entering
    navigate("/create-room", {
      state: {
        roomId: value.RoomId,
        hostName: value.hostName,
        yourName: value.yourName,
        password: value.password
      }
    });
  };

  // If someone opens /Room?roomId=XYZ -> auto-redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomIdFromUrl = params.get("roomId");
    if (roomIdFromUrl) {
      setValue((prev) => ({ ...prev, RoomId: roomIdFromUrl }));
      navigate("/create-room", { state: { roomId: roomIdFromUrl } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <div className="home-container h-screen w-full bg-gradient-to-br from-amber-500 to-amber-700 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Enter in a Room to Play Game 🎮
        </h1>

        <form className="flex flex-col gap-5" onSubmit={handelSubmit}>
          {/* Host Name */}
          <label className="flex flex-col text-sm font-medium text-gray-700">
            Enter Host Name
            <input
              className="mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Enter host name"
              onChange={handelChange}
              value={value.hostName}
              name="hostName"
            />
          </label>

          {/* Your Name */}
          <label className="flex flex-col text-sm font-medium text-gray-700">
            Enter Your Name
            <input
              className="mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Enter your name"
              onChange={handelChange}
              value={value.yourName}
              name="yourName"
            />
          </label>

          {/* Password */}
          <label className="flex flex-col text-sm font-medium text-gray-700">
            Enter Password
            <input
              type="password"
              className="mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Enter password"
              onChange={handelChange}
              value={value.password}
              name="password"
            />
          </label>

          {/* Room ID */}
          <label className="flex flex-col text-sm font-medium text-gray-700">
            RoomId
            <input
              type="text"
              className="mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Room Id"
              onChange={handelChange}
              value={value.RoomId}
              name="RoomId"
            />
          </label>

          {/* Buttons */}
          <button
            type="submit"
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition duration-200 font-medium"
          >
            Enter Room
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition duration-200 font-medium"
          >
            Back Home
          </button>
        </form>
      </div>
    </div>
  );
};

export default Room;
