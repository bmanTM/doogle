import React, { useState } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

const Suggestions = ({ visible, suggestions, onSelect }) => {

    function onClick(e) {
        e.preventDefault();
        onSelect(e.target.innerHTML);
    }

    function onMouseDown(e) {
        e.preventDefault();
    }

    const SuggestionsList = () => {
        if (suggestions !== undefined) {
            return (
                <ul className="w-full bg-gray-300 rounded-b-xl overflow-hidden z-50">
                    {suggestions.map((searchSug, index) => {
                        return (
                            <li key={`${index}`} className="w-full border-b text-center first:border-t"><button onMouseDown={onMouseDown} onClick={onClick} className="text-rose-500 w-full py text-center hover:bg-gray-400 drop-shadow transition ease-in">{searchSug.predictedWord}</button></li>
                        )
                    })}
                </ul>
            )
        }

        return (
            <div></div>
        )
    }

    return (
        <div className={(visible ? "" : "hidden ")}>
            <ul className="w-full flex flex-col">
                <SuggestionsList />
            </ul>
        </div>
    )
}

const SearchBar = ({ onSubmit, placeholder, searchVal, setSearchVal }) => {
    const [wsClient, setWSClient] = useState(W3CWebSocket('ws://doogle-env.eba-ugdmui76.us-east-2.elasticbeanstalk.com:3011/api/ws/suggestions/dog', 'echo-protocol'));
    const [suggestionsActive, setSuggestionsActive] = useState(false);
    const [suggestions, setSuggestions] = useState(undefined);
    
    React.useEffect(() => {
        wsClient.onopen = () => {
            console.log('Websocket client connected');
        };
        wsClient.onerror = () => {
            console.log("ws client conneciton error");
        };
        wsClient.onmessage = (message) => {
            setSuggestions(JSON.parse(message.data));
        };
        wsClient.onclose = () => {
            console.log("connection to ws lost");
        }
    }, [])

    function onFormSubmit(e) {
        setSuggestionsActive(false);
        e.preventDefault();
        onSubmit(searchVal);
    }

    function onInputChange(e) {
        setSuggestionsActive(true);
        wsClient.send(e.target.value);
        setSearchVal(e.target.value);
    }

    function onSelect(value) {
        setSearchVal(value);
        setSuggestionsActive(false);
        onSubmit(value);
    }

    function onBlur(e) {
        setSuggestionsActive(false);
    }

    return (
        <div onBlur={onBlur} className='relative'>
            <form onSubmit={onFormSubmit} className="border-2 rounded-xl border-gray-400 overflow-hidden">
                <input value={searchVal} placeholder={placeholder} onChange={onInputChange} className="placeholder:italic w-72 outline-0 ml-2 text-gray-600"></input>
                <button type="submit" className="px-4 text-md border-gray-400 file:font-semibold text-gray-500 bg-red-300 
                py-1 m-2 rounded-lg hover:bg-red-400 hover:scale-110 hover:text-gray-600 transition">
                    Fetch
                </button>
            </form>
            <div className='absolute left-2 right-2'>
                <Suggestions visible={suggestionsActive && (suggestions !== undefined)} suggestions={suggestions} onSelect={onSelect} />
            </div>
        </div>
    )
}

export default SearchBar
