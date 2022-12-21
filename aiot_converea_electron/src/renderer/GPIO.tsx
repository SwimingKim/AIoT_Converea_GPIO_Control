import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { dlog, getConfig, isDebug } from 'utils/dev';
import Base from './Base';
import ReactApexChart from 'react-apexcharts';
import { Button, Checkbox, Header } from 'semantic-ui-react';

const numberOrNull = (value: any, format: number = 2) => {
  if (typeof value == 'number') {
    return Number(value).toFixed(format);
  } else {
    return 'None';
  }
};

type ChartDataType = {
  temp: number[];
  humidity: number[];
  turbidity: number[];
  ph: number[];
  liquid_level: number[];
};

var data = [];
var TICKINTERVAL = 86400000;
let XAXISRANGE = 777600000;
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
    temp: [],
    humidity: [],
    turbidity: [],
    ph: [],
    liquid_level: [],
  } as ChartDataType);

  const onToggleOption = (
    event: React.FormEvent<HTMLInputElement>,
    data: { name: 'fan' | 'pump'; checked: boolean }
  ) => {
    // dlog(event, data)
    const { name, checked } = data;
    dlog(name, checked);

    setOutput({
      ...output,
      [name]: {
        ...output[name],
        enable: false,
      },
    });

    const pin = JSON.parse(getConfig() as any)[name];
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
    let newData = {
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
    ApexCharts.exec('realtime', 'updateSeries', [
      { data: chartData.temp },
      { data: chartData.humidity },
      { data: chartData.turbidity },
      { data: chartData.ph },
      { data: chartData.liquid_level },
    ]);
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
        {/* '#0088FE', '#00C49F', '#FFBB28', '#FF8042' */}
        <ReactApexChart
          series={[
            {
              name: 'temp',
              data: chartData.temp,
            },
            {
              name: 'humidity',
              data: chartData.humidity,
            },
            {
              name: 'turbidity',
              data: chartData.turbidity,
            },
            {
              name: 'ph',
              data: chartData.ph,
            },
            {
              name: 'liquid_level',
              data: chartData.liquid_level,
            },
          ]}
          options={{
            chart: {
              id: 'realtime',
              height: 150,
              type: 'line',
              animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                  // speed: 1000,
                },
              },
              toolbar: {
                show: false,
              },
              zoom: {
                enabled: false,
              },
            },
            dataLabels: {
              enabled: false,
            },
            stroke: {
              curve: 'smooth',
            },
            markers: {
              size: 0,
            },
            xaxis: {
              range: 10,
              tooltip: {
                enabled: false
              },
              labels: {
                show: false
              }
            },
            yaxis: {
              max: 100,
            },
            legend: {
              show: true,
              position: 'top'
            },
          }}
        />
      </>
    ),
    top_margin: 0,
  });
}

export default GPIO;
