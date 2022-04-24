import React from 'react';
import { ClipboardIcon } from '@heroicons/react/solid';
import { copyImageToClipboard } from 'copy-image-clipboard'
import SadDogGIF from '../images/sad-dog.gif'
import LoadingAnim from '../images/animated_loading.svg';
import Activity from './Activity';
import SuggestionBox from './Suggestions';

const ResultState = {
    NONE: 0,
    LOADING: 1,
    RESULT: 2,
    ERROR: -1,
  }

const ResultBox = ({imageSRC, children, allowCopy, backgroundEffect }) => {
    function copyToClipboard() {
        copyImageToClipboard(imageSRC)
        .catch((e) => {
            console.error("Failed copy to clipboard");
        })
    }

    const imageBGStyle = () => {
        if (backgroundEffect) {
            return (
                {
                    backgroundImage: `linear-gradient(90deg, rgba(222, 71, 69, .2) 30%, transparent 0), linear-gradient(rgba(125, 125, 125, .2) 30%, transparent 0)`,
                    backgoundRepeat: `repeat`,
                    backgroundSize: `20px 20px`,
                }
            )
        }
        return ({})
    }

    return (
        <div className="w-full max-w-2xl mx-4 bg-gray-100 flex rounded-3xl drop-shadow-xl overflow-hidden">
            <div className="w-1/2 flex flex-col">
                <div className="flex-grow grid place-items-center bg-blend-hue" style={imageBGStyle()}>
                    <div className="relative w-full">
                        <div className='flex items-center overflow-hidden'>
                            <img alt="" src={imageSRC} className="w-full"></img>
                        </div>
                        <button onClick={copyToClipboard} className={(allowCopy ? '' : 'hidden ')+'group p-1 bg-gray-100 w-8 h-8 absolute bottom-2 right-2 rounded-full z-50 hover:bg-gray-800'}>
                            <ClipboardIcon className='group-hover:text-white'/>
                        </button>
                    </div>
                </div>
            </div>
            <div className='px-2 w-1/2'>
                {children}
            </div>
        </div>
    )
}

const ResultAreaRouter = ({ state, dogResponse, activity, query, fetchNewActivity, updateQuery }) => {
    let imageSRC = (dogResponse !== undefined ? dogResponse.message : LoadingAnim);
    let copy = false;
    let showBGEffect = false;

    if (state === ResultState.ERROR) {
        imageSRC = SadDogGIF;
    }

    if (state === ResultState.RESULT) {
        copy=true;
        showBGEffect = true;
    }

    const SideBox = () => {
        if (state === ResultState.LOADING) {
            return (
                <div className='my-4 grid place-items-center items-center h-full'>
                    <div className="flex-col">
                        <h1 className="text-center text-black text-3xl font-extrabold">Loading...</h1>
                        <h2 className='text-center text-gray-600 text-xl'><i>we're playing fetch *pun intended*</i></h2>
                    </div>
                </div>
            );
        }
        if (state === ResultState.ERROR) {
            const SubComponent = ( { dogSuggestions } ) => {
                if (dogSuggestions === undefined) {
                    return (
                        <div></div>
                    )
                }

                return (
                    <div>
                        <h2 className='text-center text-gray-600 text-md'><i>Maybe you meant ...</i></h2>
                        <div className="w-full flex justify-center">
                            <div className="w-3/4">
                                <SuggestionBox updateQuery={updateQuery} suggestions={dogSuggestions} />
                            </div>
                        </div>
                    </div>
                )
            }

            return(
                <div className='my-4 grid place-items-center items-center h-full'>
                    <div className="flex-col">
                        <h1 className="text-center text-rose-500 text-3xl font-extrabold">Sorry, no doggos here</h1>
                        <SubComponent dogSuggestions={dogResponse} />
                    </div>
                </div>
            );
        }
        if (state === ResultState.RESULT) {
            return (
            <div className="w-full h-full flex flex-col">
                <div className='my-4 flex-col justify-center'>
                    <h1 className="text-center text-black text-3xl font-extrabold">Showing results for: </h1>
                    <h2 className='text-center text-gray-500 text-xl'><i>{query}</i></h2>
                </div>
                <div className="py-2 border-t flex-grow">
                    <Activity activity={activity} fetchNew={fetchNewActivity} />
                </div>
            </div>
            );
        }
    }

    return (
        <div className={(state === ResultState.NONE ? 'hidden ' : '')+"w-full flex justify-center"}>
            <ResultBox imageSRC={imageSRC} allowCopy={copy} backgroundEffect={showBGEffect}>
                <SideBox/>
            </ResultBox>
        </div>
    );
  }


export default ResultAreaRouter;
export { ResultState }