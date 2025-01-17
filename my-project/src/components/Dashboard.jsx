import React, { useRef, useEffect, useState } from 'react';
import unimateLogo from '../assets/Unimate.png';
import tagAnime from '../assets/tagAnime.png';
import tagArchitecture from '../assets/tagArchitecture.png';
import tagFootball from '../assets/tagFootball.png';
import sparkle from '../assets/sparkle.png';
import menu from '../assets/Menu.png';
import guy from '../assets/guy.png';
import john from '../assets/john.png';
import james from '../assets/james.png';
import peter from '../assets/peter.png';
import movie from '../assets/eventMovie.png';
import founderHack from '../assets/eventFoundersHack.png';
import orchestra from '../assets/eventOrchestra.png';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import DashboardCard from './DashboardCard';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ScrollableNav from './ScrollableNav';
import { SERVER_URL } from '../constants/server';

function SearchInput() {
    return (
        <div className="flex items-center rounded-full px-4 py-2 bg-gray-100">
            <Search size={20} className="text-gray-700 mr-2" />
            <input
                type="text"
                placeholder="Describe your ideal friend ..."
                className="flex-grow bg-transparent focus:outline-none text-gray-700 min-w-[250px]"
            />
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem("user");
    const currentUserID = localStorage.getItem("user_id");
    
    const sliderRef = useRef(null);
    const [usersList, setUsersList] = useState([]);
    const [eventsList, setEventsList] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
          try {
            const res = await fetch(`${SERVER_URL}/v1/account/allusers`, {
              method: "GET",
            });
      
            if (!res.ok) {
              throw new Error("Failed to fetch users");
            }
      
            const users = (await res.json()).data.users;
            setUsersList(users);
          } catch (err) {
            console.error("Error fetching all users:", err);
          }
        };

        const fetchAllEvents = async () => {
            try {
                const response = await fetch(`${SERVER_URL}/v1/event`, {
                    method: 'GET',
                });
        
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
        
                const events = (await response.json()).data.events;
                setEventsList(events)
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };
      
        fetchUsers();
        fetchAllEvents();
      }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    const handleScroll = (event) => {
        if (sliderRef.current) {
            const scrollDirection = event.deltaY > 0 ? 'next' : 'prev';
            if (scrollDirection === 'next') {
                sliderRef.current.slickNext();
            } else {
                sliderRef.current.slickPrev();
            }
        }
    };

    const handleAddFriend = async (my_uuid, friend_uuid) => {
        try {
            const res = await fetch(`${SERVER_URL}/v1/friend`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    friend_one: my_uuid,
                    friend_two: friend_uuid,
                }),
            });

            if (!res.ok) {
                console.error("API call failed", await res.text());
            }

            const friend_conn = (await res.json()).data;
            
            console.log("Successfully added friend\n", friend_conn);

            return friend_conn;
        } catch (err) {
            console.error('Error adding friend:', error);
        }
    };

    const handleCreateChatroom = async (friend_uuid) => {
        try {
            const res = await fetch(`${SERVER_URL}/v1/chat/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Current-User": currentUserEmail,
                },
                body: JSON.stringify({
                    friend_id: friend_uuid,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to create chatroom");
            }

            const chatroom = (await res.json()).data.chatroom;

            console.log(chatroom);
            
            return chatroom;
        } catch (err) {
            console.error('Error adding friend:', error);
        }
    };

    const handleSayHi = async (friend) => {
        try {
            await handleAddFriend(currentUserID, friend.id);
            await handleCreateChatroom(friend.id);
            navigate("/friendChat");
        } catch (err) {
            console.error('Error adding friend:', error);
        }        
    };

    useEffect(() => {
        window.addEventListener('wheel', handleScroll);
        return () => {
            window.removeEventListener('wheel', handleScroll);
        };
    }, []);

    return (
        <>
            <div className="flex items-center justify-between mx-3 my-5">
                <img src={unimateLogo} alt="Unimate Logo" className="w-40 h-auto" />
                <nav className='flex justify-between bg-gray-200 rounded-full py-3 pr-4 w-1/2 items-center'>
                    <ul className='flex justify-around w-full font-semibold'>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/friendChat">Your Friends</Link>
                        </li>
                        <li>
                            <Link to="/Dashboard">Your Events</Link>
                        </li>
                    </ul>
                    <Search size={35} className="text-white bg-indigo-700 rounded-full p-2" />
                </nav>
                <div className='flex bg-gray-100 p-3 rounded-full'>
                    <img src={menu} alt="menu" className="w-10 h-auto" />
                    <img src={guy} alt="guy" className="w-10 h-auto" />
                </div>
            </div>

            <div className='flex justify-between mx-10 mt-10 items-center'>
                <div className='flex items-center'>
                    <h1 className="text-5xl font-semibold mr-2">
                        Friends for you
                    </h1>
                    <img src={sparkle} alt="sparkle" className="w-10 h-auto" />
                </div>
                <SearchInput />
            </div>

            <div className="p-4 md:p-10">
                <Slider {...settings} ref={sliderRef}>
                    {usersList.length > 0 ? (
                        usersList.map((friend, index) => (
                            <div
                                key={index}
                                className='px-2'
                            >
                                <DashboardCard
                                    onSayHello={() => {
                                        handleSayHi(friend)
                                    }}
                                    profilePic={
                                        index % 3 == 0 ? john : 
                                        index % 3 == 1 ? james : peter
                                }
                                    backgroundImage={
                                        index % 3 == 0 ? tagAnime : 
                                        index % 3 == 1 ? tagFootball : tagArchitecture
                                    }
                                    name={friend.name}
                                    description={`Majoring in  ${friend.major}. Loves ${friend.interests}`}
                                />
                            </div>
                        ))
                    ) : (
                        <>
                        </>
                    )}
                </Slider>

                <div className='flex items-center mt-10 justify-between'>
                    <div className='flex items-center'>
                        <h1 className="text-5xl font-semibold mr-2">Upcoming Events for you</h1>
                        <img src={sparkle} alt="sparkle" className="w-10 h-auto" />
                    </div>
                    <Link to="/allEvents" className='bg-indigo-600 text-white py-4 px-8 rounded-full'>See All</Link>
                </div>

                <div className='flex gap-3 mt-8 justify-center'>
                    {eventsList.length > 0 ? (
                            eventsList.map((event, index) => (
                                <div
                                    key={index}
                                    className='px-2'
                                >
                                    <DashboardCard
                                        profilePic={
                                            index % 3 == 0 ? john : 
                                            index % 3 == 1 ? james : peter
                                    }
                                        backgroundImage={
                                            index % 3 == 0 ? movie : 
                                            index % 3 == 1 ? orchestra : founderHack
                                        }
                                        name={event.name}
                                        description={`${event.description}`}
                                        link="/eventDetail"
                                        buttonContent="Join"
                                    />
                                </div>
                            ))
                        ) : (
                            <>
                            </>
                        )}
                </div>
            </div>
        </>
    );
}
