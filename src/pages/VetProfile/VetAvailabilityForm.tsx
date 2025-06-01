
import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';

interface TimeSlot {
  id?: string; // Only present for existing slots
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const daysOfWeek = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [
    { value: `${hour}:00:00`, label: `${hour}:00` },
    { value: `${hour}:30:00`, label: `${hour}:30` }
  ];
}).flat();

const VetAvailabilityForm = () => {
  const { user } = useAuth();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vet_availability')
        .select('*')
        .eq('vet_id', user?.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setTimeSlots(data.map(slot => ({
          id: slot.id,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: slot.is_available
        })));
      } else {
        // Add a default time slot if none exists
        addNewTimeSlot();
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load your availability");
    } finally {
      setIsLoading(false);
    }
  };

  const addNewTimeSlot = () => {
    setTimeSlots([...timeSlots, {
      day_of_week: 1, // Monday as default
      start_time: '09:00:00',
      end_time: '17:00:00',
      is_available: true
    }]);
  };

  const removeTimeSlot = (index: number) => {
    const updatedSlots = [...timeSlots];
    const removedSlot = updatedSlots.splice(index, 1)[0];

    // If the slot has an ID, it exists in the database and needs to be deleted
    if (removedSlot.id) {
      deleteTimeSlot(removedSlot.id);
    }

    setTimeSlots(updatedSlots);
  };

  const deleteTimeSlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vet_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Time slot removed');
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast.error("Failed to delete time slot");
    }
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setTimeSlots(updatedSlots);
  };

  const saveAvailability = async () => {
    if (!user) {
      toast.error("You must be logged in to save availability");
      return;
    }

    // Validate time slots
    for (const slot of timeSlots) {
      if (slot.start_time >= slot.end_time) {
        toast.error("End time must be after start time");
        return;
      }
    }

    setIsSaving(true);
    try {
      // Process existing and new slots separately
      const existingSlots = timeSlots.filter(slot => slot.id);
      const newSlots = timeSlots.filter(slot => !slot.id);

      // Update existing slots
      for (const slot of existingSlots) {
        const { id, ...slotData } = slot;
        const { error } = await supabase
          .from('vet_availability')
          .update(slotData)
          .eq('id', id);

        if (error) throw error;
      }

      // Insert new slots
      if (newSlots.length > 0) {
        const { error } = await supabase
          .from('vet_availability')
          .insert(newSlots.map(slot => ({
            ...slot,
            vet_id: user.id
          })));

        if (error) throw error;
      }

      toast.success("Availability saved successfully!");
      
      // Refresh data from database
      fetchAvailability();
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Availability</CardTitle>
          <CardDescription>Loading your availability settings...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Availability</CardTitle>
        <CardDescription>Define the days and times you are available for consultations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {timeSlots.map((slot, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b pb-4">
            <div>
              <Label htmlFor={`day-${index}`}>Day</Label>
              <Select
                value={slot.day_of_week.toString()}
                onValueChange={(value) => updateTimeSlot(index, 'day_of_week', parseInt(value))}
              >
                <SelectTrigger id={`day-${index}`}>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor={`start-${index}`}>Start Time</Label>
              <Select
                value={slot.start_time}
                onValueChange={(value) => updateTimeSlot(index, 'start_time', value)}
              >
                <SelectTrigger id={`start-${index}`}>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor={`end-${index}`}>End Time</Label>
              <Select
                value={slot.end_time}
                onValueChange={(value) => updateTimeSlot(index, 'end_time', value)}
              >
                <SelectTrigger id={`end-${index}`}>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeTimeSlot(index)}
                disabled={timeSlots.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={addNewTimeSlot}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Time Slot
          </Button>
          
          <Button
            type="button"
            onClick={saveAvailability}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Availability
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VetAvailabilityForm;
