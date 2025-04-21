import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "../ui/dialog";
  import { Input } from "../ui/input";
  import { Label } from "../ui/label";
  import { Button } from "../ui/button";
  
  interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    userName: string;
    onChangeName: (name: string) => void;
    onCreateUser: () => void;
  }
  
  export default function UserDialog({
    isOpen,
    setIsOpen,
    userName,
    onChangeName,
    onCreateUser,
  }: Props) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[var(--background)]">
          <DialogHeader>
            <DialogTitle>Welcome to Ping Pong Booking</DialogTitle>
            <DialogDescription>
              Please enter your name to continue using the application.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => onChangeName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onCreateUser} disabled={!userName.trim()}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  