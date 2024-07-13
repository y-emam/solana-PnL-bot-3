function formatTime(seconds) {
    if (seconds < 3600) {
        let minutes = seconds / 60;
        return `${minutes.toFixed(2)} minutes`;
    } else if (seconds < 86400) {
        let hours = seconds / 3600;
        return `${hours.toFixed(2)} hours`;
    } else {
        let days = seconds / 86400;
        return `${days.toFixed(2)} days`;
    }
}

// Example usage
let timeInSeconds = 259433;
let formattedTime = formatTime(timeInSeconds);
console.log(formattedTime);
