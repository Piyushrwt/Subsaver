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
    <Card className="mt-4">
      <CardContent className="p-4">
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
                  <TableCell>{sub.name}</TableCell>
                  <TableCell>₹{sub.amount}</TableCell>
                  <TableCell className="capitalize">{sub.billingCycle}</TableCell>
                  <TableCell>{format(new Date(sub.renewalDate), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(sub._id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="text-center">No subscriptions found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
