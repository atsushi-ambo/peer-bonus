"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { fetcher } from '@/lib/graphql';

// dayjs拡張
if (typeof window !== 'undefined') {
  dayjs.extend(relativeTime);
}

export default function Feed() {
  const { data: kudosData = { kudos: [] }, isLoading } = useQuery({
    queryKey: ['kudos'],
    queryFn: () => fetcher(`query { kudos { id message created_at receiver { name } } }`),
    refetchInterval: 5000,
  });
  const kudos = kudosData.kudos || [];
  return (
    <div className="space-y-4 max-w-2xl mx-auto py-8">
      {isLoading && <p>Loading kudos...</p>}
      <AnimatePresence>
        {kudos.map((k: any) => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-indigo-100/70 shadow-md">
              <CardHeader className="flex items-center gap-3">
                <Avatar className="bg-indigo-100 text-indigo-600">
                  <AvatarFallback>{k.receiver.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-indigo-700">{k.receiver.name}</p>
                  <p className="text-sm text-muted-foreground">{dayjs(k.created_at).fromNow()}</p>
                </div>
              </CardHeader>
              <CardContent className="text-lg">{k.message}</CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
      {!isLoading && kudos.length === 0 && <p>No kudos yet</p>}
    </div>
  );
}
