import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import getUserFriends, { GetUserFriendsData } from "@/services/getUserFriends";
import { useToast } from "@/contexts/ToastContext";
import LoadingSpinner from "../utilities/LoadingSpinner";
import Avatar from "../utilities/Avatar";
import { RiRadioButtonLine } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";
import CountryFlag from "@/utils/countryFlag";
import { IoTimerOutline } from "react-icons/io5";
import { SiStackblitz } from "react-icons/si";
import { GiBulletBill } from "react-icons/gi";
import useUserRedirection from "@/utils/hooks/userRedirection";
import FriendButton from "../utilities/FriendButton";

interface UserInfoProps {
    isForProfile: boolean;
    userId: string;
}

const FriendList = ({ isForProfile, userId }: UserInfoProps) => {
    const [friends, setFriends] = useState<GetUserFriendsData[]>([]);
    const [loading, setLoading] = useState(false);
    //const [searchQuery, setSearchQuery] = useState("");
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [showDetails, setShowDetails] = useState<string | null>(null);

    const userRouter = useUserRedirection();
    const limit = isForProfile ? 10 : 10;
    const { showToast } = useToast();
    const observer = useRef<IntersectionObserver | null>(null);
    const lastFriendElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreFriends();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Fetch initial friends
    useEffect(() => {
        fetchFriends();
    }, [userId]);

    const fetchFriends = async (resetList = true) => {
        try {
            setLoading(true);
            const currentOffset = resetList ? 0 : offset;
            
            const response = await getUserFriends(userId, limit, currentOffset);
            
            if (response.success) {
                const newFriends = response.data;
                
                if (resetList) {
                    setFriends(newFriends);
                    setOffset(limit);
                } else {
                    setFriends(prev => [...prev, ...newFriends]);
                    setOffset(prev => prev + limit);
                }
                
                // If we got fewer items than the limit, there are no more to fetch
                setHasMore(newFriends.length === limit);
            } 
        } catch (err) {
            console.error("Error fetching friends:", err);
            showToast("Failed to load friends", "error");
        } finally {
            setLoading(false);
        }
    };

    const loadMoreFriends = () => {
        if (!loading && hasMore) {
            fetchFriends(false);
        }
    };

    const renderDetails = (friend: GetUserFriendsData)=>{
        return(
            <div className="absolute top-0 left-0 mt-[3rem] bg-bg-300 p-2 rounded-md w-full z-10 shadow-md">
                <div className="flex items-center gap-2">
                    <Avatar
                        username={friend.username}
                        profileImage={friend.profilePicture}
                        showUsername={false}
                        size={80}
                        onClick={() => userRouter(friend._id, `/home/user/${friend._id}`)}
                    />
                    <div className="flex flex-col w-full">
                        {friend.fullname ? 
                            <p className="text-md">{friend.username} | {friend.fullname}</p> :
                            <p className="text-md">{friend.username}</p>
                        }
                        <div className="flex items-center text-sm text-muted-foreground">
                            <CountryFlag countryCode={friend.country || ""} /> 
                            <RiRadioButtonLine className={`ml-2 ${friend.isOnline ? "text-green-500" : "text-red-500"}`} />
                            {friend.isOnline ? ' Online' : ' Offline'}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mt-2">
                    <div className="flex items-center justify-center">
                        <GiBulletBill/>
                        <p className="text-sm font-light">{friend.rating.bullet}</p>
                    </div>
                    <div className="flex items-center justify-center">
                        <SiStackblitz/>
                        <p className="text-sm font-light">{friend.rating.blitz}</p>
                    </div>
                    <div className="flex items-center justify-center">
                        <IoTimerOutline/>
                        <p className="text-sm font-light">{friend.rating.rapid}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Card className="shadow-lg bg-bg-100/60 mt-2 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle>Friends</CardTitle>
                <div className="relative mt-2">
                    <input
                        type="text"
                        placeholder="Search friends..."
                        className="w-full p-2 pl-9 border rounded-md bg-bg-50 text-fg-900"
                        // value={searchQuery}
                        // onChange={()=>{}}
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="h-full overflow-y-auto pt-2 pb-0 max-md:h-96">
                {friends.length > 0 ? (
                    <div className="space-y-2">
                        {friends.map((friend) => {
                            return (
                                <div 
                                    ref={lastFriendElementRef}
                                    key={friend._id} 
                                    className="flex items-center justify-between p-2 rounded-md hover:bg-bg-300/20 relative"
                                    onMouseEnter={() => setShowDetails(friend._id)}
                                    onMouseLeave={() => setShowDetails(null)}
                                >
                                    <p className="font-medium">{friend.username}</p>
                                    {showDetails === friend._id && renderDetails(friend)}
                                    <FriendButton
                                        friendId={friend._id}
                                        friendStatus={friend.friendStatus}
                                        showText={false}
                                        width="w-max"
                                    />
                                </div>
                            );
                            
                        })}
                        
                        {loading && (
                            <div className="w-full flex justify-center py-4">
                                <LoadingSpinner />
                            </div>
                        )}
                    </div>
                ) : loading ? (
                    <div className="w-full h-32 flex items-center justify-center">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="w-full h-32 flex items-center justify-center">
                        <p className="text-muted-foreground">No friends found</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FriendList;