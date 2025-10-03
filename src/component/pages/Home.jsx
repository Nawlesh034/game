import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [value, setValue] = useState({
    hostName: "",
    password: "",
    nfPlayer: "",
    RoomId: ""
  });

  let navigate = useNavigate();

  const handelChange = (e) => {
    const { name, value: val } = e.target;
    setValue((prev) => ({
      ...prev,
      [name]: val
    }));
  };

  const autoGneratedId = () => {
    const id = Math.random().toString(36).substr(2, 8);
    return id;
  };

  // generate id once on mount and set RoomId in state
  useEffect(() => {
    const id = autoGneratedId();
    setValue((prev) => ({ ...prev, RoomId: id }));
  }, []);

  const handelSubmit = (e) => {
    e.preventDefault();
    console.log(value);
    navigate(`/create-room`,{
          state: {
      roomId: value.RoomId,
      hostName: value.hostName,
      password: value.password,
      nfPlayer: value.nfPlayer,
    },
    });
  };

  return (
    <div className="home-container h-screen w-full bg-gradient-to-br from-amber-500 to-amber-700 flex justify-center items-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create a Room to Play Game 🎮
        </h1>

        <div className="flex flex-col gap-5">
          {/* Host Name */}
          <label className="flex flex-col text-sm font-medium text-gray-700">
            Enter Host Name
            <input
              className="mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Enter your name"
              onChange={handelChange}
              value={value.hostName}
              name="hostName"
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

          {/* Number of Players */}
          <label className="flex flex-col text-sm font-medium text-gray-700">
            Enter Number of Players
            <input
              type="number"
              min="2"
              className="mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="e.g. 4"
              onChange={handelChange}
              value={value.nfPlayer}
              name="nfPlayer"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-gray-700">
            RoomId
            <input
              type="text"
              className="mt-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Room Id"
              onChange={handelChange}
              value={value.RoomId}
              name="RoomId"
                readOnly
            />
          </label>

          {/* Button */}
          <button
            onClick={handelSubmit}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition duration-200 font-medium"
          >
            Create Room
          </button>
          <button
            onClick={() => navigate(`/Room`)}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition duration-200 font-medium"
          >
            Enter In A Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
