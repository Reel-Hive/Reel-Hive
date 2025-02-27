import React, { useEffect, useState } from 'react'
import API from '../axios';
import { useLocation } from 'react-router-dom';
import { formatDistanceToNow } from "date-fns";


const SearchVideo = () => {
    const location = useLocation();
    const [videos, setVideos] = useState([]);
    const [channels, setChannels] = useState([]);

    // Extract query from URL
    const query = new URLSearchParams(location.search).get('query');

    useEffect(() => {
        // Fetching search videos
        const fetchVideos = async () => {
            try {
                const response = await API.get(`/api/v1/searches?query=${query}`);
                const { videos, channels } = response.data.data;

                setVideos(videos);
                setChannels(channels);
            } catch (error) {
                console.error('Error while fetching searched videos: ', error);
            }
        };
        if (query) {
            fetchVideos();
        }
    }, [query]);

    const hasVideos = videos.length > 0;
    const hasChannels = channels.length > 0;
    return (
        <div className="feed">
            <div className="card">
                {hasVideos &&
                    videos.map((video) => (
                        <div className="videoBox"
                            key={video._id}
                        >
                            <img src={video.thumbnail.url} alt={video.title} />
                            <div className="box">
                                <div className="image">
                                    <img src={video.ownerDetails.avatar}
                                        className="profile_logo"
                                        alt={video.title} />
                                </div>
                                <div className='description'>
                                    <h2>{video.title}</h2>
                                    <h3>@{video.ownerDetails.username}</h3>
                                    <div className="info">
                                        <p>{video.views} views •{' '} </p>
                                        <p>
                                            {formatDistanceToNow(new Date(video.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    )

                    )}

                {hasVideos &&
                    channels.map((channel) => (
                        <div className="videoBox"
                            key={channel._id}
                        >
                            <img src={channel.avatar} alt={channel.name} />
                            {/* <div className="box">
                                <div className="image">
                                    <img src={video.ownerDetails.avatar}
                                        className="profile_logo"
                                        alt={video.title} />
                                </div> */}
                            <div className='description'>
                                <h2>{channel.name}</h2>
                                <h3>@{channel.username}</h3>
                                <p>{channel.subscriberCount} subscribers</p>
                                {/* <div className="info">
                                        <p>{video.views} views •{' '} </p>
                                        <p>
                                            {formatDistanceToNow(new Date(video.createdAt), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    </div> */}
                            </div>
                            {/* </div> */}
                        </div>

                    )

                    )}
                {/* <img src={thumbnail1} alt="" />
            <img src={profile_icon} className="profile_logo" alt="" />
            <h2>Best channel to learn coding that help you to be a developer</h2>
            <h3>GrateStack</h3>
            <p>15k views &bull; 2 days ago</p> */}

                {!hasVideos && !hasChannels && <h1>No videos or channels found</h1>}
            </div>
        </div>

    )
}

export default SearchVideo;