import React, { useState } from 'react';
import Header from "./Header";
import Footer from "./Footer";
import SearchBar from "./Search";
import ResultAreaRouter from "./SearchResult";
import { makeURLFriendly } from '../utils/StringFormatter';
import { ResultState } from './SearchResult';
import { APIPaths, fetchData } from '../utils/APIFetch';

const SearchArea = (props) => {

  return (
    <div className="flex-col">
      <div className="flex justify-center">
        <SearchBar setSearchVal={props.setSearchVal} searchVal={props.searchVal} placeholder={`try "terrier" or "american terrier"`} onSubmit={(query)=>{props.onSubmit(query)}} value={props.value}/>
      </div>
    </div>
  )
}

const App = () => {
  const [state, setState] = useState({
    curQuery: "",
    curResultState: ResultState.NONE,
    dogResponse: undefined,
    activityResponse: undefined,
  });
  const [activity, setActivity] = useState(undefined);
  const [searchVal, setSearchVal] = useState("");

  function onSearchSubmit(query) {
    setSearchVal(query);
    updateQueryResult(makeURLFriendly(query));
    fetchActivity();
  }

  function fetchActivity() {
    setActivity("loading");
    
    fetchData(APIPaths.BORED, "")
    .then((response) => {
      setActivity(response);
    })
  }

  function updateQueryResult(query) {
    setState({
      curQuery: query,
      curResultState: ResultState.LOADING,
      dogResponse: state.response,
    })

    fetchData(APIPaths.DOG, query)
    .then((response) => {
        setState({
          curQuery: query,
          curResultState: ResultState.RESULT,
          dogResponse: response,
        })
    })
    .catch(error => {
      if (error.response.status === 400) {
        setState({
          curQuery: query,
          curResultState: ResultState.ERROR,
          dogResponse: error.response.data,
        })
      } else {
        setState({
          curQuery: query,
          curResultState: ResultState.ERROR,
          dogResponse: undefined,
        })
      }
    });
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex justify-center">
        <SearchArea onSubmit={onSearchSubmit} setSearchVal={setSearchVal} searchVal={searchVal} />
      </div>

      <div className="mt-8 flex justify-center">
        <ResultAreaRouter updateQuery={onSearchSubmit} state={state.curResultState} dogResponse={state.dogResponse} query={state.curQuery} activity={activity} fetchNewActivity={fetchActivity} />
      </div>

      <Footer />
    </div >
  );
}

export default App;
