import React, { useEffect, useState } from 'react';
import {
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  registerables,
} from 'chart.js';
import { Chart as RChart } from 'react-chartjs-2';
import { RealTimeScale, StreamingPlugin } from 'chartjs-plugin-streaming';
import 'chartjs-adapter-moment';
import 'chartjs-adapter-luxon';
import { InputDataType } from './GPIO';

Chart.register(
  ...registerables,
  StreamingPlugin,
  RealTimeScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type ChartDataType = {
  date: Date[];
  temperature: number[];
  humidity: number[];
  turbidity: number[];
  ph: number[];
  water_level: number[];
};

const getArrangeNumber = (value: number | null, size: number) => {
  if (value == null) return 0;
  return Number(value.toFixed(size));
};

function SensorChart({ input }: { input: InputDataType }) {
  const [chartData, setChartData] = useState({
    date: [],
    temperature: [],
    humidity: [],
    turbidity: [],
    ph: [],
    water_level: [],
  } as ChartDataType);

  useEffect(() => {
    // if (chartData.date.length > 10) {
    //   chartData.date.shift();
    //   chartData.temperature.shift();
    //   chartData.humidity.shift();
    //   chartData.turbidity.shift();
    //   chartData.water_level.shift();
    // }

    if (
      input.temperature == null &&
      input.humidity == null &&
      input.turbidity == null &&
      input.ph == null &&
      input.water_level == null
    )
      return;

    let newData = {
      date: [...chartData['date'], new Date()],
      temperature: [
        ...chartData['temperature'],
        getArrangeNumber(input.temperature, 2),
      ],
      humidity: [...chartData['humidity'], getArrangeNumber(input.humidity, 2)],
      turbidity: [
        ...chartData['turbidity'],
        getArrangeNumber(input.turbidity, 2),
      ],
      ph: [...chartData['ph'], getArrangeNumber(input.ph, 2)],
      water_level: [
        ...chartData['water_level'],
        getArrangeNumber(input.water_level, 2),
      ],
    };

    setChartData(newData);
  }, [input]);

  return (
    <RChart
      type="bar"
      options={{
        responsive: true,
        animation: false,
        aspectRatio: 3,
        scales: {
          x: {
            type: 'realtime',
            realtime: {
              delay: 2000,
            },
            time: {
              unit: 'second',
            },
          },
          y: {
            type: 'linear',
            position: 'right',
            min: 0,
            max: 100,
            // stackWeight
            // stack: 20,
            // stackWeight: 20,
            beginAtZero: true,
            ticks: {
              color: 'rgb(142,63,100)',
              count: 6,
            },
            grid: {
              color: 'rgb(142,63,100)',
              lineWidth: 0.2,
            },
          },
          y1: {
            type: 'linear',
            position: 'left',
            min: 0,
            max: 20,
            stack: 'demo',
            stackWeight: 2,
            beginAtZero: false,
            ticks: {
              color: 'rgb(1,111,170)',
              count: 5,
            },
            grid: {
              color: 'rgb(1,111,170)',
              lineWidth: 0.2,
            },
          },
          y2: {
            type: 'linear',
            // labels: ['ON', 'OFF'],
            // labels: ['1', '0'],
            min: 0,
            max: 1,
            offset: true,
            position: 'left',
            stack: 'demo',
            stackWeight: 1,
            ticks: {
              count: 2,
            },
          },
        },
        interaction: {
          mode: 'index',
          intersect: true,
        },
      }}
      data={{
        labels: chartData.date,
        datasets: [
          {
            label: 'turbidity',
            data: chartData.turbidity,
            borderColor: 'rgb(1,144,221)',
            backgroundColor: 'rgb(1,144,221)',
            type: 'line',
            yAxisID: 'y1',
          },
          {
            label: 'ph',
            data: chartData.ph,
            type: 'line',
            borderColor: 'rgb(104,202,254)',
            backgroundColor: 'rgb(104,202,254)',
            yAxisID: 'y1',
          },
          {
            label: 'water_level',
            data: chartData.water_level,
            stepped: true,
            type: 'line',
            borderColor: '#bebebe',
            backgroundColor: '#bebebe',
            yAxisID: 'y2',
          },
          {
            label: 'temperature',
            data: chartData.temperature,
            type: 'bar',
            borderColor: 'rgb(219,173,195)',
            backgroundColor: 'rgb(219,173,195)',
          },
          {
            label: 'humidity',
            data: chartData.humidity,
            type: 'bar',
            borderColor: 'rgb(203,138,169)',
            backgroundColor: 'rgb(203,138,169)',
          },
        ],
      }}
    />
  );
}

export default SensorChart;
