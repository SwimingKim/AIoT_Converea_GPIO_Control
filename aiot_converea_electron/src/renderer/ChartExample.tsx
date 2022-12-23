import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { RealTimeScale, StreamingPlugin } from 'chartjs-plugin-streaming';
import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';

Chart.register(
  StreamingPlugin,
  RealTimeScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ChartExample() {
  return (
    <Line
      data={{
        datasets: [
          {
            label: 'Dataset 1',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [8, 4],
            fill: true,
            data: [],
          },
          {
            label: 'Dataset 2',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            cubicInterpolationMode: 'monotone',
            fill: true,
            data: [],
          },
        ],
      }}
      options={{
        scales: {
          x: {
            type: 'realtime',
            realtime: {
              delay: 2000,
              onRefresh: (chart) => {
                chart.data.datasets.forEach((dataset) => {
                  dataset.data.push({
                    x: Date.now(),
                    y: Math.random(),
                  });
                });
              },
            },
          },
        },
      }}
    />
  );
}

export default ChartExample;
