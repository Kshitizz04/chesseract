import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import getUserById, { GetUserByIdData } from "@/services/getUserById";
import Button from "../utilities/CustomButton";
import { FaUser, FaUserEdit } from "react-icons/fa";
import Avatar from "../utilities/Avatar";
import { useToast } from "@/contexts/ToastContext";
import LoadingSpinner from "../utilities/LoadingSpinner";
import { IoClose, IoTimerOutline } from "react-icons/io5";
import { CiSaveUp2 } from "react-icons/ci";
import CountryFlag, { countryOptions } from "@/utils/countryFlag";
import editProfile from "@/services/editProfile";
import { RiRadioButtonLine } from "react-icons/ri";
import { GiBulletBill } from "react-icons/gi";
import { SiStackblitz } from "react-icons/si";
import Image from "next/image";
import { BiImageAdd } from "react-icons/bi";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "../../../config/env";
import FriendButton from "../utilities/FriendButton";

interface UserInfoCardProps {
    isForProfile: boolean;
    userId: string;
    totalGames: number;
}

interface EditFormState {
    profilePicture: string;
    fullname: string;
    bio: string;
    country: string;
}

const UserInfoCard = ({ isForProfile, userId, totalGames }: UserInfoCardProps) => {
    const [userData, setUserData] = useState<GetUserByIdData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState<EditFormState>({
        profilePicture: '',
        fullname: '',
        bio: '',
        country: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [newImageFile, setNewImageFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const setLocalImageUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        if (file.size > 10 * 1024 * 1024) {
            showToast("Image too large. Maximum size is 10MB", "error");
            return;
        }

        const imageUrl = URL.createObjectURL(file);
        setEditForm((prev) => ({
            ...prev,
            profilePicture: imageUrl
        }));
        setNewImageFile(file);
    }

    useEffect(()=>{
		const fetchUserData = async () => {
			try{
				setLoading(true);
				const response = await getUserById(userId);
				if(response.success){
					setUserData(response.data);
                    setEditForm({
                        profilePicture: response.data.profilePicture || '',
                        fullname: response.data.fullname || '',
                        bio: response.data.bio || '',
                        country: response.data.country || ''
                    });
				}else {
					const error = response.error || "An error occurred";
					showToast(error, "error");
				}
			}catch(err){
				console.log("failed to fetch user data", err);
			}finally{
				setLoading(false);
			}
		}
		fetchUserData();
	}, [userId]);

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            let finalProfilePicture = editForm.profilePicture;
            let oldPublicId = null;

            if(newImageFile){
                if(userData?.profilePicture?.includes("cloudinary")){
                    const previousImageUrl = userData.profilePicture;
                    const urlParts = previousImageUrl.split('/');
                    const filenameWithExtension = urlParts[urlParts.length - 1];
                    oldPublicId = filenameWithExtension.split('.')[0];
                }

                const formData = new FormData();
                formData.append("file", newImageFile);
                formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET || "chesseract_uploads");

                const cloudinaryResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        body: formData
                    }
                )

                const cloudinaryData = await cloudinaryResponse.json();

                if(cloudinaryResponse.ok){
                    finalProfilePicture = cloudinaryData.secure_url;
                    
                    if(oldPublicId){
                        await fetch('/api/delete-image', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ publicId: oldPublicId })
                        })
                    }
                }else{
                    throw new Error("Failed to upload image");
                }
            }

            const updatedForm = {
                ...editForm,
                profilePicture: finalProfilePicture
            }

            const response = await editProfile(updatedForm);
            if (response.success) {
                setUserData(response.data);
                setEditForm({
                    profilePicture: response.data.profilePicture || '',
                    fullname: response.data.fullname || '',
                    bio: response.data.bio || '',
                    country: response.data.country || ''
                });

                setEditing(false);
                setNewImageFile(null);
                showToast("Profile updated successfully", "success");
            } else {
                showToast(response.error || "Failed to update profile", "error");
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            showToast("Failed to update profile", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const editProfileForm = ()=>{
        return (
            <CardContent>
                <form onSubmit={handleEditSubmit} className="w-full">
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center">
                            <div 
                                className="relative rounded-full border-1 border-accent-100 overflow-hidden flex items-center justify-center bg-bg-100 font-semibold flex-shrink-0"
                                style={{ width: 100, height: 100 }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {editForm.profilePicture ? (
                                    <Image
                                        src={editForm.profilePicture}
                                        alt={`${userData?.username || "User"}'s profile`}
                                        width={100}
                                        height={100}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <FaUser size={90}/>
                                )}
                                <div className="absolute inset-0 hover:bg-black/50 hover:cursor-pointer transition-all rounded-full opacity-0 hover:opacity-100 flex items-center justify-center z-10">
                                    <BiImageAdd size={50} className="text-white" />
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={setLocalImageUrl}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Full Name</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded mt-1 bg-bg-50 text-fg-900"
                                value={editForm.fullname}
                                onChange={(e) => setEditForm({...editForm, fullname: e.target.value})}
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Country</label>
                            <select
                                className="w-full p-2 border rounded mt-1 bg-bg-50 text-fg-900"
                                value={editForm.country}
                                onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                            >
                                <option value="">Select Country</option>
                                {countryOptions.map(country => (
                                    <option key={country.code} value={country.code}>
                                        {country.name} 
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Bio</label>
                            <textarea
                                className="w-full p-2 border rounded mt-1 bg-bg-50 text-fg-900"
                                rows={3}
                                value={editForm.bio}
                                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                placeholder="Tell us a bit about yourself"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" onClick={() => setEditing(false)}>
                                <IoClose className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? <LoadingSpinner className="mr-2"/> : <CiSaveUp2 className="h-4 w-4 mr-2" />}
                                Save
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        )
    }

    return (
        <Card className="shadow-lg bg-bg-100">
            <CardHeader className="relative pb-0">
                {isForProfile ? !editing && !loading && (
                    <Button
                        className="absolute right-4 top-4"
                        onClick={() => setEditing(true)}
                        width='w-8'
                    >
                        <FaUserEdit className="h-4 w-4" />
                    </Button>
                ) : userData && (
                    <div className="absolute right-4 top-4">
                        <FriendButton
                            friendId={userId}
                            friendStatus={userData?.friendStatus}
                            showText={false}
                            width="w-8"
                        />
                    </div>
                )}
            </CardHeader>

            {editing ? (
                editProfileForm()
            ) : loading || !userData ? (
                <CardContent className="flex items-center justify-center h-64">
                    <LoadingSpinner/>
                </CardContent>
            ) : (
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                        <Avatar
                            username={userData.username}
                            profileImage={userData.profilePicture}
                            showUsername={false}
                            size={80}
                        />
                        <div className="flex flex-col w-full">
                            {userData.fullname ? 
                                <p className="text-md">{userData.username} | {userData.fullname}</p> :
                                <p className="text-md">{userData.username}</p>
                            }
                            <div className="flex items-center text-sm text-muted-foreground">
                                <CountryFlag countryCode={userData.country || ""} /> 
                                <RiRadioButtonLine className={`ml-2 ${userData.isOnline ? "text-green-500" : "text-red-500"}`} />
                                {userData.isOnline ? ' Online' : ' Offline'}
                            </div>
                        </div>
                    </div>

                    <p className="text-sm mt-4 text-start">{userData.bio}</p>

                    <div className="grid grid-cols-3 gap-2 text-center mt-2">
                        <div className="flex flex-col items-center">
                            <GiBulletBill size={24}/>
                            <p className="text-2xl font-bold">{userData.rating.bullet}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <SiStackblitz size={24}/>
                            <p className="text-2xl font-bold">{userData.rating.blitz}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <IoTimerOutline size={24}/>
                            <p className="text-2xl font-bold">{userData.rating.rapid}</p>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Games</span>
                        <span className="font-medium">
                            {totalGames}
                        </span>
                        </div>
                        <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Member Since</span>
                        <span className="font-medium">{userData.createdAt.slice(0,10)}</span>
                        </div>
                    </div>
                </CardContent>
        )}
        </Card>
    );
};

export default UserInfoCard;