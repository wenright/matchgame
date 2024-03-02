import { useEffect, useState } from 'react';

const Timer = (props: { expiration: Date }) => {
    const [ms, setMs] = useState<number>(props.expiration.getTime() - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setMs(_ => {
                const diff = props.expiration.getTime() - Date.now();
                if (diff <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                
                return diff;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [props.expiration]);

    return (
        <div>
            {ms >= 0 &&
                <div>{(ms / 1000).toFixed(0)}</div>
            }
        </div>
    );
};

export default Timer;
