import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import getUserById, { GetUserByIdData } from "@/services/getUserById";
import Button from "../utilities/CustomButton";
import { FaUserEdit } from "react-icons/fa";
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

    const { showToast } = useToast();

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
            const response = await editProfile(editForm);
            if (response.success) {
                setUserData(prev => ({
                    ...prev!,
                    profilePicture: editForm.profilePicture,
                    fullname: editForm.fullname,
                    bio: editForm.bio,
                    country: editForm.country
                }));
                setEditing(false);
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
                        <div>
                            <label className="text-sm font-medium">Profile URL</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded mt-1 bg-bg-50 text-fg-900"
                                value={editForm.profilePicture}
                                onChange={(e) => setEditForm({...editForm, profilePicture: e.target.value})}
                                placeholder="URL to your profile image"
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
                                {submitting ? <LoadingSpinner /> : <CiSaveUp2 className="h-4 w-4 mr-2" />}
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
                {!editing && !loading && isForProfile &&(
                    <Button
                        className="absolute right-4 top-4"
                        onClick={() => setEditing(true)}
                        width='w-8'
                    >
                        <FaUserEdit className="h-4 w-4" />
                    </Button>
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