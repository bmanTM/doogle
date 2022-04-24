
const SuggestionBox = ( { suggestions, updateQuery }) => {

    function fetchNewQuery(e) {
        e.preventDefault();
        updateQuery(e.target.innerHTML);
    }

    return (
        <div className="p-4 flex justify-center w-full">
            <ul className="w-full">
                {suggestions.map((searchSug, index) => {
                    return (
                        <li key={`${index}`} className="w-full border-b text-center first:border-t"><button onClick={fetchNewQuery} className="w-full py text-center hover:bg-gray-300 rounded-xl drop-shadow transition ease-in">{searchSug.predictedWord}</button></li>
                    )
                })}
            </ul>
        </div>
    )
}

export default SuggestionBox;