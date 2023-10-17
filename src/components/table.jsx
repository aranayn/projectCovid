import axios from "axios";
import React, { useState, useEffect } from 'react';
import ReactPaginate from "react-paginate";
import './table.css'
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import 'bootstrap/dist/css/bootstrap.min.css';

const DropdownFilter = ({ options, selectedOption, onSelect }) => {
  return (
    <select value={selectedOption} onChange={(e) => onSelect(e.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

const RangeFilter = ({ min, max, from, to, onFromChange, onToChange }) => {
  return (
    <div>
      <input
        type="number"
        value={from}
        onChange={(e) => onFromChange(Number(e.target.value))}
      />
      <span> - </span>
      <input
        type="number"
        value={to}
        onChange={(e) => onToChange(Number(e.target.value))}
      />
    </div>
  );
};

export default function Table() {

  const src = "https://opendata.ecdc.europa.eu/covid19/casedistribution/json/"
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState('');  
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const filterOptions = ['Количество случаев','Количество смертей',
  'Количество случаев всего', 'Количество смертей всего',
  'Количество случаев на 1000 жителей','Количество смертей на 1000 жителей'];

  useEffect(()=>{
 
      axios
        .get(src)
        .then(data => {  
          setRecords(data.data.records);

          const dates = data.data.records.map(record => {
            const parts = record.dateRep.split('/'); 
            const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; 
            return new Date(formattedDate);
          });
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
    
          setStartDate(minDate);
          setEndDate(maxDate);
        })
      .catch(error => console.error('Ошибка:', error));
    }, []);

    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 20;
    const offset = currentPage * itemsPerPage;
    const [searchQuery, setSearchQuery] = useState('');  


//суммы случаев всего
const groupedDataCases = {};
records.forEach(record => {
  if (groupedDataCases[record.countryterritoryCode]) {
    groupedDataCases[record.countryterritoryCode] += record.cases;
  } else {
    groupedDataCases[record.countryterritoryCode] = record.cases;
  }
});

const groupedDataDeaths = {};
records.forEach(record => {
  if (groupedDataDeaths[record.countryterritoryCode]) {
    groupedDataDeaths[record.countryterritoryCode] += record.deaths;
  } else {
    groupedDataDeaths[record.countryterritoryCode] = record.deaths;
  }
});


// суммы случаев за указанный период
const totalCases = {};
records.forEach(record => {
  const recordDate = new Date(record.dateRep);
  if (recordDate >= startDate && recordDate <= endDate) {
    if (!totalCases[record.countryterritoryCode]) {
      totalCases[record.countryterritoryCode] = 0;
    }
    totalCases[record.countryterritoryCode] += record.cases;
  }
});

const totalDeaths = {};
records.forEach(record => {
  const recordDate = new Date(record.dateRep);
  if (recordDate >= startDate && recordDate <= endDate) {
    if (!totalDeaths[record.countryterritoryCode]) {
      totalDeaths[record.countryterritoryCode] = 0;
    }
    totalDeaths[record.countryterritoryCode] += record.deaths;
  }
});


//фильтрация по дате
const filteredbyDate = records.filter(record => {
  if (selectedColumn === 'Количество случаев') {
    return totalCases[record.countryterritoryCode] >= fromValue && totalCases[record.countryterritoryCode] <= toValue;
  } else if (selectedColumn === 'Количество смертей') {
    return totalDeaths[record.countryterritoryCode] >= fromValue && totalDeaths[record.countryterritoryCode] <= toValue;
  } else if (selectedColumn === 'Количество случаев всего') {
    return groupedDataCases[record.countryterritoryCode] >= fromValue && groupedDataCases[record.countryterritoryCode] <= toValue;
  } else if (selectedColumn === 'Количество смертей всего') {
    return groupedDataDeaths[record.countryterritoryCode] >= fromValue && groupedDataDeaths[record.countryterritoryCode] <= toValue;
  } else if (selectedColumn === 'Количество случаев на 1000 жителей') {
    return (record.cases/record.popData2019*1000).toFixed(5) >= fromValue && (record.cases/record.popData2019*1000).toFixed(5) <= toValue;
  } else if (selectedColumn === 'Количество смертей на 1000 жителей') {
    return (record.deaths/record.popData2019*1000).toFixed(5) >= fromValue && (record.deaths/record.popData2019*1000).toFixed(5) <= toValue;
  } 
  const recordDate = new Date(record.dateRep);
  return (
    (!startDate || recordDate >= startDate) &&
    (!endDate || recordDate <= endDate)
  );
  });


//пагинация
const handlePageClick = page => {
  setCurrentPage(page.selected);
};
const handleSearchChange = event => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
}

//фильтрация по поиску
const filteredData = filteredbyDate.filter(record => {
  return record.countriesAndTerritories.toLowerCase().includes(searchQuery.toLowerCase());
});
const currentData = filteredData.slice(offset, offset + itemsPerPage);

const hasData = currentData.length > 0;

const handleColumnChange = (selectedValue) => {
  setSelectedColumn(selectedValue);
};

const handleFromValueChange = (value) => {
  setFromValue(value);
};

const handleToValueChange = (value) => {
  setToValue(value);
};

//сброс настроек
const handleResetFilters = () => {
  
  axios
  .get(src)
  .then(data => {
    setRecords(data.data.records);

    const dates = data.data.records.map(record => {
      const parts = record.dateRep.split('/');
      const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      return new Date(formattedDate);
    });
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    setStartDate(minDate);
    setEndDate(maxDate);
  })
  .catch(error => console.error('Ошибка:', error));
  setSearchQuery('');
  setCurrentPage(0);
  setToValue('');
  setFromValue('');
  setSelectedColumn('');
};

  return (
    <div>
      <div className="d-flex justify-content-between">
      <div className="row" style={{ margin: '20px' }}>
        <div className="col-md-4">
          <p className="mb-1">Период от</p>
        <DatePicker
          selected={startDate}
          defaultValue={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Начальная дата"
          className="form-control"    
        />
        </div>
        <div className="col-md-4">
          <p className="mb-1">до</p>
        <DatePicker
          selected={endDate}
          defaultValue={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="Конечная дата"
          className="form-control"
        />
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center my-3">
      <div className="dropdown-filter">  
      <DropdownFilter
        options={filterOptions}
        selectedOption={selectedColumn}
        onSelect={setSelectedColumn}
      />
      </div>
      <div className="range-filter">
      <RangeFilter
        from={fromValue}
        to={toValue}
        onFromChange={handleFromValueChange}
        onToChange={handleToValueChange}
        />
        </div>
      </div>
      <div style={{ margin: '20px' }}>
        <button className="btn btn-primary mt-3" onClick={handleResetFilters}>
          Сбросить фильтры
        </button>
      </div>
      </div> 
      <div style={{ margin: '20px' }}>
        <input
          type="text"
          className="form-control"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Поиск по стране"
          aria-label="Поиск по стране"
          aria-describedby="button-addon2"
        />
      </div>
      <div className="container mt-5">
      {hasData ? (
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              <th scope="col">Страна</th>
              <th scope="col"> date</th>
              <th scope="col">Количество случаев</th>
              <th scope="col">Количество смертей</th>
              <th scope="col">Количество случаев всего</th>
              <th scope="col">Количество смертей всего</th>
              <th scope="col">Количество случаев на 1000 жителей</th>
              <th scope="col">Количество смертей на 1000 жителей</th>
            </tr>
          </thead>
          <tbody>
              {currentData.map(record => (
              <tr>
                <td>{record.countriesAndTerritories}</td>
                <td>{record.dateRep}</td>
                <td>{totalCases[record.countryterritoryCode]}</td>
                <td>{totalDeaths[record.countryterritoryCode]}</td>
                <td >{groupedDataCases[record.countryterritoryCode]}</td>
                <td >{groupedDataDeaths[record.countryterritoryCode]}</td>
                <td>{(record.cases/record.popData2019*1000).toFixed(5) || 0}</td>
                <td>{(record.deaths/record.popData2019*1000).toFixed(5) || 0}</td>
                </tr>
                ))}
          </tbody>
        </table>
        ) : (
          <p>Ничего не найдено</p>
        )}
       </div> 
        <ReactPaginate
          previousLabel={'← Предыдущая'}
          nextLabel={'Следующая →'}
          breakLabel={'...'}
          pageCount={Math.ceil(records.length / itemsPerPage)}
          onPageChange={handlePageClick}
          containerClassName={'pagination justify-content-center'}
          activeClassName={'active'}
          forcePage={currentPage}
        />
    </div>
  );
}

