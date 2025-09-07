"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Search, UserPlus, X, Check, Clock, UserMinus } from 'lucide-react'
import { lightHapticsImpact, mediumHapticsImpact } from '@/lib/haptics'
import { useRouter } from 'next/navigation'

export default function FriendsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [friends, setFriends] = useState([])
    const [pendingRequests, setPendingRequests] = useState([])
    const [sentRequests, setSentRequests] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('friends')

    useEffect(() => {
        if (!user) {
            router.push('/auth')
            setLoading(false)
            return
        }
        fetchFriendsData()
    }, [user])

    const fetchFriendsData = async () => {
        if (!user?.id) return
        
        try {
            setLoading(true)
            
            // Get the user's access token
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session?.access_token) {
                console.error('No access token available')
                return
            }
            
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
            const apiUrl = backendUrl ? `${backendUrl}/api/friends/list` : '/api/friends/list'
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to fetch friends')
            }
            
            const data = await response.json()
            
            setFriends(data.friends)
            setPendingRequests(data.pendingRequests)
            setSentRequests(data.sentRequests)
            
        } catch (error) {
            console.error('Error fetching friends:', error)
        } finally {
            setLoading(false)
        }
    }

    const searchUsers = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }
        
        try {
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session?.access_token) {
                console.error('No access token available')
                return
            }
            
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
            const apiUrl = backendUrl 
                ? `${backendUrl}/api/friends/search?q=${encodeURIComponent(searchQuery.trim())}`
                : `/api/friends/search?q=${encodeURIComponent(searchQuery.trim())}`
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Search failed')
            }
            
            const data = await response.json()
            setSearchResults(data.results)
        } catch (error) {
            console.error('Error searching users:', error)
        }
    }

    const sendFriendRequest = async (recipientId, recipientUsername) => {
        try {
            lightHapticsImpact()
            
            // Get the user's access token
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session?.access_token) {
                console.error('No access token available')
                return
            }
            
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
            const apiUrl = backendUrl ? `${backendUrl}/api/friends/request/add` : '/api/friends/request/add'
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ recipientId })
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to send friend request')
            }
            
            const result = await response.json()
            console.log('Friend request sent:', result)
            
            // Update UI
            setSentRequests([...sentRequests, {
                user_id: recipientId,
                username: recipientUsername,
                status: 'pending',
                type: 'sent'
            }])
            
            // Update search results
            setSearchResults(searchResults.map(user => 
                user.user_id === recipientId 
                    ? { ...user, isPending: true, requestType: 'sent' }
                    : user
            ))
            
            mediumHapticsImpact()
        } catch (error) {
            console.error('Error sending friend request:', error)
        }
    }

    const acceptFriendRequest = async (requesterId) => {
        try {
            lightHapticsImpact()
            
            // Get the user's access token
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session?.access_token) {
                console.error('No access token available')
                return
            }
            
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
            const apiUrl = backendUrl ? `${backendUrl}/api/friends/request/accept` : '/api/friends/request/accept'
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ requesterId })
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to accept friend request')
            }
            
            // Refresh friends data
            fetchFriendsData()
            mediumHapticsImpact()
        } catch (error) {
            console.error('Error accepting friend request:', error)
        }
    }

    const declineFriendRequest = async (requesterId) => {
        try {
            lightHapticsImpact()
            
            // Get the user's access token
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session?.access_token) {
                console.error('No access token available')
                return
            }
            
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
            const apiUrl = backendUrl ? `${backendUrl}/api/friends/request/decline` : '/api/friends/request/decline'
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ requesterId })
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to decline friend request')
            }
            
            // Refresh friends data
            fetchFriendsData()
            mediumHapticsImpact()
        } catch (error) {
            console.error('Error declining friend request:', error)
        }
    }

    const removeFriend = async (friendId) => {
        try {
            lightHapticsImpact()
            
            // Get the user's access token
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session?.access_token) {
                console.error('No access token available')
                return
            }
            
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
            const apiUrl = backendUrl ? `${backendUrl}/api/friends/remove` : '/api/friends/remove'
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ friendId })
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to remove friend')
            }
            
            // Update UI
            setFriends(friends.filter(f => f.user_id !== friendId))
            mediumHapticsImpact()
        } catch (error) {
            console.error('Error removing friend:', error)
        }
    }

    const cancelFriendRequest = async (recipientId) => {
        try {
            lightHapticsImpact()
            
            // Get the user's access token
            const { data: { session } } = await supabase.auth.getSession()
            
            if (!session?.access_token) {
                console.error('No access token available')
                return
            }
            
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
            const apiUrl = backendUrl ? `${backendUrl}/api/friends/request/cancel` : '/api/friends/request/cancel'
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ recipientId })
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to cancel friend request')
            }
            
            // Update UI
            setSentRequests(sentRequests.filter(r => r.user_id !== recipientId))
            
            // Update search results if visible
            setSearchResults(searchResults.map(u => 
                u.user_id === recipientId 
                    ? { ...u, isPending: false, requestType: null }
                    : u
            ))
            
            mediumHapticsImpact()
        } catch (error) {
            console.error('Error canceling friend request:', error)
        }
    }

    if (!user) {
        return null // Don't render anything while redirecting
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-black">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Friends</h1>
                
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg 
                                 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white 
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setSearchResults([])
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex mt-4 space-x-2">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            activeTab === 'friends'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Friends ({friends.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors relative ${
                            activeTab === 'requests'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Requests
                        {pendingRequests.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {pendingRequests.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                            Search Results
                        </h3>
                        <div className="space-y-2">
                            {searchResults.map((result) => (
                                <div
                                    key={result.user_id}
                                    className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 
                                             rounded-lg border border-gray-200 dark:border-zinc-800"
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-gray-300 dark:bg-zinc-700 rounded-full 
                                                      flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                                            {result.username?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <span className="ml-3 text-gray-900 dark:text-white font-medium">
                                            {result.username}
                                        </span>
                                    </div>
                                    
                                    {result.isFriend ? (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Friends
                                        </span>
                                    ) : result.isPending ? (
                                        result.requestType === 'sent' ? (
                                            <button
                                                onClick={() => cancelFriendRequest(result.user_id)}
                                                className="text-sm text-gray-500 dark:text-gray-400"
                                            >
                                                Pending
                                            </button>
                                        ) : (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Request received
                                            </span>
                                        )
                                    ) : (
                                        <button
                                            onClick={() => sendFriendRequest(result.user_id, result.username)}
                                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Friends Tab */}
                {activeTab === 'friends' && (
                    <div>
                        {friends.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No friends yet. Search for users to add friends!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {friends.map((friend) => (
                                    <div
                                        key={friend.user_id}
                                        className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 
                                                 rounded-lg border border-gray-200 dark:border-zinc-800"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full 
                                                          flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium">
                                                {friend.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <span className="ml-3 text-gray-900 dark:text-white font-medium">
                                                {friend.username}
                                            </span>
                                        </div>
                                        
                                        <button
                                            onClick={() => removeFriend(friend.user_id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="space-y-6">
                        {/* Pending Requests */}
                        {pendingRequests.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                    Pending Requests
                                </h3>
                                <div className="space-y-2">
                                    {pendingRequests.map((request) => (
                                        <div
                                            key={request.user_id}
                                            className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 
                                                     rounded-lg border border-gray-200 dark:border-zinc-800"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full 
                                                              flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-medium">
                                                    {request.username?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <span className="ml-3 text-gray-900 dark:text-white font-medium">
                                                    {request.username}
                                                </span>
                                            </div>
                                            
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => acceptFriendRequest(request.user_id)}
                                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => declineFriendRequest(request.user_id)}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sent Requests */}
                        {sentRequests.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                                    Sent Requests
                                </h3>
                                <div className="space-y-2">
                                    {sentRequests.map((request) => (
                                        <div
                                            key={request.user_id}
                                            className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 
                                                     rounded-lg border border-gray-200 dark:border-zinc-800"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-full 
                                                              flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium">
                                                    {request.username?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div className="ml-3">
                                                    <span className="text-gray-900 dark:text-white font-medium">
                                                        {request.username}
                                                    </span>
                                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Pending
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={() => cancelFriendRequest(request.user_id)}
                                                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {pendingRequests.length === 0 && sentRequests.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No pending friend requests
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}