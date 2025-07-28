"use client"

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form';
import { toast } from "sonner";
import { useUsers, useSendKudos } from "@/lib/graphql"
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/AppShell'
import Link from 'next/link'

export default function Home() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, formState: { errors } } = useForm({ 
    defaultValues: { message: '' },
    mode: 'onChange'
  });
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery(useUsers())
  
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
      toast.success("Kudos sent! 🎉");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['kudos'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to send kudos');
    },
  })

  const users = usersData?.users || [];
  // Filter out current user from recipients
  const availableUsers = users.filter(u => u.id !== currentUser?.id);

  return (
    <AppShell>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Main Content */}
          <div>
            {/* Hero Section */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#007a5a',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 16px'
              }}>
                ✨
              </div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: '0 0 8px 0'
              }}>
                Send Kudos
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#718096',
                margin: 0
              }}>
                Recognize someone's amazing work and spread positivity
              </p>
            </div>

            {/* Send Kudos Form */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e2e8f0', 
              borderRadius: '16px', 
              padding: '32px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              marginBottom: '32px'
            }}>
                
                <form onSubmit={handleSubmit((data) => sendKudos({ recipientId, message: data.message }))}>
                  <div style={{ marginBottom: '16px', position: 'relative' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '6px'
                    }}>To</label>
                    
                    {/* Custom Dropdown */}
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          textAlign: 'left',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ color: recipientId ? '#374151' : '#9ca3af' }}>
                          {recipientId ? 
                            availableUsers.find(u => u.id === recipientId)?.name || 'Select a teammate' : 
                            '🔍 Select a teammate'
                          }
                        </span>
                        <span style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                      </button>
                      
                      {dropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'white',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          marginTop: '4px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          zIndex: 1000,
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {availableUsers.map((user: any, index: number) => {
                            const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
                            const color = colors[index % colors.length];
                            
                            return (
                              <div
                                key={user.id}
                                onClick={() => {
                                  setRecipientId(user.id);
                                  setDropdownOpen(false);
                                }}
                                style={{
                                  padding: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  borderBottom: index < availableUsers.length - 1 ? '1px solid #f3f4f6' : 'none',
                                  backgroundColor: recipientId === user.id ? '#f0f9ff' : 'transparent',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  if (recipientId !== user.id) {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (recipientId !== user.id) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }
                                }}
                              >
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  backgroundColor: color,
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  color: 'white'
                                }}>
                                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <span style={{ fontSize: '14px', color: '#374151' }}>{user.name}</span>
                                {recipientId === user.id && (
                                  <span style={{ marginLeft: 'auto', color: '#007a5a', fontSize: '16px' }}>✓</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {!recipientId && (
                      <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', margin: '4px 0 0 0' }}>
                        Please select a teammate to send kudos to
                      </p>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      color: '#374151',
                      marginBottom: '6px'
                    }}>Message</label>
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
                            placeholder="Write something amazing about your teammate... 💭"
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: errors.message ? '1px solid #ef4444' : '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px',
                              resize: 'none',
                              outline: 'none',
                              fontFamily: 'inherit'
                            }}
                          />
                          {errors.message && (
                            <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>
                              {errors.message.message}
                            </p>
                          )}
                          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', margin: '4px 0 0 0' }}>
                            {field.value.length}/500 characters
                          </p>
                        </div>
                      )}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSending || !recipientId}
                    style={{
                      width: '100%',
                      backgroundColor: isSending || !recipientId ? '#9ca3af' : '#007a5a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: isSending || !recipientId ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSending ? (
                      <>
                        <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Kudos...
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        Send Kudos
                      </>
                    )}
                  </button>
                </form>
              </div>
              
            {/* Success Message */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#166534',
                margin: '0 0 8px 0'
              }}>
                Ready to spread positivity?
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#166534',
                margin: 0
              }}>
                Select a teammate above and send your kudos to make their day!
              </p>
            </div>
          </div>

          {/* Team Sidebar */}
          {!isMobile && (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              height: 'fit-content'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#4a154b',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}>
                  👥
                </div>
                <div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1a202c',
                    margin: 0
                  }}>
                    Team Members
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: '#718096',
                    margin: 0
                  }}>
                    {availableUsers.length} amazing teammates
                  </p>
                </div>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {isLoadingUsers ? (
                  <div>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '8px',
                          animation: 'pulse 2s infinite'
                        }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            height: '14px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '4px',
                            marginBottom: '4px',
                            animation: 'pulse 2s infinite'
                          }}></div>
                          <div style={{
                            height: '12px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '4px',
                            width: '60%',
                            animation: 'pulse 2s infinite'
                          }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {users.map((user: any, index: number) => {
                      const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
                      const color = colors[index % colors.length];
                      
                      return (
                        <div key={user.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          marginBottom: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setRecipientId(user.id)}
                        >
                          <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: color,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'white',
                            flexShrink: 0
                          }}>
                            {user.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1a202c',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {user.name}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#718096'
                            }}>
                              Team Member
                            </div>
                          </div>
                          {recipientId === user.id && (
                            <div style={{
                              color: '#007a5a',
                              fontSize: '16px'
                            }}>
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </AppShell>
  )
}
