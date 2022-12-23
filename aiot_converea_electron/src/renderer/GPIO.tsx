import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dlog, getConfig, isDebug } from 'utils/dev';
import Base from './Base';
import { Button, Checkbox, CheckboxProps, Header } from 'semantic-ui-react';
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
} from 'chart.js';
import { Chart as RChart } from 'react-chartjs-2';
import { RealTimeScale, StreamingPlugin } from 'chartjs-plugin-streaming';
import 'chartjs-adapter-moment';
import 'chartjs-adapter-luxon';

const numberOrNull = (value: any, format: number = 2) => {
  if (typeof value == 'number') {
    return Number(value).toFixed(format);
  } else {
    return 'None';
  }
};

type ChartDataType = {
  date: Date[];
  temp: number[];
  humidity: number[];
  turbidity: number[];
  ph: number[];
  liquid_level: number[];
};

Chart.register(
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

function GPIO() {
  const [input, setInput] = useState({
    temp: null,
    humidity: null,
    turbidity: null,
    ph: null,
    liquid_level: null,
  });
  const [output, setOutput] = useState({
    fan: {
      enable: true,
      value: false,
    },
    pump: {
      enable: true,
      value: false,
    },
  });

  const [chartData, setChartData] = useState({
    date: [],
    temp: [],
    humidity: [],
    turbidity: [],
    ph: [],
    liquid_level: [],
  } as ChartDataType);

  const onToggleOption = (
    event: React.FormEvent<HTMLInputElement>,
    data: CheckboxProps
  ) => {
    const { name, checked } = data;
    dlog(name, checked);

    setOutput({
      ...output,
      [name]: {
        ...output[name],
        enable: false,
      },
    });

    const pin = JSON.parse(getConfig() as any)[name as any];
    window.electron.ipcRenderer.output(
      [pin, checked ? 1 : 0],
      (data: string) => {
        const json = JSON.parse(data);
        const success = json['result'] == true;
        if ((success && !isDebug()) || (!success && isDebug())) {
          setOutput({
            ...output,
            [name]: {
              enable: true,
              value: json['data'] == 1,
            },
          });
        }
      }
    );
  };

  useEffect(() => {
    const pin = JSON.parse(getConfig() as any);
    window.electron.ipcRenderer.input(
      [2, pin['dht22'], pin['turbidity'], pin['ph'], pin['liquid_level']],
      (data: string) => {
        const json = JSON.parse(data);
        dlog(json, json['data']);
        const success = json['result'] == true;
        if ((success && !isDebug()) || (!success && isDebug())) {
          setInput(json['data']);
        }
      }
    );

    window.electron.ipcRenderer.state(
      [pin['fan'], pin['pump']],
      (data: string) => {
        const json = JSON.parse(data);
        dlog(json, json['data']);
        const success = json['result'] == true;
        if ((success && !isDebug()) || (!success && isDebug())) {
          setOutput({
            fan: {
              ...output['fan'],
              value: json['data'][0] == 1,
            },
            pump: {
              ...output['pump'],
              value: json['data'][1] == 1,
            },
          });
        }
      }
    );

    return () => {
      window.electron.ipcRenderer.kill();
    };
  }, []);

  const getArrangeNumber = (value: number | null, size: number) => {
    if (value == null) return 0;
    return Number(value.toFixed(size));
  };

  useEffect(() => {
    // if (chartData.date.length > 10) {
    //   chartData.date.shift();
    //   chartData.temp.shift();
    //   chartData.humidity.shift();
    //   chartData.turbidity.shift();
    //   chartData.liquid_level.shift();
    // }

    if (
      input.temp == null &&
      input.humidity == null &&
      input.turbidity == null &&
      input.ph == null &&
      input.liquid_level == null
    )
      return;

    let newData = {
      date: [...chartData['date'], new Date()],
      temp: [...chartData['temp'], getArrangeNumber(input.temp, 2)],
      humidity: [...chartData['humidity'], getArrangeNumber(input.humidity, 2)],
      turbidity: [
        ...chartData['turbidity'],
        getArrangeNumber(input.turbidity, 2),
      ],
      ph: [...chartData['ph'], getArrangeNumber(input.ph, 2)],
      liquid_level: [
        ...chartData['liquid_level'],
        getArrangeNumber(input.liquid_level, 2),
      ],
    };

    setChartData(newData);
  }, [input]);

  return Base({
    top_right_layout: (
      <Link to="/settings">
        <Button icon="cog" floated="right" />
      </Link>
    ),
    sensor_layout: (
      <>
        <Header as="h4" textAlign="center">
          {/* {input.temp} */}
          {numberOrNull(input.temp)}
        </Header>
        <Header as="h4" textAlign="center">
          {numberOrNull(input.humidity)}
        </Header>
        <Header as="h4" textAlign="center">
          {numberOrNull(input.turbidity)}
        </Header>
        <Header as="h4" textAlign="center">
          {numberOrNull(input.ph)}
        </Header>
        <Header as="h4" textAlign="center">
          {numberOrNull(input.liquid_level, 0)}
        </Header>
      </>
    ),
    motor_layout: (
      <>
        <Checkbox
          toggle
          name="fan"
          checked={output.fan.value}
          onChange={onToggleOption}
        />
        <p />
        <Checkbox
          toggle
          name="pump"
          checked={output.pump.value}
          onChange={onToggleOption}
        />
      </>
    ),
    button_layout: <></>,
    bottom_layout: (
      <>
        <RChart
          type="bar"
          options={{
            // responsive: true,
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
                max: 12,
                stack: 'demo',
                stackWeight: 2,
                beginAtZero: false,
                ticks: {
                  color: 'rgb(1,111,170)',
                  count: 3,
                },
                grid: {
                  color: 'rgb(1,111,170)',
                  lineWidth: 0.2,
                },
              },
              y2: {
                type: 'category',
                labels: ['ON', 'OFF'],
                offset: true,
                position: 'left',
                stack: 'demo',
                stackWeight: 1,
                // grid: {
                //   borderColor: Utils.CHART_COLORS.blue,
                // },
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
                // borderDash: [5, 5],
                yAxisID: 'y1',
              },
              {
                label: 'ph',
                data: chartData.ph,
                type: 'line',
                borderColor: 'rgb(104,202,254)',
                backgroundColor: 'rgb(104,202,254)',
                // borderDash: [5, 5],
                yAxisID: 'y1',
              },
              {
                label: 'liquid_level',
                data: chartData.liquid_level,
                // borderColor: 'rgb(229,197,212)',
                // backgroundColor: 'rgb(229,197,212)',
                stepped: true,
                type: 'line',
                borderColor: '#bebebe',
                backgroundColor: '#bebebe',
                // borderDash: [5, 5],
                yAxisID: 'y2',
              },
              {
                label: 'temp',
                data: chartData.temp,
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
      </>
    ),
    top_margin: 0,
  });
}

export default GPIO;
