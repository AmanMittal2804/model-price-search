import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Autosuggest from 'react-autosuggest';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [result, setResult] = useState('');

  useEffect(() => {
    fetch('/data.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setData(results.data);
          }
        });
      });
  }, []);

  const normalizeString = (str) => {
    return str.replace(/\s+/g, '').toLowerCase();
  };

  const getSuggestions = (value) => {
    const inputValue = normalizeString(value);
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : data.flatMap(item => {
      const aliases = item.alias ? item.alias.split('/') : [];
      return [{ model: item.model }, ...aliases.map(alias => ({ model: alias.trim() }))];
    }).filter(item => normalizeString(item.model).includes(inputValue));
  };

  const getSuggestionValue = (suggestion) => suggestion.model;

  const renderSuggestion = (suggestion) => (
    <div>
      {suggestion.model}
    </div>
  );

  const onChange = (event, { newValue }) => {
    setValue(newValue);
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const searchModel = () => {
    const normalizedInput = normalizeString(value);
    const normalizedData = data.flatMap(item => {
      const aliases = item.alias ? item.alias.split('/') : [];
      return [
        { model: normalizeString(item.model), price: item.price }, 
        ...aliases.map(alias => ({ model: normalizeString(alias), price: item.price }))
      ];
    });

    const modelData = normalizedData.find(item => 
      item.model === normalizedInput
    );

    if (modelData) {
      setResult(`Price: ${modelData.price}`);
    } else {
      setResult('Model not found');
    }
  };

  const inputProps = {
    placeholder: 'Enter model name or alias',
    value,
    onChange: onChange
  };

  return (
    <div className="App">
      <h1>Search for Model Price</h1>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
      <button onClick={searchModel}>Search</button>
      <p>{result}</p>
    </div>
  );
}

export default App;
