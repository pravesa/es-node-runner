/**
 * This function converts the millisecond to readable time format.
 * @param millisecond time in milliseconds
 * @returns time formatted as [n] h [n] m [n] s, where n is number
 */
function formatElapsedTime(millisecond: number) {
  const timeInSeconds = millisecond / 1000;

  let time = '';

  if (timeInSeconds >= 60) {
    let minutes = Math.floor(timeInSeconds / 60);

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      minutes = Math.round(minutes % 60);
      time += `${hours} h `;
    }
    time += `${minutes} m `;
  }
  return time + `${Math.round(timeInSeconds % 60)} s`;
}

export default formatElapsedTime;
