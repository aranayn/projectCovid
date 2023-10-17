import axios from "axios";
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CountrySelect from "./countrySelect";
import { Bar } from 'react-chartjs-2';

export default function Chart() {
    const src = "https://opendata.ecdc.europa.eu/covid19/casedistribution/json/";
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [data, setData] = useState([]);
    const [chartData, setChartData] = useState({});

  useEffect(() => {
    //  if (startDate && endDate && selectedCountry) {
      axios
        .get(src)
        .then(data => {
          const records = data.data.records;

          const date = data.data.records.map(record => {
            const parts = record.dateRep.split('/'); // Разбиваем дату по "/"
            const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // Форматируем в "yyyy-mm-dd"
            return new Date(formattedDate);
            });
            const minDate = new Date(Math.min(...date));
            const maxDate = new Date(Math.max(...date));
      
            setStartDate(minDate);
            setEndDate(maxDate);

        //   const filteredData = records.filter(record => {
        //     const recordDate = new Date(record.dateRep);
        //     return (
        //         (!startDate || recordDate >= startDate) &&
        //         (!endDate || recordDate <= endDate) &&
        //          record.countriesAndTerritories === selectedCountry
        //     );
        //   });

        //   if (filteredData.length > 0) {
        //     const dates = filteredData.map(record => record.dateRep);
        //     const cases = filteredData.map(record => record.cases);

            
        //   setChartData({
        //     labels: dates,
        //     datasets: [{
        //       label: 'Количество случаев',
        //       data: cases,
        //       backgroundColor: 'rgba(75,192,192,0.4)',
        //       borderColor: 'rgba(75,192,192,1)',
        //       borderWidth: 1,
        //     }],

            
          });
          
    //     } else {
    //         setChartData({});
    //     }
    //     })
    //     .catch(error => console.error('Ошибка:', error));
    //  } else {
    //     setChartData({});
    //  }
    }, [startDate, endDate, selectedCountry]);

  return (
    <div>
     <div className="d-flex justify-content-between">
      <div className="row" style={{ margin: '20px' }}>
        <div className="col-md-4">
          <p className="mb-1">Период от</p>
        <DatePicker
          selected={startDate}
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
      </div>
      <div className="mb-3">
      <CountrySelect setSelectedCountry={setSelectedCountry}/>
      </div>

      {/* {selectedCountry && startDate && endDate && ( */}
        {/* <div>
          <Bar
            data={chartData}
            options={{
              scales: {
                x: { type: 'time', time: { unit: 'day' } },
                y: { beginAtZero: true }
              },
            }}
          />
        </div> */}
      {/* )} */}
    </div>
  );
}

