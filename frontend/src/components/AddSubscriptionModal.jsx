import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSubscription } from "@/api/subscriptions";
import { toast } from "sonner";

export default function AddSubscriptionModal({ open, onOpenChange }) {
  const qc = useQueryClient();
  const { mutate, isLoading } = useMutation({
    mutationFn: addSubscription,
    onSuccess: () => { 
      toast.success("Subscription added successfully");
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to add subscription"),
  });

  const handle = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    mutate(data);
  };

  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader title="Add Subscription" />
        <form onSubmit={handle} className="space-y-4">
          <Input name="name" placeholder="Service name" required />
          <Input name="amount" type="number" placeholder="Amount" required />
          <select name="billingCycle" className="w-full p-2 border rounded">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <Input name="renewalDate" type="date" required />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
