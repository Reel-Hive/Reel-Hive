import React, { useState } from 'react';
import { Routes, BrowserRouter, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Layout from './components/Layout/Layout'; // Keep Layout import
import Home from './Pages/Home/Home';
import Subscription from './components/Subscription/Subscription';
import History from './Pages/History/History';
import LikeVideos from './Pages/LikeVideos/LikeVideos';
import YourVideos from './Pages/YourVideos/YourVideos';
import PublishVideo from './components/PublishVideo/PublishVideo';
import Playvideo from './components/Playvideo/Playvideo';
import Setting from './components/Setting/Setting';
import SearchVideo from './components/SearchVideo';
import EditVideo from './components/EditVideo/EditVideo';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
        <Route exact path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
          <Route
            path="/home"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
             path="/watch/:videoId"
            element={
              <Layout>
                <Playvideo />
              </Layout>
            }
          />
          <Route
          path="/edit/:videoId"
          element={
            <Layout>
              <EditVideo />
            </Layout>
          }
        />
          <Route
            path="/subscription"
            element={
              <Layout>
                <Subscription />
              </Layout>
            }
          />
          <Route
            path="/history"
            element={
              <Layout>
                <History />
              </Layout>
            }
          />
          <Route
            path="/liked-Videos"
            element={
              <Layout>
                <LikeVideos />
              </Layout>
            }
          />
          <Route
            path="/your-Videos"
            element={
              <Layout>
                <YourVideos />
              </Layout>
            }
          />
          <Route
          path="/publish-video"
          element={
            <Layout>
              <PublishVideo />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Setting />
            </Layout>
          }
        />
        <Route
          path="/search"
          element={
            <Layout>
              <SearchVideo />
            </Layout>
          }
        />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
