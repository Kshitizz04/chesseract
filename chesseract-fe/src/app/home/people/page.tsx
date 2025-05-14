"use client";

import React, { useState, useEffect } from "react";
import getUserBySearch, { GetUsersBySearchData } from "@/services/getUsersBySearch";
import getSuggestions, { GetSuggestionsData } from "@/services/getSuggestions";
import Image from "next/image";
import { IoSearch } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
import { MdSportsEsports } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import LoadingSpinner from "@/components/utilities/LoadingSpinner";
import Avatar from "@/components/utilities/Avatar";
import FriendButton from "@/components/utilities/FriendButton";
import { getTimeAgo } from "@/utils/getTimeAgo";
import useUserRedirection from "@/utils/hooks/userRedirection";

const People = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<GetUsersBySearchData | null>(null);
  const [suggestions, setSuggestions] = useState<GetSuggestionsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const userRouter = useUserRedirection();

  // Fetch suggestions on component mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const response = await getSuggestions();
        if (response.success) {
          setSuggestions(response.data);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  // Debounced search function
  const handleSearch = async (query: string) => {
    if (query.trim().length === 0) {
      setSearchResults(null);
      return;
    }

    try {
      setLoading(true);
      const response = await getUserBySearch(query);
      if (response.success) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    handleSearch(query);
  };

  const UserCard = ({ user }: any) => (
    <div className="relative">
      <div 
        className="flex items-center p-3 bg-bg-200 rounded-lg mb-2 hover:bg-bg-300 transition-colors cursor-pointer gap-2"
      >
        <Avatar
          profileImage={user.profilePicture}
          username={user.username}
          size={48}
          onClick={() => userRouter(user._id,`/home/user/${user._id}`)}
        />

        <div className="flex flex-col">
          <p>{user.username} {user.fullname ? `| ${user.fullname}` : ""}</p>
          {user.isOnline && (
            <p className="text-light text-green-500">Online</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full">
      <div className="flex flex-col md:flex-row h-full gap-4">
        {/* Left Section - Search and Results */}
        <div className="w-full md:w-2/3 flex flex-col">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search for users..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full px-4 text-lg py-4 border-b-2 border-text-100 focus:border-accent-100"
                />
                <IoSearch className="absolute right-3 top-1/2 transform -translate-y-1/2" size={20} />
            </div>

          {/* Search Results Section */}
          <div className="flex-grow overflow-auto mt-2">
            {loading && (
              <div className="h-20 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--color-accent-100)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {searchTerm && searchResults && (
              <div className="bg-bg-100/60 p-4 rounded-lg mb-4 max-h-96 lg:max-h-full overflow-auto">
                <h2 className="text-xl font-bold mb-4 text-[var(--color-text-200)]">Search Results</h2>
                
                {searchResults.friends && searchResults.friends.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold mb-2 text-[var(--color-text-100)]">Friends</h3>
                    {searchResults.friends.map(user => (
                      <UserCard 
                        key={user._id} 
                        user={user} 
                        reason="Friend" 
                      />
                    ))}
                  </div>
                )}
                
                {searchResults.nonFriends && searchResults.nonFriends.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold mb-2 text-[var(--color-text-100)]">Others</h3>
                    {searchResults.nonFriends.map(user => (
                      <UserCard 
                        key={user._id} 
                        user={user} 
                        reason="User" 
                      />
                    ))}
                  </div>
                )}
                
                {(!searchResults.friends || searchResults.friends.length === 0) && 
                 (!searchResults.nonFriends || searchResults.nonFriends.length === 0) &&(
                  <p className="text-center py-8 text-[var(--color-text-100)]">
                    No users found {searchTerm ? `matching "${searchTerm}"` : ""}.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Suggestions */}
        <div className="w-full md:w-1/3 bg-bg-100/60 rounded-md p-4">
            <h2 className="text-xl font-bold mb-4">People You May Know</h2>
            
            {loading && !suggestions && (
                <div className="w-full h-96 flex items-center justify-center">
                    <LoadingSpinner/>
                </div>
            )}

            {suggestions && (
              <>
                {/* Mutual Friends Section */}
                {suggestions.mutualFriends && suggestions.mutualFriends.length > 0 && (
                  <div className="mb-6 bg-bg-200 rounded-md p-2">
                    <h3 className="flex items-center text-md font-semibold mb-2 pb-2 border-b border-text-100">
                      <FaUserFriends className="mr-2" size={30}/> From Your Circle
                    </h3>
                    {suggestions.mutualFriends.map((user, index) => (
                      <div className="flex items-center gap-2 bd-bg-200 hover:bg-bg-300 rounded-md p-2 mb-2" key={index}>
                        <Avatar
                          profileImage={user.profilePicture}
                          username={user.username}
                          size={60}
                          onClick={() => userRouter(user._id,`/home/user/${user._id}`)}
                        />
                        <div className="flex flex-col">
                          <p>{user.username} {user.fullname ? `| ${user.fullname}` : ""}</p>
                          <div className="flex items-center">
                            {user.mutualFriends.map((mutual, index) => (
                                <div key={index} className="w-8 h-8 rounded-full border border-primary-bg-color overflow-hidden flex-shrink-0">
                                    <Image 
                                      src={mutual.profilePicture} 
                                      alt={mutual.username} 
                                      width={28} 
                                      height={28}
                                      className="w-full h-full object-cover"
                                      onContextMenu={(e) => e.preventDefault()}
                                    />
                                </div>
                            ))}
                            <span className="text-xs text-text-color ml-1">
                                Followed by{' '}
                                {user.mutualFriends.map((mutual, index) => (
                                    <React.Fragment key={index}>
                                        {index > 0 && index < user.mutualFriends.length - 1 && ', '}
                                        {index > 0 && index === user.mutualFriends.length - 1 && (user.mutualFriendCount<=0 ? ' and ' : ', ')}
                                        <span className="font-medium">{mutual.username}</span>
                                    </React.Fragment>
                                ))}
                                {user.mutualFriendCount > 3 && ` and ${user.mutualFriendCount} other${user.mutualFriendCount > 1 ? 's' : ''}`}
                            </span>
                          </div>
                        </div>
                        <FriendButton
                          friendId={user._id}
                          friendStatus={0}
                          showText={false}
                          bgColor="bg-accent-100"
                          width="w-8"
                          className="ml-auto"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Most Games Against Section */}
                {suggestions.mostActive && suggestions.mostActive.length > 0 && (
                  <div className="mb-6 bg-bg-200 rounded-md p-2">
                    <h3 className="flex items-center text-md font-semibold mb-2 pb-2 border-b border-text-100">
                      <MdSportsEsports className="mr-2" size={30}/> Players You Often Face
                    </h3>
                    {suggestions.mostActive.map((user, index) => (
                      <div className="flex items-center gap-2 bd-bg-200 hover:bg-bg-300 rounded-md p-2 mb-2" key={index}>
                        <Avatar
                          profileImage={user.profilePicture}
                          username={user.username}
                          size={60}
                          onClick={() => userRouter(user._id,`/home/user/${user._id}`)}
                        />
                        <div className="flex flex-col">
                          <p>{user.username} {user.fullname ? `| ${user.fullname}` : ""}</p>
                          <p className="text-sm">{user.gamesCount} game{user.gamesCount > 1 ? "s" : ""} Played</p>
                        </div>
                        <FriendButton
                          friendId={user._id}
                          friendStatus={0}
                          showText={false}
                          bgColor="bg-accent-100"
                          width="w-8"
                          className="ml-auto"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent Opponents Section */}
                {suggestions.recentOpponents && suggestions.recentOpponents.length > 0 && (
                  <div className="bg-bg-200 rounded-md p-2">
                    <h3 className="flex items-center text-md font-semibold mb-2 pb-2 border-b border-text-100">
                      <FiClock className="mr-2" size={30}/> Your Recent Rivals
                    </h3>
                    {suggestions.recentOpponents.map((user, index) => 
                      <div className="flex items-center gap-2 bd-bg-200 hover:bg-bg-300 rounded-md p-2 mb-2" key={index}>
                        <Avatar
                          profileImage={user.profilePicture}
                          username={user.username}
                          size={60}
                          onClick={() => userRouter(user._id,`/home/user/${user._id}`)}
                        />
                        <div className="flex flex-col">
                          <p>{user.username} {user.fullname ? `| ${user.fullname}` : ""}</p>
                          <p className="text-sm">
                              <span className="text-sm">Last played </span>
                              {getTimeAgo(new Date(user.lastPlayed))}
                            </p>
                        </div>
                        <FriendButton
                          friendId={user._id}
                          friendStatus={0}
                          showText={false}
                          bgColor="bg-accent-100"
                          width="w-8"
                          className="ml-auto"
                        />
                      </div>
                    )}
                  </div>
                )}

                {!suggestions.mutualFriends?.length && 
                 !suggestions.mostActive?.length && 
                 !suggestions.recentOpponents?.length && (
                  <p className="text-center py-8">
                    No suggestions available at this time.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
    </div>
  );
};

export default People;