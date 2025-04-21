"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { Trophy, Users, Calendar, Clock, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { v4 as uuidv4 } from "uuid"
import { addTournament, getTournaments, Tournament, updateTournament } from "@/lib/db/tournament"



export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTournament, setNewTournament] = useState({
    name: "",
    type: "singles",
    date: "",
    startTime: "",
    endTime: "",
    maxParticipants: "8",
  })

  useEffect(() => {
    const fetchData = async () => {
      // Get current user from localStorage
      const username = localStorage.getItem("username")
      setCurrentUser(username)

      // Get tournaments
      try {
        const tournamentData = await getTournaments()
        setTournaments(tournamentData)
      } catch (error) {
        console.error("Error fetching tournaments:", error)
        toast.error("Failed to load tournaments")
      }
    }

    fetchData()
  }, [])

  const refreshTournaments = async () => {
    try {
      const tournamentData = await getTournaments()
      setTournaments(tournamentData)
    } catch (error) {
      console.error("Error refreshing tournaments:", error)
      toast.error("Failed to refresh tournaments")
    }
  }

  const handleCreateTournament = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to create a tournament")
      return
    }

    // Validate form
    if (!newTournament.name || !newTournament.date || !newTournament.startTime || !newTournament.endTime) {
      toast.error("Please fill in all required fields")
      return
    }

    // Create start and end times
    const startDateTime = new Date(`${newTournament.date}T${newTournament.startTime}:00`)
    const endDateTime = new Date(`${newTournament.date}T${newTournament.endTime}:00`)

    // Validate times
    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time")
      return
    }

    try {
      const tournamentId = uuidv4()
      
      await addTournament({
        id: tournamentId,
        name: newTournament.name,
        type: newTournament.type as "singles" | "doubles",
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        participants: [currentUser], // Add creator as first participant
        matches: [],
        status: "upcoming",
        createdBy: currentUser,
        createdAt: new Date(),
      })

      toast.success("Tournament created successfully")

      // Reset form and close dialog
      setNewTournament({
        name: "",
        type: "singles",
        date: "",
        startTime: "",
        endTime: "",
        maxParticipants: "8",
      })
      setIsCreateDialogOpen(false)
      refreshTournaments()
    } catch (error) {
      console.error("Error creating tournament:", error)
      toast.error("Failed to create tournament")
    }
  }

  const handleJoinTournament = async (tournament: Tournament) => {
    if (!currentUser) {
      toast.error("You must be logged in to join a tournament")
      return
    }

    if (tournament.participants.includes(currentUser)) {
      toast.error("You are already registered for this tournament")
      return
    }

    try {
      // Add current user to participants
      const updatedTournament = {
        ...tournament,
        participants: [...tournament.participants, currentUser]
      }
      
      await updateTournament(updatedTournament)
      toast.success("Successfully joined tournament")
      refreshTournaments()
    } catch (error) {
      console.error("Error joining tournament:", error)
      toast.error("Failed to join tournament")
    }
  }

  const isUserInTournament = (tournament: Tournament) => {
    if (!currentUser) return false
    return tournament.participants.includes(currentUser)
  }

  const getParticipantCount = (tournament: Tournament) => {
    return tournament.participants.length
  }

  const getMaxParticipants = (tournament: Tournament) => {
    // This should be stored in the tournament object, but for now we'll use a simple approach
    if (tournament.type === "singles") {
      return 8 // Default for singles
    } else {
      return 16 // Default for doubles (8 teams of 2)
    }
  }

  const getUpcomingTournaments = () => {
    return tournaments.filter(t => t.status === "upcoming")
  }

  const getOngoingTournaments = () => {
    return tournaments.filter(t => t.status === "ongoing")
  }

  const getCompletedTournaments = () => {
    return tournaments.filter(t => t.status === "completed")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tournaments</h1>
          <p className="text-muted-foreground">Create and join ping pong tournaments.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[var(--background)] ">
            <DialogHeader>
              <DialogTitle>Create New Tournament</DialogTitle>
              <DialogDescription>
                Set up a new ping pong tournament. The table will be reserved during tournament hours.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newTournament.name}
                  onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={newTournament.type}
                  onValueChange={(value) => setNewTournament({ ...newTournament, type: value as "singles" | "doubles" })}
                >
                  <SelectTrigger id="type" className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="singles">Singles</SelectItem>
                    <SelectItem value="doubles">Doubles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newTournament.date}
                  onChange={(e) => setNewTournament({ ...newTournament, date: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newTournament.startTime}
                  onChange={(e) => setNewTournament({ ...newTournament, startTime: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newTournament.endTime}
                  onChange={(e) => setNewTournament({ ...newTournament, endTime: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxParticipants" className="text-right">
                  Players
                </Label>
                <Select
                  value={newTournament.maxParticipants}
                  onValueChange={(value) => setNewTournament({ ...newTournament, maxParticipants: value })}
                >
                  <SelectTrigger id="maxParticipants" className="col-span-3">
                    <SelectValue placeholder="Max participants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 players</SelectItem>
                    <SelectItem value="8">8 players</SelectItem>
                    <SelectItem value="16">16 players</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTournament}>Create Tournament</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {getUpcomingTournaments().length === 0 ? (
              <p className="text-muted-foreground col-span-2">No upcoming tournaments.</p>
            ) : (
              getUpcomingTournaments().map((tournament) => (
                <Card key={tournament.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-primary" />
                      {tournament.name}
                    </CardTitle>
                    <CardDescription>
                      {tournament.type === "singles" ? "Singles" : "Doubles"} Tournament
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{format(parseISO(tournament.startDate), "EEEE, MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {format(parseISO(tournament.startDate), "h:mm a")} -{" "}
                          {format(parseISO(tournament.endDate), "h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {getParticipantCount(tournament)} / {getMaxParticipants(tournament)} participants
                        </span>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Participants</h4>
                        <ScrollArea className="h-20">
                          <div className="space-y-1">
                            {tournament.participants.map((participant, index) => (
                              <div key={index} className="text-sm">
                                {participant}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {isUserInTournament(tournament) ? (
                      <Badge variant="outline" className="w-full justify-center py-1">
                        Registered
                      </Badge>
                    ) : (
                      <Button
                        className="w-full"
                        disabled={getParticipantCount(tournament) >= getMaxParticipants(tournament)}
                        onClick={() => handleJoinTournament(tournament)}
                      >
                        Join Tournament
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="ongoing">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {getOngoingTournaments().length === 0 ? (
              <p className="text-muted-foreground col-span-2">No ongoing tournaments.</p>
            ) : (
              getOngoingTournaments().map((tournament) => (
                <Card key={tournament.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-primary" />
                      {tournament.name}
                    </CardTitle>
                    <CardDescription>
                      {tournament.type === "singles" ? "Singles" : "Doubles"} Tournament
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{format(parseISO(tournament.startDate), "EEEE, MMMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {format(parseISO(tournament.startDate), "h:mm a")} -{" "}
                          {format(parseISO(tournament.endDate), "h:mm a")}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast("Tournament bracket view will be available in a future update", {
                            description: "Feature coming soon"
                          })
                        }}
                      >
                        View Bracket
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {getCompletedTournaments().length === 0 ? (
              <p className="text-muted-foreground col-span-2">No completed tournaments.</p>
            ) : (
              getCompletedTournaments().map((tournament) => (
                <Card key={tournament.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-primary" />
                      {tournament.name}
                    </CardTitle>
                    <CardDescription>
                      {tournament.type === "singles" ? "Singles" : "Doubles"} Tournament
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{format(parseISO(tournament.startDate), "EEEE, MMMM d, yyyy")}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Winner</h4>
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                          <span>{tournament.winner || "Not recorded"}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          toast("Tournament results will be available in a future update", {
                            description: "Feature coming soon"
                          })
                        }}
                      >
                        View Results
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}