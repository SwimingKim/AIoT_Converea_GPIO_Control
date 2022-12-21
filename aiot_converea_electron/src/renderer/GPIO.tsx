import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dlog, getConfig, isDebug } from 'utils/dev';
import Base from './Base';
import { Button, Checkbox, CheckboxProps, Header } from 'semantic-ui-react';
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
import { Line } from 'react-chartjs-2';
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
        <Line
          options={{
            // elements: {
            //   line: {
            //     tension: 0.5,
            //   },
            // },
            responsive: true,
            animation: false,
            // plugins: {
            //   streaming: {
            //     frameRate: 5
            //   }
            // },
            scales: {
              x: {
                type: 'realtime',
                realtime: {
                  delay: 2000,
                },
                time: {
                  unit: "second"
                }
              },
              y: {
                type: 'linear',
                max: 100,
              },
              y1: {
                type: 'linear',
                position: 'right',
                min: 0,
                max: 12,
              },
            },
            interaction: {
              intersect: false,
            },
          }}
          data={{
            labels: chartData.date,
            datasets: [
              {
                label: 'temp',
                data: chartData.temp,
                borderColor: '#0088FE',
                backgroundColor: '#0088FE',
                type: 'line',
              },
              {
                label: 'humidity',
                data: chartData.humidity,
                borderColor: '#00C49F',
                backgroundColor: '#00C49F',
                type: 'line',
              },
              {
                label: 'turbidity',
                data: chartData.turbidity,
                borderColor: '#FFBB28',
                backgroundColor: '#FFBB28',
                type: 'line',
                borderDash: [5, 5],
                yAxisID: 'y1'
              },
              {
                label: 'ph',
                data: chartData.ph,
                borderColor: '#FF8042',
                backgroundColor: '#FF8042',
                type: 'line',
                borderDash: [5, 5],
                yAxisID: 'y1'
              },
              {
                label: 'liquid_level',
                data: chartData.liquid_level,
                borderColor: '#C92A2A',
                backgroundColor: '#C92A2A',
                stepped: true,
                borderDash: [5, 5],
                yAxisID: 'y1'
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
