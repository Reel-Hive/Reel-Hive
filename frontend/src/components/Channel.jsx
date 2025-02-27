import API from "../axios";
import { UserContext } from "../userContext";
import React, { useContext, useState } from 'react'

const Channel = () => {
    const [channelProfile, setChannelProfile] = useState(null);
    const [videos, setVideos] = useState([]);
    const { user } = useContext(UserContext);
  
    useEffect(() => {
      // Fetch profile information
      const fetchChannelProfile = async () => {
        try {
          const response = await API.get(`/api/v1/users/c/${user.username}`);
          if (response.data?.data) {
            setChannelProfile(response.data.data);
          }
        } catch (error) {
          console.error('Error while fetching the profile details: ', error);
        }
      };
  
      // Fetch users created all videos
      const fetchUserVideos = async () => {
        try {
          const response = await API.get(
            `/api/v1/videos/${user.username}/getUserVideos`
          );
          if (response.data?.data?.videos) {
            setVideos(response.data.data.videos);
          }
        } catch (error) {
          console.error('Error while fetching the users videos: ', error);
        }
      };
  
      if (user) {
        fetchChannelProfile();
        fetchUserVideos();
      }
    }, [user]);
  return (
    <div>

    </div>
  )
}

export default Channel;