import { useState, useEffect } from "react";
import Table from "./components/table";
import './App.css'
import Chart from "./components/plot";

function App() {

  const [activeTab, setActiveTab] = useState('table');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  }

  return (
    <>
    <div className="app-container">   
        <button  
          className={`tab-button ${activeTab === 'table' ? 'active-tab-button' : ''}`}
          onClick={() => handleTabClick('table')}
        >
          Таблица
        </button>
        <button 
          className={`tab-button ${activeTab === 'chart' ? 'active-tab-button' : ''}`}
          onClick={() => handleTabClick('chart')}
        >
          График
        </button>
      </div>
      {activeTab === 'table' && <Table />}
      {activeTab === 'chart' && <Chart />} 
    </>
  );
}

export default App;
