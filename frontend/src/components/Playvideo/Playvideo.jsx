import React, { useContext, useEffect, useState } from "react";
import './Playvideo.css';
import { useNavigate, useParams } from 'react-router-dom';
import like from '/Assets/like.png';
import dislike from '/Assets/dislike.png';
import API from "../../axios";
import { UserContext } from "../../userContext";

const Playvideo = () => {
  const { videoId } = useParams();
  const { user } = useContext(UserContext);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [commentLikes, setCommentLikes] = useState([]);
  const [commentDislikes, setCommentDislikes] = useState([]);
  const [visibleDeleteIndex, setVisibleDeleteIndex] = useState(null);
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [createComment, setCreateComment] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [alert, setAlert] = useState({
    message: '',
    isOpen: false,
    redirectTo: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetching video data
    setVideo(null); // Reset previous video
    const fetchVideo = async () => {
      try {
        const response = await API.get(`/api/v1/videos/${videoId}`);
        const fetchedVideo = response.data.video;
        setVideo(fetchedVideo);

        setIsLiked(fetchedVideo.isLiked || false);
        setIsDisliked(fetchedVideo.isDisliked || false);

        if (user) {
          const subscriptionResponse = await API.get(
            `/api/v1/subscriptions/c/${fetchedVideo.owner._id}`
          );
          setIsSubscribed(subscriptionResponse.data.subscribed);
        }
      } catch (error) {
        console.error('Error while fetching the video details: ', error);
      }
    };
    

    // Fetching Comments of this video
    const fetchComments = async () => {
      try {
        const response = await API.get(`/api/v1/comments/${videoId}`);
        const fetchedComments = response.data.data.commentsData;
        setComments(fetchedComments); // set comments in state
        setCommentLikes(fetchedComments.map((comment) => comment.isLiked)); // Initialize likes state
        setCommentDislikes(
          fetchedComments.map((comment) => comment.isDisliked)
        ); // Initialize dislike state
      } catch (error) {
        console.error('Error while fetching the video comments: ', error);
      }
    };

    fetchVideo();
    fetchComments();
  }, [videoId, user]);

  // Toggle subscribed button
  const handleSubscriptionToggle = async () => {
    try {
      const response = await API.post(
        `/api/v1/subscriptions/c/${video.owner._id}`
      );
      const newSubscriberStatus = response.data.subscribed;
      setIsSubscribed(newSubscriberStatus);

      setVideo((prevVideo) => ({
        ...prevVideo,
        owner: {
          ...prevVideo.owner,
          subscribersCount: newSubscriberStatus
            ? prevVideo.owner.subscribersCount + 1
            : prevVideo.owner.subscribersCount - 1,
        },
      }));
    } catch (error) {
      console.error('Error while subscribing to the channel: ', error);
    }
  };

  // Toggle Video Like
  const handleLikeClick = async () => {
    try {
      const response = await API.post(`/api/v1/likes/toggle/v/like/${videoId}`);
      const { isLiked } = response.data;

      setIsLiked(isLiked);

      setVideo((prevVideo) => ({
        ...prevVideo,
        likesCount: isLiked
          ? prevVideo.likesCount + 1
          : prevVideo.likesCount - 1,
        dislikesCount:
          isDisliked && isLiked
            ? prevVideo.dislikesCount - 1
            : prevVideo.dislikesCount,
      }));

      // If like is activated, ensure dislike is deactivated
      if (isLiked) {
        setIsDisliked(false);
      }
    } catch (error) {
      console.error('Error toggling like on video: ', error);
    }
  };

  // Toggle Video Dislike
  const handleDislikeClick = async () => {
    try {
      const response = await API.post(
        `/api/v1/likes/toggle/v/dislike/${videoId}`
      );
      const { isDisliked } = response.data;

      setIsDisliked(isDisliked);

      setVideo((prevVideo) => ({
        ...prevVideo,
        dislikesCount: isDisliked
          ? prevVideo.dislikesCount + 1
          : prevVideo.dislikesCount - 1,
        likesCount:
          isDisliked && isLiked
            ? prevVideo.likesCount - 1
            : prevVideo.likesCount,
      }));

      // If dislike is activated, ensure like is deactivated
      if (isDisliked) {
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Error toggling dislike on video: ', error);
    }
  };

  // Toggle Comments Like
  const toggleCommentLike = async (index, commentId) => {
    try {
      const response = await API.post(
        `/api/v1/likes/toggle/c/like/${commentId}`
      );
      const { isLiked } = response.data;

      setCommentLikes((prevLikes) =>
        prevLikes.map((like, i) => (i === index ? isLiked : like))
      );

      setCommentDislikes((prevDislikes) =>
        prevDislikes.map((dislike, i) => (i === index ? false : dislike))
      );

      setComments((prevComments) =>
        prevComments.map((comment, i) => {
          if (i === index) {
            return {
              ...comment,
              totalLikes: isLiked
                ? comment.totalLikes + 1
                : comment.totalLikes - 1,
              totalDislikes:
                commentDislikes[i] && isLiked
                  ? comment.totalDislikes - 1
                  : comment.totalDislikes,
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error('Error toggling like on comment: ', error);
    }
  };

  // Toggle comments dislike
  const toggleCommentDislike = async (index, commentId) => {
    try {
      const response = await API.post(
        `/api/v1/likes/toggle/c/dislike/${commentId}`
      );
      const { isDisliked } = response.data;

      setCommentDislikes((prevDislikes) =>
        prevDislikes.map((dislike, i) => (i === index ? isDisliked : dislike))
      );

      setCommentLikes((prevLikes) =>
        prevLikes.map((like, i) => (i === index ? false : like))
      );

      setComments((prevComments) =>
        prevComments.map((comment, i) => {
          if (i === index) {
            return {
              ...comment,
              totalDislikes: isDisliked
                ? comment.totalDislikes + 1
                : comment.totalDislikes - 1,
              totalLikes:
                commentLikes[i] && isDisliked
                  ? comment.totalLikes - 1
                  : comment.totalLikes,
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error('Error toggling dislike on comment: ', error);
    }
  };

  // Create commnet functioanlity
  const handleCommentSubmit = async () => {
    if (!createComment.trim()) return;

    try {
      const response = await API.post(`/api/v1/comments/${videoId}`, {
        content: createComment,
      });

      const newComment = response.data.comment;
      setComments((prevComments) => [newComment, ...prevComments]);
      setCreateComment('');
    } catch (error) {
      console.error('Error while creating comment: ', error);
    }
  };

  //  Show/Hide delete button
  const toggleDeleteButton = (index) => {
    setVisibleDeleteIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  // Delete comment functionality
  const handleDeleteComment = async (commentId) => {
    try {
      const response = await API.delete(`/api/v1/comments/c/${commentId}`);
      const { commentId: deletedCommentId } = response.data;

      // emoev comment from all comment array
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== deletedCommentId)
      );
    } catch (error) {
      console.error('Error while deleting comment: ', error);
    }
  };

  // Toggle Delete video
  const handleDeleteVideo = async () => {
    try {
      await API.delete(`/api/v1/videos/${videoId}`);
      setAlert({
        message: 'Video Deleted successfully',
        isOpen: true,
        redirectTo: '/home',
      });
    } catch (error) {
      console.error('Error deleting video: ', error);
    }
  };

  // Navigate to edit video page
  const handleEditVideoClick = () => {
    navigate(`/edit/${videoId}`, { state: { video } });
  };

  return (
    <div className="play-video">
      {video && (<>
        <video src={video.streamUrl} controls> </video>
        <h3>Description</h3>
        <div className="play-video-info">
          <p>{video.views} views</p>
          <p className="desc">{video.title} </p>
          <p>{new Date(video.createdAt).toLocaleDateString()}</p>
          <div>
            <span><img src={like} alt="" onClick={handleLikeClick} />
              {video.likesCount}
            </span>
            <span><img src={dislike} alt="" onClick={handleDislikeClick} />
              {video.dislikesCount}
            </span>
          </div>
        </div>
        <hr />
        <div className="publisher">
          <img src={video.owner.avatar} alt="" />
          <div>
            <h3>{video.owner.name}</h3>
            <span>{video.owner.subscribersCount} subscribers</span>
          </div>
          {user?._id === video.owner._id ? (
            <>
              {/* <Button onClick={handleEditVideoClick}>Edit Video</Button> */}
              <button onClick={handleEditVideoClick}>Edit Video</button>
              <button onClick={handleDeleteVideo}>Delete Video</button>
            </>
          ) : (<button onClick={handleSubscriptionToggle} isSubscribed={isSubscribed}>
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>)}
        </div>
        <div className="vid-description">
          <p>{video.description}</p>
          <hr />
          <div className="comment">
            <img src={user?.avatar || '/images/user.svg'} alt="Avatar" />
            <div>
              <input type="text" placeholder="Add a comment"
                value={createComment}
                onChange={(e) => setCreateComment(e.target.value)} />
            </div>

          </div>
          <button onClick={handleCommentSubmit}>Comment</button>
        </div>
      </>)}

      <div className="allComments">
        {comments.map((comment, index) => (
          <div className="commentBox" key={comment._id}>
            <div className="comment-box">
              <div className="commentLeft">
                <div className="commentUser">
                  <img src={comment.owner.avatar || '/images/user.svg'}
                    alt="" />
                </div>
                <div className="commentDetail">
                  <h4>{comment.owner.name}</h4>
                  <p>{comment.content}</p>
                  <div className="commentLikeComponent">
                    <div className="commentLike"
                      onClick={() =>
                        toggleCommentLike(index, comment._id)
                      }>
                        <img src={like} alt="" />
                      <span>{comment.totalLikes}</span>
                    </div>
                    <div className="commentUnLike"
                      onClick={() =>
                        toggleCommentDislike(index, comment._id)
                      }>
                        <img src={dislike} alt="" />
                                          
                      <span>{comment.totalDislikes}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="commentRight">
                <i class="bx bx-dots-vertical-rounded"
                  onClick={() => toggleDeleteButton(index)}></i>
                {visibleDeleteIndex === index && (
                  <div className="commentDelete"
                    onClick={() => handleDeleteComment(comment._id)}>
                    Delete
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


export default Playvideo;