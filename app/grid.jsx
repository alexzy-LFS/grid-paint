import React, { useState } from 'react';

export default function grid() {
    const Grid = ({ rows, columns }) => {
      const [gridData, setGridData] = useState(Array(rows * columns).fill('transparent'));
    
      const handleCellClick = (index) => {
        const newGridData = [...gridData];
        newGridData[index] = getRandomColor();
        setGridData(newGridData);
      };
    
      const getRandomColor = () => {
        const colors = ['red', 'blue', 'green', 'yellow']; // Add more colors if needed
        return colors[Math.floor(Math.random() * colors.length)];
      };
    
      return (
        <div className="grid">
          {gridData.map((color, index) => (
            <div
              key={index}
              className="cell"
              style={{ backgroundColor: color }}
              onClick={() => handleCellClick(index)}
            />
          ))}
        </div>
      );
    };
}
