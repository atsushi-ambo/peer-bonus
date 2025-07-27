import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
// import { ComboboxComponent } from '@/components/ComboboxComponent'; // Uncomment if available
// import { useForm } from 'react-hook-form'; // Uncomment if using react-hook-form
// import { api } from '@/lib/api'; // Uncomment if using tRPC or similar

export function SendKudosForm() {
  // const form = useForm();
  // const mutation = api.kudos.create.useMutation();
  const mutation = { isPending: false }; // Placeholder

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="shadow-md">
        <CardHeader className="font-semibold text-lg">Send Kudos</CardHeader>
        <CardContent className="space-y-4">
          {/* teammate combobox */}
          <label className="block text-sm font-medium">To</label>
          {/* <ComboboxComponent /> */}
          <input className="w-full border rounded px-3 py-2" placeholder="Teammate…" />

          {/* message */}
          <label className="block text-sm font-medium">Message</label>
          <Textarea
            placeholder="Say something nice…"
            rows={3}
            // {...form.register('message')}
          />

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary hover:bg-primary-hover"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send Kudos
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
