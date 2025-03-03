import React, { useContext, useEffect, useState } from 'react';
import API from '../../axios';
import { UserContext } from '../../userContext';
import { formatDistanceToNow } from "date-fns";
import "./YourVideos.css";

const YourVideos = () => {
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
    <div className="channelContainer">
      <div className="channelContent">
        <div className="channelCoverImage">
          <img src={channelProfile?.coverImage || './images/banner.jpg'}
            alt="Cover Image" />
        </div>
        <div className="channelAvtar">
          <div className="channelImage">
            <img
              src={channelProfile?.avatar || './images/user.svg'}
              alt="Avatar"
            />
          </div>
          <div className="channelUserInfo">
            <h1>{channelProfile?.name}</h1>
            <span>
              <p>@{channelProfile?.username}</p> 
               <span className="dot"> •{' '}</span> 
              <p>{channelProfile?.subscribersCount} subscribers</p> 
              <span className="dot">•</span> 
              <p>{channelProfile?.channelsSubscribedToCount} subscriptions</p>
            </span>
            <button>
              {channelProfile?.isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
        </div>
        <div className="channelVideoList">
          {videos.length > 0 ? (
            videos.map((video) => (
              <div className="channelVideoBpx" key={video._id}>
                <div className="channelBox">
                  <img src={video.thumbnail.url} alt={video.title} />
                </div>
                <div className="channelInfo">
                  <div className="channelUser">
                    <img
                      src={channelProfile?.avatar || './images/user.svg'}
                      alt=""
                    />
                  </div>
                  <div className="channelDescription">
                    <h4>{video.title}</h4>
                    <h5>@{channelProfile?.username}</h5>
                    <div className="channelInfo">
                      <p>{video.views} •{' '} </p>
                      <p>
                        {formatDistanceToNow(new Date(video.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No videos to display</p>
          )}
        </div>
      </div>
    </div>
  )

}

export default YourVideos;