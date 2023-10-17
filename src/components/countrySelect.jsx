import React, { useState, useEffect } from 'react';
import './plot.css'; 

import axios from "axios";


function CountrySelect() {

    const src = "https://opendata.ecdc.europa.eu/covid19/casedistribution/json/"
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");

    useEffect(()=>{
        axios
          .get(src)
          .then(data => { 
            const countryNames = [...new Set(data.data.records.map(record => record.countriesAndTerritories))];
            setCountries(countryNames);
         })
        .catch(error => console.error('Ошибка:', error));
  
    },[])

    const handleCountryChange = (event) => {
        setSelectedCountry(event.target.value);
      }

      return (
        <div>
          <select
            className="form-select"
            value={selectedCountry}
            onChange={handleCountryChange}
          >
            <option value="">Выберите страну</option>
            {countries.map((country, index) => (
              <option key={index} value={country}>{country}</option>
            ))}
          </select>
          {selectedCountry && (
            <p>Выбранная страна: {selectedCountry}</p>
          )}
        </div>
      );
}

export default CountrySelect;
