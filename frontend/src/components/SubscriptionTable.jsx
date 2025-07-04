import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubscriptions, deleteSubscription } from "@/api/subscriptions";
import { format } from "date-fns";
import { toast } from "sonner";
import { TrashIcon } from '@heroicons/react/24/outline';

export default function SubscriptionTable() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: getSubscriptions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Subscription deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete subscription");
    },
  });

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <p className="text-center p-4">Loading...</p>;
  if (isError) return <p className="text-center text-red-500 p-4">Error fetching data</p>;

  return (
    <Card className="mt-4 overflow-x-auto">
      <CardContent className="p-2 sm:p-4">
        <div className="w-full min-w-[500px] sm:min-w-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data) && data.length > 0 ? (
                data.map((sub) => (
                  <TableRow key={sub._id}>
                    <TableCell className="text-xs sm:text-base">{sub.name}</TableCell>
                    <TableCell className="text-xs sm:text-base">₹{sub.amount}</TableCell>
                    <TableCell className="capitalize text-xs sm:text-base">{sub.billingCycle}</TableCell>
                    <TableCell className="text-xs sm:text-base">{format(new Date(sub.renewalDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(sub._id)}
                        disabled={deleteMutation.isPending}
                        className="flex items-center justify-center px-2 py-1"
                        aria-label="Delete"
                      >
                        <span className="block sm:hidden">
                          <TrashIcon className="w-4 h-4" />
                        </span>
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="5" className="text-center text-xs sm:text-base">No subscriptions found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
