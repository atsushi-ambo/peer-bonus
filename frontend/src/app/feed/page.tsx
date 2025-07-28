"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/graphql';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

export default function Feed() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const { data: kudosData = { kudos: [] }, isLoading, refetch } = useQuery({
    queryKey: ['kudos'],
    queryFn: () => fetcher(`query { 
      kudos { 
        id 
        message 
        createdAt 
        sender { name } 
        receiver { name }
        reactions {
          reactionType
          count
          userReacted
        }
      } 
    }`),
    refetchInterval: 10000,
  });
  
  const kudos = kudosData.kudos || [];
  
  const handleReaction = async (kudosId: string, reactionType: string) => {
    try {
      await fetcher(`
        mutation ToggleReaction($input: ToggleReactionInput!) {
          toggleReaction(input: $input)
        }
      `, {
        input: {
          kudosId: kudosId,
          reactionType: reactionType
        }
      });
      
      // Refetch the kudos to get updated reaction counts
      refetch();
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };
  
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <AppShell>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Navigation */}
      <div style={{
        backgroundColor: '#4a154b',
        color: 'white',
        padding: '12px 0',
        borderBottom: '1px solid #6b2c5c'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#007a5a', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              🎉
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Peer Bonus</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>Recognize Amazing Work</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                ✨ Send Kudos
              </div>
            </Link>
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#8b2a5b',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              📊 View Feed
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
        minHeight: 'calc(100vh - 80px)'
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#4a154b',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 16px'
          }}>
            📊
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1a202c',
            margin: '0 0 8px 0'
          }}>
            Kudos Feed
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#718096',
            margin: '0 0 24px 0'
          }}>
            See all the amazing recognition happening in your team
          </p>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              backgroundColor: '#007a5a',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <span>✨</span>
              Send Kudos
            </button>
          </Link>
        </div>

        {/* Feed Content */}
        <div>
          {isLoading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: '#f3f4f6', 
                      borderRadius: '12px',
                      animation: 'pulse 2s infinite'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        height: '20px', 
                        backgroundColor: '#f3f4f6', 
                        borderRadius: '4px',
                        marginBottom: '12px',
                        width: '60%',
                        animation: 'pulse 2s infinite'
                      }}></div>
                      <div style={{ 
                        height: '60px', 
                        backgroundColor: '#f3f4f6', 
                        borderRadius: '8px',
                        animation: 'pulse 2s infinite'
                      }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : kudos.length > 0 ? (
            <div>
              {kudos.map((k: any, index: number) => {
                const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
                const receiverColor = colors[index % colors.length];
                const senderColor = colors[(index + 1) % colors.length];
                
                return (
                  <div key={k.id} style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '20px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
                      {/* Receiver Avatar */}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: receiverColor,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        flexShrink: 0
                      }}>
                        {k.receiver?.name ? k.receiver.name.split(' ').map((n: string) => n[0]).join('') : '?'}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Header */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '16px',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 'bold', color: '#1a202c', fontSize: '16px' }}>
                              {k.receiver?.name || 'Unknown'}
                            </span>
                            <span style={{ color: '#718096', fontSize: '14px' }}>received kudos from</span>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              backgroundColor: senderColor,
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '11px'
                            }}>
                              {k.sender?.name ? k.sender.name.split(' ').map((n: string) => n[0]).join('') : '?'}
                            </div>
                            <span style={{ fontWeight: '500', color: '#374151', fontSize: '15px' }}>
                              {k.sender?.name || 'Someone'}
                            </span>
                          </div>
                          <span style={{ color: '#9ca3af', fontSize: '13px', flexShrink: 0 }}>
                            {k.createdAt ? formatTimeAgo(k.createdAt) : 'Recently'}
                          </span>
                        </div>
                        
                        {/* Message */}
                        <div style={{
                          backgroundColor: '#f0f9ff',
                          border: '1px solid #e0f2fe',
                          borderRadius: '12px',
                          padding: '16px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                            <span style={{ fontSize: '18px', flexShrink: 0 }}>💬</span>
                            <p style={{ 
                              color: '#1e293b', 
                              lineHeight: '1.5',
                              margin: 0,
                              fontSize: '15px'
                            }}>
                              {k.message}
                            </p>
                          </div>
                        </div>
                        
                        {/* Reaction Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          {k.reactions?.map((reaction: any, idx: number) => (
                            <button 
                              key={reaction.reactionType} 
                              onClick={() => handleReaction(k.id, reaction.reactionType)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = reaction.userReacted ? '#e0f2fe' : '#f3f4f6';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = reaction.userReacted ? '#f0f9ff' : 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                              style={{
                                backgroundColor: reaction.userReacted ? '#f0f9ff' : 'transparent',
                                border: reaction.userReacted ? '1px solid #0ea5e9' : '1px solid transparent',
                                color: reaction.userReacted ? '#0284c7' : '#9ca3af',
                                fontSize: '16px',
                                cursor: 'pointer',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                              }}
                            >
                              <span>{reaction.reactionType}</span>
                              <span style={{ fontSize: '14px', fontWeight: reaction.userReacted ? 'bold' : 'normal' }}>
                                {reaction.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '48px 24px',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px', margin: '0 0 8px 0' }}>
                No kudos yet
              </h3>
              <p style={{ color: '#718096', fontSize: '16px', marginBottom: '24px', margin: '0 0 24px 0' }}>
                Be the first to spread some positivity!
              </p>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <button style={{
                  backgroundColor: '#007a5a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <span>✨</span>
                  Send the First Kudos
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      </div>
    </AppShell>
  );
}