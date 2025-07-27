"use client"

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Combobox } from '@/components/ui/combobox';
import { Controller, useForm } from 'react-hook-form';
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner";
import { fetcher } from "@/lib/graphql"

export default function Home() {
  const { control, handleSubmit, reset } = useForm({ defaultValues: { message: '' } });
  const [recipientId, setRecipientId] = useState<string | null>(null);

  // Fetch users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetcher(`
      query GetUsers {
        users {
          id
          name
          email
        }
      }
    `),
  })
  
  // Send kudos mutation
  const { mutate: sendKudos, isPending: isSending } = useMutation({
    mutationFn: async (data: { recipientId: string | null; message: string }) => {
      if (!data.recipientId) throw new Error('Please select a user');
      if (!data.message.trim()) throw new Error('Please enter a message');
      return fetcher(`
        mutation SendKudos($input: SendKudosInput!) {
          sendKudos(input: $input) {
            id
            message
            receiver {
              id
              name
            }
          }
        }
      `, {
        input: {
          senderId: '00000000-0000-0000-0000-000000000000',
          receiverId: data.recipientId,
          message: data.message.trim(),
        },
      });
    },
    onSuccess: () => {
      reset();
      setRecipientId(null);
      toast.success("Kudos sent! 🎉");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to send kudos');
    },
  })

  const users = usersData?.users || [];
  const teammateOptions = users.map((u: any) => ({ label: u.name, value: u.id }));

  return (
    <main className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="sr-only">Peer Bonus</h1>
        <Card className="shadow-md mb-8">
          <CardHeader className="pb-0">
            <h2 className="text-xl font-semibold">Send Kudos</h2>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <form
              onSubmit={handleSubmit((data) => sendKudos({ recipientId, message: data.message }))}
              className="space-y-6"
            >
              <div>
                <Label>To</Label>
                <Combobox
                  options={teammateOptions}
                  value={recipientId}
                  onChange={setRecipientId}
                  placeholder="Select a teammate"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Controller
                  control={control}
                  name="message"
                  render={({ field }) => (
                    <Textarea
                      id="message"
                      placeholder="Say something nice..."
                      rows={3}
                      {...field}
                      className="mt-1"
                    />
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white"
                disabled={isSending || !recipientId}
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : "Send Kudos"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Team Members</h2>
          {isLoadingUsers ? (
            <div className="space-y-3">
              <div className="p-4 bg-white/80 dark:bg-card rounded-lg shadow border animate-pulse h-16"></div>
              <div className="p-4 bg-white/80 dark:bg-card rounded-lg shadow border animate-pulse h-16"></div>
              <div className="p-4 bg-white/80 dark:bg-card rounded-lg shadow border animate-pulse h-16"></div>
            </div>
          ) : (
            <ul className="space-y-3">
              {users.map((user: any) => (
                <Card key={user.id} className="p-4">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
