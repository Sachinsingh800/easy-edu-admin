import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registering chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChartWidget = () => {
  // Data for the chart
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        pointRadius: 5, // Custom point radius for better visibility
        pointHoverRadius: 7, // Larger point on hover
        borderWidth: 2, // Slightly thicker border
        tension: 0.4, // Smooth the line
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14, // Slightly larger font size for legend
            weight: 'bold',
            family: 'Arial, sans-serif',
          },
          color: '#333', // Darker color for legend text
        },
      },
      title: {
        display: true,
        text: 'Monthly Sales Data',
        font: {
          size: 20,
          weight: 'bold',
          family: 'Arial, sans-serif',
        },
        color: '#1A237E', // Professional blue color
        padding: {
          bottom: 20, // Extra padding for spacing
        },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Smooth curve for the line
      },
      point: {
        radius: 5, // Custom point size
        hoverRadius: 7, // Larger hover radius
        hoverBackgroundColor: 'rgba(75,192,192,1)', // Hover effect for the points
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 14, // Slightly larger font size for X-axis labels
          },
        },
      },
      y: {
        ticks: {
          font: {
            size: 14, // Slightly larger font size for Y-axis labels
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)', // Smooth shadow for depth
        maxWidth: '800px', // Limit the widget's width
        margin: '0 auto', // Center the widget horizontally
        boxSizing: 'border-box', // Ensure padding is inside the container
      }}
    >
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChartWidget;
