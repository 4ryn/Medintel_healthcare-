'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  MessageSquare,
  Send,
  MoreVertical,
  Users,
  Calendar,
  Clock,
  Camera,
  ScreenShare,
  Settings,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Search,
  UserPlus,
  Volume2,
  VolumeX
} from 'lucide-react'
import { api } from '@/lib/api'

interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_role: 'patient' | 'doctor' | 'nurse' | 'admin' | 'technician'
  message: string
  timestamp: string
  message_type: 'text' | 'image' | 'file' | 'system'
  read: boolean
  file_url?: string
  file_name?: string
}

interface VideoCall {
  id: string
  participant_ids: string[]
  participants: Array<{
    id: string
    name: string
    role: string
    avatar?: string
  }>
  status: 'waiting' | 'active' | 'ended'
  start_time: string
  duration?: number
  recording_enabled: boolean
}

interface ChatRoom {
  id: string
  name: string
  type: 'direct' | 'group' | 'consultation'
  participants: Array<{
    id: string
    name: string
    role: string
    avatar?: string
    online: boolean
  }>
  last_message?: ChatMessage
  unread_count: number
}

export default function CommunicationCenter() {
  const [activeTab, setActiveTab] = useState('chat')
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [activeCall, setActiveCall] = useState<VideoCall | null>(null)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)
  const [loading, setLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    loadCommunicationData()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadCommunicationData = async () => {
    setLoading(true)
    try {
      // Load chat rooms and recent messages
      setChatRooms(mockChatRooms)
      if (mockChatRooms.length > 0) {
        setSelectedRoom(mockChatRooms[0])
        setMessages(mockMessages)
      }
    } catch (error) {
      console.error('Failed to load communication data:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender_id: 'current_user',
      sender_name: 'You',
      sender_role: 'patient',
      message: newMessage,
      timestamp: new Date().toISOString(),
      message_type: 'text',
      read: true
    }

    setMessages([...messages, message])
    setNewMessage('')

    // TODO: Send to API
    try {
      // await api.sendMessage(selectedRoom.id, newMessage)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const startVideoCall = async (roomId: string) => {
    try {
      setIsVideoCallActive(true)
      setActiveCall({
        id: Date.now().toString(),
        participant_ids: ['current_user', 'doctor_1'],
        participants: [
          { id: 'current_user', name: 'You', role: 'patient' },
          { id: 'doctor_1', name: 'Dr. Sarah Wilson', role: 'doctor' }
        ],
        status: 'active',
        start_time: new Date().toISOString(),
        recording_enabled: false
      })

      // Initialize WebRTC connection
      await initializeVideoCall()
    } catch (error) {
      console.error('Failed to start video call:', error)
      setIsVideoCallActive(false)
    }
  }

  const initializeVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoEnabled, 
        audio: audioEnabled 
      })
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Failed to access camera/microphone:', error)
    }
  }

  const endVideoCall = () => {
    setIsVideoCallActive(false)
    setActiveCall(null)
    setVideoEnabled(true)
    setAudioEnabled(true)
    setScreenSharing(false)

    // Stop video streams
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled)
    // TODO: Update video track
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
    // TODO: Update audio track
  }

  const toggleScreenShare = async () => {
    try {
      if (!screenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        setScreenSharing(true)
        // TODO: Replace video track with screen share
      } else {
        setScreenSharing(false)
        // TODO: Switch back to camera
      }
    } catch (error) {
      console.error('Screen sharing failed:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading communication center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Communication Center</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat Rooms */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatRooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedRoom?.id === room.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={room.participants[0]?.avatar} />
                      <AvatarFallback>
                        {room.participants[0]?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {room.participants[0]?.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900 truncate">{room.name}</p>
                      {room.unread_count > 0 && (
                        <Badge variant="default" className="ml-2">
                          {room.unread_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {room.last_message?.message || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedRoom.participants[0]?.avatar} />
                      <AvatarFallback>
                        {selectedRoom.participants[0]?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedRoom.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedRoom.participants[0]?.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startVideoCall(selectedRoom.id)}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === 'current_user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === 'current_user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button variant="outline" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a chat from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Call Modal */}
      {isVideoCallActive && activeCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl h-3/4 flex flex-col">
            {/* Call Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Video Call with {activeCall.participants[1]?.name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>00:45</span>
                </div>
              </div>
            </div>

            {/* Video Area */}
            <div className="flex-1 relative">
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />

              {/* Local Video */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              </div>

              {/* Participant Info */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg">
                <p className="text-sm">Dr. Sarah Wilson</p>
                <p className="text-xs opacity-75">Cardiologist</p>
              </div>
            </div>

            {/* Call Controls */}
            <div className="p-4 bg-gray-800">
              <div className="flex justify-center space-x-4">
                <Button
                  variant={audioEnabled ? "secondary" : "destructive"}
                  size="lg"
                  onClick={toggleAudio}
                  className="rounded-full w-12 h-12"
                >
                  {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>
                <Button
                  variant={videoEnabled ? "secondary" : "destructive"}
                  size="lg"
                  onClick={toggleVideo}
                  className="rounded-full w-12 h-12"
                >
                  {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>
                <Button
                  variant={screenSharing ? "default" : "secondary"}
                  size="lg"
                  onClick={toggleScreenShare}
                  className="rounded-full w-12 h-12"
                >
                  <ScreenShare className="h-6 w-6" />
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endVideoCall}
                  className="rounded-full w-12 h-12"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mock data
const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    type: 'direct',
    participants: [
      { id: 'doctor_1', name: 'Dr. Sarah Wilson', role: 'doctor', online: true }
    ],
    last_message: {
      id: '1',
      sender_id: 'doctor_1',
      sender_name: 'Dr. Sarah Wilson',
      sender_role: 'doctor',
      message: 'Your test results look good. Let\'s schedule a follow-up.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      message_type: 'text',
      read: false
    },
    unread_count: 2
  },
  {
    id: '2',
    name: 'Nurse Jennifer',
    type: 'direct',
    participants: [
      { id: 'nurse_1', name: 'Nurse Jennifer', role: 'nurse', online: false }
    ],
    last_message: {
      id: '2',
      sender_id: 'nurse_1',
      sender_name: 'Nurse Jennifer',
      sender_role: 'nurse',
      message: 'Please remember to take your medication at 8 PM.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      message_type: 'text',
      read: true
    },
    unread_count: 0
  },
  {
    id: '3',
    name: 'Cardiology Team',
    type: 'group',
    participants: [
      { id: 'doctor_1', name: 'Dr. Sarah Wilson', role: 'doctor', online: true },
      { id: 'nurse_2', name: 'Nurse Mike', role: 'nurse', online: true },
      { id: 'tech_1', name: 'Lab Tech Anna', role: 'technician', online: false }
    ],
    last_message: {
      id: '3',
      sender_id: 'tech_1',
      sender_name: 'Lab Tech Anna',
      sender_role: 'technician',
      message: 'ECG results uploaded to your file.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      message_type: 'text',
      read: true
    },
    unread_count: 0
  }
]

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    sender_id: 'doctor_1',
    sender_name: 'Dr. Sarah Wilson',
    sender_role: 'doctor',
    message: 'Hello! How are you feeling today?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    message_type: 'text',
    read: true
  },
  {
    id: '2',
    sender_id: 'current_user',
    sender_name: 'You',
    sender_role: 'patient',
    message: 'I\'m feeling much better, thank you! The medication is helping.',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    message_type: 'text',
    read: true
  },
  {
    id: '3',
    sender_id: 'doctor_1',
    sender_name: 'Dr. Sarah Wilson',
    sender_role: 'doctor',
    message: 'That\'s great to hear! Your test results look good. Let\'s schedule a follow-up appointment.',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    message_type: 'text',
    read: true
  },
  {
    id: '4',
    sender_id: 'current_user',
    sender_name: 'You',
    sender_role: 'patient',
    message: 'Sounds good! When would be a good time?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    message_type: 'text',
    read: true
  },
  {
    id: '5',
    sender_id: 'doctor_1',
    sender_name: 'Dr. Sarah Wilson',
    sender_role: 'doctor',
    message: 'How about next Tuesday at 2 PM? We can also do a video consultation if you prefer.',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    message_type: 'text',
    read: false
  }
]