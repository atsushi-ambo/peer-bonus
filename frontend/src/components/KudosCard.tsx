import { Card, CardContent, CardHeader } from '@/components/ui/card';
// import { Avatar } from '@/components/ui/avatar'; // Uncomment if available
// import dayjs from 'dayjs';
// import relativeTime from 'dayjs/plugin/relativeTime';
// dayjs.extend(relativeTime);

export function KudosCard({ user, kudos }: { user: any; kudos: any }) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex items-center gap-3">
        {/* <Avatar user={user} /> */}
        <div>
          <p className="font-medium">{user.name}</p>
          {/* <p className="text-xs text-gray-500">{dayjs(user.createdAt).fromNow()}</p> */}
        </div>
      </CardHeader>
      <CardContent>{kudos.message}</CardContent>
    </Card>
  );
}
