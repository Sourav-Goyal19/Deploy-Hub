"use client";
import { axiosInstance } from "@/lib/axios";
import { getCookie, setCookie } from "cookies-next";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [user, setUser] = useState("I am your user");
  useEffect(() => {
    async function fetch() {
      try {
        console.log(getCookie("refresh_token"));
        const res = await axiosInstance.get("/api/user");
        setUser(res.data.user.name);
      } catch (error) {
        console.error(error);
      }
    }
    fetch();
  }, []);
  return <div>{user}</div>;
};

export default Dashboard;
