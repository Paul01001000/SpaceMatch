export const roundToNearest15Minutes = (
  timeString: string
): [number, number] => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;

  // Calculate the nearest 15-minute interval
  const remainder = totalMinutes % 15;
  let roundedMinutes = totalMinutes;

  if (remainder !== 0) {
    if (remainder <= 7) {
      // If less than or equal to 7.5 minutes past, round down
      roundedMinutes -= remainder;
    } else {
      // If more than 7.5 minutes past, round up
      roundedMinutes += 15 - remainder;
    }
  }

  // Convert back to HH:MM format
  const newHours = Math.floor(roundedMinutes / 60) % 24; // Ensure hours wrap around midnight
  const newMinutes = roundedMinutes % 60;

  return [newHours, newMinutes];
};

export const formatTime = (hours: number, minutes: number): string => {
  return `${hours < 10 ? "0" + hours : hours}:${minutes === 0 ? "00" : minutes}`;
};
