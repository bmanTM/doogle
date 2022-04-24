import { RefreshIcon } from '@heroicons/react/solid';
import LoadingAnim from '../images/animated_loading.svg';

const ActivityUL = ( { label, value, bar, barLeftMarker, barRightMarker } ) => {

    const SubCat = () => {
        if (bar) {
            const widthStyle = () => {
                return (
                    {
                        width: `${Math.floor(value*100)}%`,
                    }
                )
            }

            return (

                <div className="h-full w-full bg-gray-200 rounded-lg overflow-hidden border border-gray-600 relative">
                    <div className="h-full w-full grid place-items-center">
                        <div className="z-50 w-full flex justify-between px-2">
                            <p className="opacity-25 align-middle">{barLeftMarker}</p>
                            <p className="opacity-25 align-middle">{barRightMarker}</p>
                        </div>
                    </div>
                    <div style={widthStyle()} className="absolute bottom-0 top-0 z-20 bg-rose-400">
                        
                    </div>
                </div>
            )
        } else {
            return (<span className="pl-2">{value}</span>)
        }
    }

    return(
        <li className="border-t-2 last:border-b-2 flex">
            <h1 className="pr-2 py-1 text-right font-semibold border-r-2 flex-grow w-1/3">{label}</h1>
            <h2 className="w-2/3 p-1"><SubCat/></h2>
        </li>
    )
}

const ActivityLI = ( {children} ) => {
    
    return(
        <ul className="mx-4 list-none">
            {children}
        </ul>
    )
}

const Activity = ({ activity, fetchNew }) => {
    function updateActivity(e) {
        console.log("button");
        e.preventDefault();
        fetchNew();
    }

    const ActivityBox = () => {
        const ActivityInfo = () => {
            if (activity === undefined) {
                return (
                    <div className="flex-grow grid place-items-center">
                        <h2 className="text-center text-md text-rose-500">unable to retrieve activity...</h2>
                    </div>
                )
            }
            if (activity === "loading") {
                return (
                    <div className="flex justify-center w-full bg-transparent">
                        <img className="bg-transparent" alt="" src={LoadingAnim} />
                    </div>
                )
            }

            return (
                <div>
                    <h2 className="mt-4 text-center text-lg"><i>{activity.activity}</i></h2>
                    <div className="mb-4">
                        <ActivityLI>
                            <ActivityUL label="type" value={activity.type} />
                            <ActivityUL label="participants" value={activity.participants} />
                            <ActivityUL label="price" value={activity.price} bar={true} barLeftMarker={"$"} barRightMarker={"$$$"} />
                            <ActivityUL label="accessibility" value={activity.accessibility} bar={true} barLeftMarker={"low"} barRightMarker={"high"} />
                        </ActivityLI>
                    </div>
                </div>
            )
        }

        return (
            <div className="flex flex-col h-full">
                <div className="flex justify-center space-x-2.5">
                    <h1 className="text-center text-xl font-semibold">Suggested Activity</h1>
                    <button onClick={updateActivity} className="rounded-full p-1 bg-gray-400 hover:bg-gray-600"><RefreshIcon className="w-5"/></button>
                </div>
                <ActivityInfo />
            </div>
        )
    }

    return(
        <div className="flex flex-col justify-start">
            <ActivityBox />
        </div>
    )
}

export default Activity;