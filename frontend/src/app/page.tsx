"use client"

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form';
import { toast } from "sonner";
import { useUsers, useSendKudos } from "@/lib/graphql"
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/AppShell'

export default function Home() {
  const { user: currentUser, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, formState: { errors } } = useForm({ 
    defaultValues: { message: '' },
    mode: 'onChange'
  });
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch users only if logged in
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useQuery({
    ...useUsers(),
    enabled: isLoggedIn,
  })
  
  // Send kudos mutation
  const { sendKudos: sendKudosMutation } = useSendKudos();
  const { mutate: sendKudos, isPending: isSending } = useMutation({
    mutationFn: async (data: { recipientId: string | null; message: string }) => {
      if (!data.recipientId) throw new Error('Please select a user');
      if (!data.message.trim()) throw new Error('Please enter a message');
      
      return sendKudosMutation({
        receiverId: data.recipientId,
        message: data.message.trim(),
      });
    },
    onSuccess: () => {
      reset();
      setRecipientId(null);
      toast.success('Kudos sent successfully! 🎉', {
        description: "Your appreciation has been shared with the team!",
      });
      queryClient.invalidateQueries({ queryKey: ['kudos'] });
    },
    onError: (error) => {
      console.error('Send kudos error:', error);
      toast.error('Failed to send kudos', {
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      });
    },
  });

  const users = usersData?.users || [];
  const availableUsers = users.filter(u => u.id !== currentUser?.id);

  // Show error if users failed to load
  if (usersError) {
    console.error('Users loading error:', usersError);
  }
  
  return (
    <AppShell>
      {/* Slack-like Layout */}
      <div className="h-screen bg-gray-50 flex flex-col">
        
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar - Slack-like */}
          <div className="w-64 bg-gray-800 text-white flex flex-col">
            {/* Workspace Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center font-bold text-sm">
                  PB
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Peer Bonus</h2>
                  <p className="text-xs text-gray-400">{users.length} members</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-4 space-y-1">
              <div className="text-gray-300 text-xs font-semibold uppercase tracking-wide mb-2">
                Navigation
              </div>
              <button className="w-full text-left px-3 py-2 rounded text-sm bg-blue-600 text-white flex items-center gap-2">
                <span>✨</span>
                Send Kudos
              </button>
              <button 
                onClick={() => window.location.href = '/feed'}
                className="w-full text-left px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
              >
                <span>📊</span>
                Feed
              </button>
            </div>

            {/* Team Members */}
            <div className="flex-1 p-4">
              <div className="text-gray-300 text-xs font-semibold uppercase tracking-wide mb-3">
                Team Members ({availableUsers.length})
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {isLoadingUsers ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1">
                        <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-600 rounded flex-1 animate-pulse"></div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {users.map((user: any, index: number) => {
                      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
                      const colorClass = colors[index % colors.length];
                      const isSelected = recipientId === user.id;
                      
                      return (
                        <button
                          key={user.id}
                          onClick={() => setRecipientId(user.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors ${
                            isSelected ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <div className={`w-6 h-6 ${colorClass} rounded flex items-center justify-center text-xs font-bold text-white`}>
                            {user.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <span className="truncate">{user.name}</span>
                          {isSelected && <span className="ml-auto text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area - Slack-like */}
          <div className="flex-1 flex flex-col bg-white">
            
            {/* Channel Header */}
            <div className="h-16 border-b border-gray-200 flex items-center px-6 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                  ✨
                </div>
                <div>
                  <h1 className="font-bold text-lg text-gray-900">Send Kudos</h1>
                  <p className="text-sm text-gray-500">Recognize amazing work</p>
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              
              {/* Welcome Message */}
              <div className="max-w-2xl">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">
                      PB
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Welcome to Peer Bonus! 👋</h3>
                      <p className="text-blue-800 text-sm mt-1">
                        Recognize someone's amazing work and spread positivity throughout your team. 
                        Select a teammate from the sidebar and write them a heartfelt message below.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit((data) => sendKudos({ recipientId, message: data.message }))} className="space-y-4">
                  
                  {/* Selected Recipient */}
                  {recipientId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">Sending kudos to:</span>
                        <span className="font-semibold text-green-800">
                          {availableUsers.find(u => u.id === recipientId)?.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRecipientId(null)}
                          className="ml-auto text-green-600 hover:text-green-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Input - Slack-like */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>💬</span>
                        <span>Write your message...</span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <Controller
                        control={control}
                        name="message"
                        rules={{ 
                          required: "Please write a message",
                          minLength: { value: 10, message: "Message should be at least 10 characters" },
                          maxLength: { value: 500, message: "Message should be less than 500 characters" }
                        }}
                        render={({ field }) => (
                          <div>
                            <textarea
                              {...field}
                              placeholder="Thanks for helping me with the project! Your attention to detail made all the difference... ✨"
                              rows={4}
                              className="w-full resize-none border-0 focus:outline-none text-sm placeholder-gray-400"
                            />
                            
                            {/* Message Footer */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-4">
                                <button type="button" className="text-gray-400 hover:text-gray-600 text-sm">
                                  😊 Add emoji
                                </button>
                                <span className="text-xs text-gray-400">
                                  {field.value.length}/500
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {!recipientId && (
                                  <span className="text-xs text-orange-600">
                                    Select a teammate first
                                  </span>
                                )}
                                <button
                                  type="submit"
                                  disabled={isSending || !recipientId || !field.value.trim()}
                                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                                    isSending || !recipientId || !field.value.trim()
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow'
                                  }`}
                                >
                                  {isSending ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                                      Sending...
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span>🚀</span>
                                      Send Kudos
                                    </div>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  {/* Error Display */}
                  {errors.message && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-600 text-sm">{errors.message.message}</p>
                    </div>
                  )}
                </form>

                {/* Tips */}
                <div className="mt-8 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Tips for great kudos:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Be specific about what they did well</li>
                    <li>• Mention the impact of their work</li>
                    <li>• Keep it genuine and personal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}