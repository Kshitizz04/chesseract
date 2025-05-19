export const getTimeAgo = (lastDate: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let timeAgo;
    if (diffDays < 1) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 1) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        timeAgo = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
        timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    } else if (diffDays === 1) {
    timeAgo = 'yesterday';
    } else {
    timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    return timeAgo;
}

