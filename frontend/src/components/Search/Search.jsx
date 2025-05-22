import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Search.css';


const Search = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
  
    const handleSearch = () => {
      if (query.trim()) {
        navigate(`/search?query=${query}`);
      }
    };
  
    const handleKeyEnter = (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    };
  
    return (
      <search-container>
        <search-inputField>
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyEnter}
          />
          <i class="bx bx-search" onClick={handleSearch}></i>
        </search-inputField>
      </search-container>
    );
  };
  

  export default Search;