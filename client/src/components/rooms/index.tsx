import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { Room } from "../types";

const RoomLayout = () => {
  const { user } = useAuthStore((state) => state);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(
          //@ts-ignore
          `${import.meta.env.VITE_API_URL}/rooms`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        if (response.status >= 400 && response.status <= 500) {
          const errorData = await response.json();
          toast.error(errorData.message);
          return;
        }

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setRooms(data.data);
      } catch (error) {
        console.error("There was a problem with the fetch request:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [user]);

  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(
        //@ts-ignore
        `${import.meta.env.VITE_API_URL}/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ room_name: roomName }),
        }
      );

      if (response.status >= 400 && response.status <= 500) {
        const errorData = await response.json();
        toast.error(errorData.message);
        return;
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setRooms((prevRooms) => [...prevRooms, data.data]);
      toast.success("Room created successfully!");
      setRoomName("");
    } catch (error) {
      console.error("There was a problem with the create room request:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toaster />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center text-black mb-4">
            Available Chat Rooms
          </h1>
          <form onSubmit={handleCreateRoom} className="mb-8">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
              <button
                type="submit"
                className="py-2 px-4 text-white bg-green-500 rounded-lg font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Create Room
              </button>
            </div>
          </form>
          {rooms.length === 0 ? (
            <p className="text-center text-gray-600">No rooms available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.room_id}
                  className="p-4 bg-gray-200 rounded-lg shadow-md"
                >
                  <h2 className="text-xl font-semibold">{room.room_name}</h2>
                  <p className="text-gray-700">
                    Active Users: {room.active_users}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RoomLayout;
