import { useEffect, useState } from 'react';

const Timer = (props: { expiration: Date }) => {
    const timeRemaining = (props.expiration.getTime() - (new Date()).getTime()) / 1000;
    
    const [seconds, setSeconds] = useState<number>(timeRemaining);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(seconds => seconds - 1);

            if (seconds <= 0) {
                // TODO end game
                setSeconds(0);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div>{seconds.toFixed(0)}</div>
        </div>
    );
};

export default Timer;
