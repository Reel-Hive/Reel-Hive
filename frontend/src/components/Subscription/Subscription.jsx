import React, { useContext, useEffect, useState } from 'react';
import './subscription.css';
import thumbnail1 from '/Assets/thumbnail1.png';
import profile_icon from '/Assets/jack.png';
import { UserContext } from '../../userContext';
import API from '../../axios';
import Feed from '../Feed/Feed';
import Channel from '../Channel';
import { formatDistanceToNow } from 'date-fns';

const Subscription = () => {
  const { user } = useContext(UserContext);
  const [subscribedChannels, setSubscribedChannels] = useState([]);

  useEffect(() => {
    const fetchSubscribedChannels = async () => {
      try {
        const response = await API.get(
          `/api/v1/subscriptions/u/${user._id}`
        );
        setSubscribedChannels(response.data.subscribedChannels);
        console.log("Subscription Response:", response.data); // Debugging
      } catch (error) {
        console.error(
          "Error while fetching the subscribed channel's videos: ",
          error
        );
      }
    };


    fetchSubscribedChannels();
  }, [user]);
  return (
    <div className="feed">
      <div className="card">
        <p>No subcription found.</p>
        {subscribedChannels.map((channel) => (
          <div className="videoBox" key={channel._id}>
            <img src={channel.latestVideo.thumbnail.url} alt={channel.name} />
            <div className="box">
            <div className="image">
              <img src={channel.avatar} className='profile_logo' alt={channel.name} />
            </div>
           <div className='description'>
           <h2>{channel.latestVideo.title}</h2>
            <h3>@{channel.username}</h3>
           <div className="info">
           <p>{channel.latestVideo.views} views • </p>
            <p>
              {formatDistanceToNow(new Date(channel.latestVideo.createdAt), {
                addSuffix: true,
              })}
            </p>
           </div>
           </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}



export default Subscription;