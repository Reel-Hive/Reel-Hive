import React, { useRef, useState } from 'react'
import API from '../../axios';
import "./Setting.css";
import { FaLock, FaUnlock } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';



const Setting = () => {
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState(null);
    const [cover, setCover] = useState(null);
    const [avatarSuccessMessage, setAvatarSuccessMessage] = useState("");
    const [coverSuccessMessage, setCoverSuccessMessage] = useState("");
    const [detailSuccessMessage, setDetailSuccessMessage] = useState("");
    const [passwordSuccessMessage, setPassWordSuccessMessage] = useState("");
    const [deleteAccountMessage, setDeleteAccountMessage] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
    });
    const [updatePassword, setUpdatePassword] = useState({
        currentPassword: '',
        newPassword: '',
    });

    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const handleAvatarClick = () => {
        avatarInputRef.current.click();
    };

    const handleCoverClick = () => {
        coverInputRef.current.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCover(file);
        }
    };


    // Updating Avatar
    const handleUpdateAvatar = async () => {
        if (!avatar) return;

        const formData = new FormData();
        formData.append('avatar', avatar);

        try {
            await API.patch('/api/v1/users/update-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setAvatarSuccessMessage("Your avatar has been updated successfully!");
            setAvatar(null);
            setTimeout(() => {
                setAvatarSuccessMessage("");
                navigate("/your-Videos");
            }, 3000);
        } catch (error) {
            console.error('Error while updating avatar image: ', error);
        }
    };

    // Updating Cover Image
    const handleUpdateCoverImage = async () => {
        if (!cover) return;

        const formData = new FormData();
        formData.append('coverImage', cover);

        try {
            await API.patch('/api/v1/users/update-coverImage', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCoverSuccessMessage("Your cover image has been updated sucessfully")
            setCover(null);
            setTimeout(() => {
                setCoverSuccessMessage("");
                navigate("/your-Videos");
            }, 3000);
        } catch (error) {
            console.error('Error while updating cover image: ', error);
        }
    };

    // Updating Details
    const handleUpdateDetails = async () => {
        const { name, username } = formData;
        if (!(name || username)) {
            setAlert({
                message: 'name or username is required!',
                isOpen: true,
            });
        }

        try {
            await API.patch('/api/v1/users/update-details', { name, username });
            setDetailSuccessMessage("Your details has been updated sucessfully")
            setFormData({ name: '', username: '' });
            setTimeout(() => {
                setDetailSuccessMessage("");
                navigate("/");
            });
        } catch (error) {
            console.error('Error while updating the details: ', error);
        }
    };

    // Updating Password
    const handleUpdatePassword = async () => {
        const { currentPassword, newPassword } = updatePassword;

        try {
            await API.patch('/api/v1/users/update-password', {
                currentPassword,
                newPassword,
            });
            setPassWordSuccessMessage("Your password has been updated sucessfully")
            setUpdatePassword({ currentPassword: '', newPassword: '' });
            setTimeout(() => {
                setPassWordSuccessMessage("");
                navigate("/");
            });
        } catch (error) {
            console.error('Error while updating password: ', error);
        }
    };

    // delete account 
    const handleDeleteAccount = async () => {
        try {
            await API.delete('/api/v1/users/deleteMe');

            setDeleteAccountMessage("Your account has been deleted successfully!");
            setTimeout(() => {
                setDeleteAccountMessage("");
                navigate("/");
            }, 3000);
        } catch (error) {
            console.error("Error deleting account: ", error);
        }
    };


    return (
        <div className="container">
            <div className="content">
                <div className="updater">
                    <h2>Update Avatar</h2>
                    <div className="avtar" onClick={handleAvatarClick}>
                        {avatar ? (
                            <img src={URL.createObjectURL(avatar)} alt="Avatar Preview" />
                        ) : (
                            <i className="bx bxs-camera"></i>
                        )}
                        <input type="file"
                            ref={avatarInputRef}
                            style={{ display: 'none' }}
                            accept='image/*'
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <button onClick={handleUpdateAvatar}>Update Avatar</button>
                    {avatarSuccessMessage && <p className="success-message">{avatarSuccessMessage}</p>}
                </div>
                <div className="updater">
                    <h2>Update Cover Image</h2>
                    <div className="coverImage" onClick={handleCoverClick}>
                        {cover ? (
                            <img src={URL.createObjectURL(cover)} alt="Cover Preview" />
                        ) : (
                            <>
                                <i className="bx bxs-camera"></i>
                                <span>Cover Image</span>
                            </>

                        )}
                        <input type="file"
                            ref={coverInputRef}
                            style={{ display: 'none' }}
                            accept='image/*'
                            onChange={handleCoverChange}
                        />
                    </div>
                    <button onClick={handleUpdateCoverImage}>Update Cover Image</button>
                    {coverSuccessMessage && <p className="success-message">{coverSuccessMessage}</p>}
                </div>
            </div>
            <div className="content">
                <div className="updater">
                    <h2>Update Details</h2>
                    <div className="updateDetails">
                        <div className="inputField">
                            <i className="bx bxs-user-circle"></i>
                            <input type="text"
                                placeholder='Username'
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="inputField">
                            <i className="bx bxs-user-circle"></i>
                            <input
                                type="text"
                                placeholder="Name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <button onClick={handleUpdateDetails}>Update Details</button>
                    {detailSuccessMessage && <p className="success-message">{detailSuccessMessage}</p>}
                </div>
                <div className="updater">
                    <h2>Update Password</h2>
                    <div className="updatePassword">
                        <div className="inputField">
                            <span className="setting-password-toggle-icon" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                {showCurrentPassword ? <FaUnlock size={20} /> : <FaLock size={20} />}
                            </span>
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Current password"
                                value={updatePassword.currentPassword}
                                onChange={(e) =>
                                    setUpdatePassword({
                                        ...updatePassword,
                                        currentPassword: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="inputField">
                            <span className="setting-password-toggle-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                                {showNewPassword ? <FaUnlock size={20} /> : <FaLock size={20} />}
                            </span>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="New password"
                                value={updatePassword.newPassword}
                                onChange={(e) =>
                                    setUpdatePassword({
                                        ...updatePassword,
                                        newPassword: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <button onClick={handleUpdatePassword}>Update Password</button>
                    {passwordSuccessMessage && <p className="success-message">{passwordSuccessMessage}</p>}
                </div>
            </div>
            <div className="delete-account">
                <h3>Deleting your account is permanent. Proceed with caution!</h3>
                <button className="delete-account-btn" onClick={handleDeleteAccount}>Delete Account</button>
                {deleteAccountMessage && <p className="success-message">{deleteAccountMessage}</p>}
            </div>
        </div>
    )
}

export default Setting;